import type { Metadata } from "next";
import type { FC } from "react";
import { Fragment_Mono, Instrument_Sans, Newsreader, Zeyada } from "next/font/google";
import "./globals.css";

const instrumentSans = Instrument_Sans({ subsets: ["latin"], variable: "--font-instrument-sans" });
const fragmentMono = Fragment_Mono({ weight: "400", subsets: ["latin"], variable: "--font-fragment-mono" });
const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
});
const zeyada = Zeyada({ weight: "400", subsets: ["latin"], variable: "--font-zeyada" });

export const metadata: Metadata = {
  title: "Kesho — letters to your future self",
  description: "Write a letter to your future self. We'll seal it and email it to you on the day you choose.",
};

const RootLayout: FC<LayoutProps<"/">> = ({ children }) => {
  return (
    <html
      lang="en"
      className={`${instrumentSans.variable} ${fragmentMono.variable} ${newsreader.variable} ${zeyada.variable}`}
    >
      <body className="min-h-dvh font-sans antialiased">{children}</body>
    </html>
  );
};

export default RootLayout;
