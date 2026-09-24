import type { Metadata } from "next";
import type { FC } from "react";
import { Envelope } from "@/components/envelope";
import { InboxActions } from "./inbox-actions";

export const metadata: Metadata = { title: "Check your inbox · Kesho" };

const CheckInboxPage: FC = () => (
  <main className="mx-auto flex max-w-2xl flex-col items-center px-6 pb-24 pt-16 text-center">
    <Envelope stamp="Pending" />
    <h1 className="mt-10 text-5xl font-medium tracking-tight">Check your inbox.</h1>
    <InboxActions />
    <p className="mt-10 max-w-md text-sm text-bark">
      Your letter is held until you click the link. Letters from unverified emails are discarded after 7 days.
    </p>
  </main>
);

export default CheckInboxPage;
