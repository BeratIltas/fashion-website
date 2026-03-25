import { Playfair_Display } from "next/font/google";

export const playfair = Playfair_Display({
    subsets: ["latin"],
    display: "swap",
    weight: ["400", "500", "600", "700", "800", "900"],
    style: ["normal", "italic"],
});
