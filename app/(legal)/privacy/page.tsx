import type { Metadata } from "next";
import type { FC } from "react";

export const metadata: Metadata = { title: "Privacy · Kesho" };

const PrivacyPage: FC = () => (
  <>
    <h1>Privacy</h1>
    <h2>What we store</h2>
    <ul>
      <li>your email address and a hash of your password (never the password itself)</li>
      <li>your login sessions, with the IP address and browser each one came from</li>
      <li>your letters: the subject and body (both encrypted), the delivery date, your timezone and delivery status</li>
      <li>IP addresses, to limit repeated attempts</li>
    </ul>

    <h2>Encryption, honestly</h2>
    <p>
      Letters are encrypted in our database. Because we have to deliver them, we hold the key, so this isn&apos;t
      end-to-end encryption. We never read letters, and we&apos;d only access one if the law compels us.
    </p>

    <h2>Who helps us run Kesho</h2>
    <ul>
      <li>Vercel: hosting, and cookieless Web Analytics</li>
      <li>Neon: the database</li>
      <li>Resend: sending email (it keeps a copy of sent emails for a short time)</li>
      <li>Cloudflare: DNS, email forwarding, and database backups (R2)</li>
    </ul>

    <h2>Cookies</h2>
    <p>
      Only the essential login session cookie. No tracking cookies, so no banner. Your unsent draft is kept in your own
      browser, not on our servers.
    </p>

    <h2>How long we keep things</h2>
    <ul>
      <li>Unverified accounts and their pending letters are deleted after 7 days.</li>
      <li>Cancelled letters are deleted immediately.</li>
      <li>Delivered letters stay in your archive until you delete them.</li>
      <li>Backups keep the last 8 weekly copies.</li>
    </ul>

    <h2>Your rights</h2>
    <p>
      You can delete any letter, or your whole account, at any time from your letters page. Deleting your account
      deletes it and all its letters immediately; backups age out within 8 weeks. For anything else, email{" "}
      <a href="mailto:hello@kesho.et">hello@kesho.et</a>.
    </p>

    <h2>Changes</h2>
    <p>We&apos;ll announce material changes to this policy by email.</p>
  </>
);

export default PrivacyPage;
