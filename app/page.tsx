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
    <main className="mx-auto max-w-3xl px-6 pb-16 pt-16 md:pb-48 md:pt-24">
      <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Write to the you of tomorrow.</h1>
      <p className="mt-4 text-lg text-bark">
        Kesho means tomorrow in Swahili. Write it now; we&apos;ll seal it and email it to you on the day you
        choose, up to five years from now.
      </p>
      <Composer
        isSignedIn={session !== null}
        openAuth={!session && (openAuth === "signup" || openAuth === "login") ? openAuth : null}
      />
    </main>
  );
};

export default Home;
