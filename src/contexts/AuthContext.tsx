"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  createUserWithEmailAndPassword,
  getAdditionalUserInfo,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
  type User as FirebaseUser,
} from "firebase/auth";
import { auth, ensureAuthPersistence, googleProvider } from "@/lib/firebase";
import { login as apiLogin, type AuthUser } from "@/lib/api";

type AuthAction = "email-login" | "email-register" | "google" | "facebook" | "reset" | "logout";

type SessionSyncOptions = {
  authProvider: "EMAIL_LOGIN" | "EMAIL_REGISTER";
  identityProvider?: string;
  firstName?: string;
  lastName?: string;
  isNewUser?: boolean;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  initialized: boolean;
  busyAction: AuthAction | null;
  loginWithEmail: (input: { email: string; password: string }) => Promise<AuthUser>;
  registerWithEmail: (input: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => Promise<AuthUser>;
  loginWithGoogle: () => Promise<AuthUser>;
  sendPasswordReset: (email: string) => Promise<string>;
  updateSessionUser: (updates: Partial<AuthUser>) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "auth_user";

function readStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as AuthUser;
    return parsed?.token ? parsed : null;
  } catch {
    return null;
  }
}

function writeStoredUser(user: AuthUser | null) {
  if (typeof window === "undefined") return;

  if (!user) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

function splitDisplayName(displayName: string | null | undefined) {
  const trimmed = displayName?.trim();
  if (!trimmed) return { firstName: "", lastName: "" };

  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "Member" };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

function fallbackNamesFromEmail(email: string) {
  const localPart = email.split("@")[0] ?? "member";
  const cleaned = localPart.replace(/[^a-zA-Z0-9]+/g, " ").trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return { firstName: "Fashion", lastName: "Member" };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" ") || "Member",
  };
}

function resolveProfileNames(
  firebaseUser: FirebaseUser,
  overrides: { firstName?: string; lastName?: string } = {}
) {
  const trimmedFirstName = overrides.firstName?.trim();
  const trimmedLastName = overrides.lastName?.trim();

  if (trimmedFirstName && trimmedLastName) {
    return { firstName: trimmedFirstName, lastName: trimmedLastName };
  }

  const displayNameParts = splitDisplayName(firebaseUser.displayName);
  if (displayNameParts.firstName) {
    return {
      firstName: trimmedFirstName || displayNameParts.firstName,
      lastName: trimmedLastName || displayNameParts.lastName,
    };
  }

  return fallbackNamesFromEmail(firebaseUser.email ?? "");
}

function resolveIdentityProvider(firebaseUser: FirebaseUser) {
  const providerIds = [
    firebaseUser.providerId,
    ...firebaseUser.providerData.map((provider) => provider.providerId),
  ];

  if (providerIds.includes("google.com")) return "google.com";
  if (providerIds.includes("facebook.com")) return "facebook.com";
  return "password";
}

