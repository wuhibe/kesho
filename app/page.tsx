import { headers } from "next/headers";
import type { FC } from "react";
import { auth } from "@/lib/auth";
import { Composer } from "./composer";

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
    </main>
  );
};

export default Home;
