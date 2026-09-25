import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import type { FC } from "react";
import { Fragment_Mono, Instrument_Sans, Newsreader, Zeyada } from "next/font/google";
import { Footer } from "@/components/footer";
import { SiteHeader } from "./site-header";
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
  title: "Kesho · letters to your future self",
  description: "Write a letter to your future self. We'll seal it and email it to you on the day you choose.",
};

const RootLayout: FC<LayoutProps<"/">> = ({ children }) => {
  return (
    <html
      lang="en"
      className={`${instrumentSans.variable} ${fragmentMono.variable} ${newsreader.variable} ${zeyada.variable}`}
    >
      {/* The composer's send bar (md+) and phone Send button float over the bottom of the page, so the page makes room. */}
      <body className="flex min-h-dvh flex-col font-sans antialiased has-data-send-bar:pb-24 md:has-data-send-bar:pb-28">
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <Footer />
        {/* Cookieless (SPEC §2), so no consent banner (SPEC §9). */}
        <Analytics />
      </body>
    </html>
  );
};

export default RootLayout;
