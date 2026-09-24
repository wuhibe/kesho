import type { FC } from "react";
import { Body, Button, Container, Head, Heading, Html, Link, Preview, Section, Text } from "react-email";

// Look C, the envelope (SPEC §8; prototype/email-templates, variant W).

// Email clients strip web fonts, so these are fallback stacks only (SPEC §8).
const SANS = "-apple-system, 'Helvetica Neue', Helvetica, Arial, sans-serif";
const MONO = "'Courier New', Courier, monospace";
const INK = "#210c02";
const PAPER = "#faf7f1";
const SAND = "#e1d8c4";
const BARK = "#7b6556";
const RED = "#c42121";

type EnvelopeProps = {
  preheader: string;
  stamp: string;
  title: string;
  message: string;
  cta: string;
  url: string;
  finePrint: string;
};

export const Envelope: FC<EnvelopeProps> = ({ preheader, stamp, title, message, cta, url, finePrint }) => {
  return (
    <Html lang="en">
      <Head />
      <Preview>{preheader}</Preview>
      <Body style={{ margin: 0, backgroundColor: INK, padding: "32px 16px" }}>
        <Container style={{ maxWidth: 560, backgroundColor: PAPER, borderRadius: 8, overflow: "hidden" }}>
          <div
            style={{
              height: 0,
              margin: "0 auto",
              borderLeft: "280px solid transparent",
              borderRight: "280px solid transparent",
              borderTop: `110px solid ${SAND}`,
            }}
          />
          <Section style={{ textAlign: "center", marginTop: -20 }}>
            <span
              style={{
                display: "inline-block",
                border: `2px solid ${RED}`,
                color: RED,
                font: `11px ${MONO}`,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                padding: "4px 8px",
                transform: "rotate(-4deg)",
              }}
            >
              {stamp}
            </span>
          </Section>
          <Section style={{ padding: "28px 40px 40px", textAlign: "center" }}>
            <Heading as="h1" style={{ font: `500 28px/1.2 ${SANS}`, color: INK, margin: "0 0 12px" }}>
              {title}
            </Heading>
            <Text style={{ font: `16px/1.6 ${SANS}`, color: INK, margin: "0 0 24px" }}>{message}</Text>
            <Button
              href={url}
              style={{
                backgroundColor: RED,
                color: "#ffffff",
                font: `600 15px ${SANS}`,
                padding: "14px 28px",
                borderRadius: 999,
                textDecoration: "none",
              }}
            >
              {cta}
            </Button>
            <Text style={{ font: `13px/1.6 ${SANS}`, color: BARK, margin: "24px 0 0" }}>{finePrint}</Text>
          </Section>
        </Container>
        <Container style={{ maxWidth: 560 }}>
          <Text style={{ font: `12px/1.6 ${SANS}`, color: SAND, margin: "32px 0 0" }}>
            Kesho · letters to your future self ·{" "}
            <Link href="https://kesho.et" style={{ color: SAND }}>
              kesho.et
            </Link>
            <br />
            You&apos;re getting this because of your Kesho account. Replies reach a human at hello@kesho.et.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};
