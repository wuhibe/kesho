import type { Metadata } from "next";
import { headers } from "next/headers";
import type { FC } from "react";
import { auth } from "@/lib/auth";
import { Composer } from "./composer";
import { HowItWorks } from "./how-it-works";
import { Questions } from "./questions";

// The canonical folds /?auth=… and utm variants into / (SPEC §3 SEO).
export const metadata: Metadata = { alternates: { canonical: "/" } };

// Google's strongest signal for the site name in results (SPEC §3 SEO); `<` escaped per the Next.js JSON-LD guide.
const websiteJsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Kesho",
  url: "https://kesho.et/",
}).replace(/</g, "\\u003c");

// ?auth=signup|login reopens the auth modal: "Wrong email?" on /check-inbox and an expired
// link on /sealed/[id] both send the Author back here.
const Home: FC<PageProps<"/">> = async ({ searchParams }) => {
  const [{ auth: openAuth }, session] = await Promise.all([
    searchParams,
    auth.api.getSession({ headers: await headers() }),
  ]);

  return (
    <main className="mx-auto max-w-3xl px-6 pb-16 pt-8 md:pt-14">
      <p className="font-serif text-sm text-bark">
        <b className="font-semibold text-ink">kesho</b> <span className="font-mono text-xs">/ˈkɛ.ʃɔ/</span>{" "}
        <i>Swahili, adverb.</i> Tomorrow.
      </p>
      <h1 className="mt-6 font-serif text-4xl italic leading-tight md:mt-10 md:text-6xl">
        Write to yourself. We&apos;ll keep it sealed and email it back on the day you choose.
      </h1>
      <Composer
        isSignedIn={session !== null}
        openAuth={!session && (openAuth === "signup" || openAuth === "login") ? openAuth : null}
      />
      <HowItWorks />
      <Questions />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: websiteJsonLd }} />
    </main>
  );
};

export default Home;
