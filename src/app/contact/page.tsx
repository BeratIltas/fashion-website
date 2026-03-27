"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle, Clock3 } from "lucide-react";
import Container from "@/components/ui/Container";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [highlightPanel, setHighlightPanel] = useState<"info" | "form" | null>(null);
  const infoRef = useRef<HTMLElement | null>(null);
  const formRef = useRef<HTMLElement | null>(null);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const highlightAndScroll = (target: "info" | "form") => {
    setHighlightPanel(target);
    const element = target === "info" ? infoRef.current : formRef.current;
    element?.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => setHighlightPanel((current) => (current === target ? null : current)), 1400);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fafafa_0%,#f3f3f3_100%)]">
      <div className="bg-black px-6 pb-18 pt-28 text-white">
        <Container>
          <div className="text-center">
            <h1 className="mb-4 text-5xl font-bold md:text-6xl">
              Helping you define
              <br />
              your personal style
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-neutral-300">
              We create tailored solutions through current style guidance and personal consulting.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => highlightAndScroll("form")}
                className="rounded-full bg-white px-8 py-3 font-medium text-black transition hover:bg-neutral-200"
              >
                Get in touch
              </button>
              <button
                onClick={() => highlightAndScroll("info")}
                className="rounded-full border border-white px-8 py-3 font-medium text-white transition hover:bg-white hover:text-black"
              >
                Services
              </button>
            </div>
          </div>
        </Container>
      </div>

      <Container>
        <div className="py-16">
          <div className="mb-14 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl bg-white p-8 text-center shadow-sm transition hover:shadow-md">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-black">
                <Mail className="text-white" size={24} />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Instagram.com</h3>
              <p className="text-neutral-600">Send us an email</p>
            </div>

            <div className="rounded-2xl bg-white p-8 text-center shadow-sm transition hover:shadow-md">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-black">
                <Phone className="text-white" size={24} />
              </div>
              <h3 className="mb-2 text-lg font-semibold">+90 234 567 890</h3>
              <p className="text-neutral-600">Phone number</p>
            </div>

            <div className="rounded-2xl bg-white p-8 text-center shadow-sm transition hover:shadow-md">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-black">
                <MapPin className="text-white" size={24} />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Beykoz University</h3>
              <p className="text-neutral-600">Our locations</p>
            </div>
          </div>

          <div className="grid items-stretch gap-8 lg:grid-cols-[0.96fr_1.04fr]">
            <section
              ref={infoRef}
              className={`h-full overflow-hidden rounded-[2rem] border bg-white shadow-sm transition-all duration-300 ${highlightPanel === "info" ? "border-black shadow-[0_0_0_4px_rgba(0,0,0,0.06)]" : "border-neutral-200"}`}
            >
              <div className="relative flex h-full min-h-[680px] flex-col overflow-hidden p-4 sm:p-5">
                <div className="relative flex-1 overflow-hidden rounded-[1.5rem] border border-neutral-200 bg-neutral-100 shadow-sm">
                  <iframe
                    title="Mirage Studio Location"
                    src="https://www.google.com/maps?q=Beykoz%20University&z=15&output=embed"
                    className="h-full min-h-[430px] w-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/45 to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5 rounded-[1.25rem] border border-white/20 bg-black/70 p-4 text-white backdrop-blur-md">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/80">
                      <MapPin size={12} />
                      Live Location
                    </div>
                    <h2 className="mt-3 text-2xl font-semibold tracking-tight">Reach out to us</h2>
                    <p className="mt-2 max-w-md text-sm leading-6 text-white/75">
                      Visit Beykoz University or send us a message for styling, shopping, and wardrobe requests.
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-neutral-200 bg-neutral-50 p-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-black text-white">
                      <MapPin size={18} />
                    </div>
                    <h3 className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-neutral-500">Studio</h3>
                    <p className="mt-2 text-lg font-semibold text-neutral-900">Beykoz University</p>
                    <p className="mt-1 text-sm leading-6 text-neutral-600">Campus meetings and in-person styling sessions.</p>
                  </div>

                  <div className="rounded-[1.5rem] border border-neutral-200 bg-neutral-50 p-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-black text-white">
                      <Clock3 size={18} />
                    </div>
                    <h3 className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-neutral-500">Hours</h3>
                    <p className="mt-2 text-lg font-semibold text-neutral-900">Mon - Sat / 10:00 - 19:00</p>
                    <p className="mt-1 text-sm leading-6 text-neutral-600">We usually reply within one business day.</p>
                  </div>
                </div>
              </div>
            </section>

            <section
              ref={formRef}
              className={`h-full rounded-[2rem] border bg-white p-8 shadow-sm transition-all duration-300 md:p-10 ${highlightPanel === "form" ? "border-black shadow-[0_0_0_4px_rgba(0,0,0,0.06)]" : "border-neutral-200"}`}
            >
              {isSubmitted ? (
                <div className="flex h-full min-h-[680px] flex-col items-center justify-center text-center">
                  <CheckCircle className="mb-4 text-green-500" size={64} />
                  <h3 className="mb-2 text-2xl font-bold">Your message has been sent.</h3>
                  <p className="text-neutral-600">We will get back to you as soon as possible.</p>
                </div>
              ) : (
                <div className="flex h-full min-h-[680px] flex-col justify-center">
                  <div className="mb-8">
                    <h3 className="text-3xl font-semibold tracking-tight text-neutral-950">Start the conversation</h3>
                    <p className="mt-2 text-sm leading-6 text-neutral-500">
                      Tell us what you need and we will guide you from there.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit}>
                    <div className="mb-6 grid gap-6 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-neutral-700">First name</label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          placeholder="John"
                          required
                          className="w-full rounded-xl border border-neutral-200 px-4 py-3 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-black"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-neutral-700">Last name</label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          placeholder="Doe"
                          required
                          className="w-full rounded-xl border border-neutral-200 px-4 py-3 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-black"
                        />
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="mb-2 block text-sm font-medium text-neutral-700">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        required
                        className="w-full rounded-xl border border-neutral-200 px-4 py-3 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>

                    <div className="mb-6">
                      <label className="mb-2 block text-sm font-medium text-neutral-700">Phone number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+90 555 123 45 67"
                        className="w-full rounded-xl border border-neutral-200 px-4 py-3 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>

                    <div className="mb-6">
                      <label className="mb-2 block text-sm font-medium text-neutral-700">Subject</label>
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full appearance-none rounded-xl border border-neutral-200 bg-white px-4 py-3 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-black"
                      >
                        <option value="">Enquiry</option>
                        <option value="style-consulting">Style consulting</option>
                        <option value="personal-shopping">Personal shopping</option>
                        <option value="wardrobe">Wardrobe editing</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="mb-8">
                      <label className="mb-2 block text-sm font-medium text-neutral-700">Message</label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Enter your message here..."
                        rows={5}
                        required
                        className="w-full resize-none rounded-xl border border-neutral-200 px-4 py-3 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>

                    <button
                      type="submit"
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-black py-4 font-semibold text-white shadow-lg transition hover:bg-neutral-800 hover:shadow-xl"
                    >
                      Send message
                      <Send size={18} />
                    </button>
                  </form>
                </div>
              )}
            </section>
          </div>
        </div>
      </Container>
    </div>
  );
}
