import type { FC } from "react";

// App shell only; the composer arrives in Build 3 (SPEC §3, §11).
const Home: FC = () => {
  return (
    <main className="mx-auto max-w-2xl px-6 py-24">
      <h1 className="text-4xl font-semibold tracking-tight">Write to the you of tomorrow.</h1>
      <p className="mt-4 text-lg text-bark">
        Kesho means tomorrow in Swahili. Write it now; we&apos;ll seal it and email it to you on the day you
        choose, up to five years from now.
      </p>
    </main>
  );
};

export default Home;
