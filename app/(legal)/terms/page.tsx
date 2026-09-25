import type { Metadata } from "next";
import type { FC } from "react";

export const metadata: Metadata = { title: "Terms", alternates: { canonical: "/terms" } };

const TermsPage: FC = () => (
  <>
    <h1>Terms</h1>
    <h2>What Kesho does</h2>
    <p>
      You write a letter to yourself, and we email it to your verified address on the delivery date you chose. It
      arrives on or shortly after that date: a daily sending limit can delay it by a day.
    </p>

    <h2>Your account</h2>
    <p>One person per account. You must be 16 or older, and you keep your password safe.</p>

    <h2>Acceptable use</h2>
    <p>
      No illegal content and no automated sign-ups. We may close accounts that abuse the service, and their letters
      are deleted.
    </p>

    <h2>Your content</h2>
    <p>Your letters stay yours. We store and send them only in order to deliver them to you.</p>

    <h2>No guarantee, and a promise</h2>
    <p>
      Kesho is provided as-is, without warranties.{" "}
      <b>
        If Kesho ever shuts down, you&apos;ll get at least 30 days&apos; notice, and every sealed letter will be
        emailed to you early rather than lost.
      </b>
    </p>

    <h2>Changes</h2>
    <p>We&apos;ll announce material changes to these terms by email.</p>

    <h2>Law and contact</h2>
    <p>
      These terms are governed by the laws of Ethiopia. Questions go to{" "}
      <a href="mailto:hello@kesho.et">hello@kesho.et</a>.
    </p>
  </>
);

export default TermsPage;