function getAuthErrorMessage(error: unknown) {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String(error.code)
      : "";

  switch (code) {
    case "auth/email-already-in-use":
      return "An account already exists for this email address.";
    case "auth/invalid-email":
      return "Enter a valid email address.";
    case "auth/weak-password":
      return "Your password must be at least 6 characters.";
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "Your email or password looks incorrect.";
    case "auth/popup-closed-by-user":
      return "The social sign-in window was closed. Please try again.";
    case "auth/popup-blocked":
      return "Your browser blocked the popup. Please allow popups and try again.";
    case "auth/account-exists-with-different-credential":
      return "This email is already connected to a different sign-in method.";
    case "auth/too-many-requests":
      return "Too many attempts were made. Please wait a few minutes and try again.";
    case "auth/network-request-failed":
      return "We could not reach the network. Check your connection and try again.";
    case "auth/operation-not-allowed":
      return "This sign-in method is not enabled in Firebase yet.";
    case "auth/unauthorized-domain":
      return "This domain has not been authorized in Firebase Authentication.";
    default:
      if (error instanceof Error && error.message.trim()) {
        return error.message;
      }
      return "An unexpected authentication error occurred.";
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [busyAction, setBusyAction] = useState<AuthAction | null>(null);
  const [initialized, setInitialized] = useState(false);
  const userRef = useRef<AuthUser | null>(null);
  const interactiveAuthRef = useRef(false);

  const setSessionUser = useCallback((nextUser: AuthUser | null) => {
    userRef.current = nextUser;
    setUser(nextUser);
    writeStoredUser(nextUser);
  }, []);

  const clearSession = useCallback(() => {
    setSessionUser(null);
  }, [setSessionUser]);

  const updateSessionUser = useCallback(
    (updates: Partial<AuthUser>) => {
      const currentUser = userRef.current;
      if (!currentUser) return;

      setSessionUser({
        ...currentUser,
        ...updates,
      });
    },
    [setSessionUser]
  );

  const syncBackendSession = useCallback(
    async (firebaseUser: FirebaseUser, options: SessionSyncOptions): Promise<AuthUser> => {
      const email = firebaseUser.email?.trim();
      if (!email) {
        throw new Error("No usable email address was found on the Firebase account.");
      }

      const identityProvider = options.identityProvider ?? resolveIdentityProvider(firebaseUser);
      const names = resolveProfileNames(firebaseUser, {
        firstName: options.firstName,
        lastName: options.lastName,
      });
      const firebaseIdToken = await firebaseUser.getIdToken();

      const backendUser = await apiLogin({
        email,
        firstName: names.firstName,
        lastName: names.lastName,
        authProvider: options.authProvider,
        identityProvider,
        firebaseUid: firebaseUser.uid,
        firebaseIdToken,
        avatarUrl: firebaseUser.photoURL ?? undefined,
        isNewUser: options.isNewUser,
      });

      const sessionUser: AuthUser = {
        ...backendUser,
        email,
        firstName: backendUser.firstName || names.firstName,
        lastName: backendUser.lastName || names.lastName,
        authProvider: options.authProvider,
        identityProvider,
        firebaseUid: firebaseUser.uid,
        avatarUrl: firebaseUser.photoURL ?? undefined,
      };

      setSessionUser(sessionUser);
      return sessionUser;
    },
    [setSessionUser]
  );

  useEffect(() => {
    const storedUser = readStoredUser();
    if (storedUser) {
      userRef.current = storedUser;
      setUser(storedUser);
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (interactiveAuthRef.current) {
        setInitialized(true);
        return;
      }

      if (!firebaseUser) {
        clearSession();
        setInitialized(true);
        return;
      }

      const currentUser = userRef.current;
      if (
        currentUser &&
        currentUser.token &&
        currentUser.firebaseUid === firebaseUser.uid &&
        currentUser.email === firebaseUser.email
      ) {
        setInitialized(true);
        return;
      }

      try {
        await syncBackendSession(firebaseUser, { authProvider: "EMAIL_LOGIN" });
      } catch (error) {
        console.error(error);
        await firebaseSignOut(auth).catch(() => undefined);
        clearSession();
      } finally {
        setInitialized(true);
      }
    });

    return unsubscribe;
  }, [clearSession, syncBackendSession]);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const loginWithEmail = useCallback(
    async ({ email, password }: { email: string; password: string }): Promise<AuthUser> => {
      setBusyAction("email-login");
      interactiveAuthRef.current = true;
      let signedInUser: FirebaseUser | null = null;

      try {
        await ensureAuthPersistence();
        const result = await signInWithEmailAndPassword(auth, email.trim(), password);
        signedInUser = result.user;

        return await syncBackendSession(result.user, {
          authProvider: "EMAIL_LOGIN",
          identityProvider: "password",
          isNewUser: false,
        });
      } catch (error) {
        if (signedInUser) {
          await firebaseSignOut(auth).catch(() => undefined);
          clearSession();
        }
        throw new Error(getAuthErrorMessage(error));
      } finally {
        interactiveAuthRef.current = false;
        setBusyAction(null);
        setInitialized(true);
      }
    },
    [clearSession, syncBackendSession]
  );

  const registerWithEmail = useCallback(
    async ({
      email,
      password,
      firstName,
      lastName,
    }: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
    }): Promise<AuthUser> => {
      setBusyAction("email-register");
      interactiveAuthRef.current = true;
      let createdUser: FirebaseUser | null = null;

      try {
        await ensureAuthPersistence();
        const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
        createdUser = result.user;

        await updateProfile(result.user, {
          displayName: `${firstName.trim()} ${lastName.trim()}`.trim(),
        });

        return await syncBackendSession(result.user, {
          authProvider: "EMAIL_REGISTER",
          identityProvider: "password",
          firstName,
          lastName,
          isNewUser: true,
        });
      } catch (error) {
        if (createdUser) {
          await firebaseSignOut(auth).catch(() => undefined);
          clearSession();
        }
        throw new Error(getAuthErrorMessage(error));
      } finally {
        interactiveAuthRef.current = false;
        setBusyAction(null);
        setInitialized(true);
      }
    },
    [clearSession, syncBackendSession]
  );

  const loginWithGoogle = useCallback(async (): Promise<AuthUser> => {
    setBusyAction("google");
    interactiveAuthRef.current = true;
    let signedInUser: FirebaseUser | null = null;

    try {
      await ensureAuthPersistence();
      const result = await signInWithPopup(auth, googleProvider);
      signedInUser = result.user;
      const isNewUser = getAdditionalUserInfo(result)?.isNewUser ?? false;

      return await syncBackendSession(result.user, {
        authProvider: isNewUser ? "EMAIL_REGISTER" : "EMAIL_LOGIN",
        identityProvider: "google.com",
        isNewUser,
      });
    } catch (error) {
      if (signedInUser) {
        await firebaseSignOut(auth).catch(() => undefined);
        clearSession();
      }
      throw new Error(getAuthErrorMessage(error));
    } finally {
      interactiveAuthRef.current = false;
      setBusyAction(null);
      setInitialized(true);
    }
  }, [clearSession, syncBackendSession]);

  const sendPasswordReset = useCallback(async (email: string) => {
    setBusyAction("reset");

    try {
      await ensureAuthPersistence();
      await sendPasswordResetEmail(auth, email.trim());
      return "Password reset link sent to your email address.";
    } catch (error) {
      throw new Error(getAuthErrorMessage(error));
    } finally {
      setBusyAction(null);
    }
  }, []);

  const logout = useCallback(async () => {
    setBusyAction("logout");

    try {
      await firebaseSignOut(auth);
    } finally {
      clearSession();
      setBusyAction(null);
      setInitialized(true);
    }
  }, [clearSession]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading: busyAction !== null,
        initialized,
        busyAction,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        sendPasswordReset,
        updateSessionUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
