import type { FC } from "react";
import { Body, Button, Container, Head, Heading, Html, Preview, Section, Text } from "react-email";
import { Flap } from "./flap";
import { Footer } from "./footer";
import {
  BARK,
  ENVELOPE_DARK_BARK,
  ENVELOPE_DARK_PAPER,
  ENVELOPE_DARK_RED,
  ENVELOPE_DARK_SAND,
  ENVELOPE_PAPER,
  ENVELOPE_SAND,
  INK,
  MONO,
  PAPER,
  RED,
  SANS,
} from "./theme";

// Look C, the envelope (SPEC §8): one paper surface edge to edge, so Gmail's forced dark mode
// darkens it as a whole instead of leaving a dark frame around a greyed card.

type EnvelopeProps = {
  preheader: string;
  stamp: string;
  title: string;
  message: string;
  cta: string;
  url: string;
  finePrint: string;
};

export const Envelope: FC<EnvelopeProps> = ({ preheader, stamp, title, message, cta, url, finePrint }) => (
  <Html lang="en">
    <Head>
      <meta name="color-scheme" content="light dark" />
      <meta name="supported-color-schemes" content="light dark" />
      <style>{DARK_STYLES}</style>
    </Head>
    <Preview>{preheader}</Preview>
    <Body className="k-page" style={{ margin: 0, backgroundColor: ENVELOPE_PAPER, padding: "0 0 24px" }}>
      <Container style={{ maxWidth: 560 }}>
        <Flap />
        <Section style={{ textAlign: "center", paddingTop: 20 }}>
          <span
            className="k-stamp"
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
        <Section style={{ padding: "20px 24px 32px", textAlign: "center" }}>
          <Heading as="h1" className="k-ink" style={{ font: `500 26px/1.25 ${SANS}`, color: INK, margin: "0 0 12px" }}>
            {title}
          </Heading>
          <Text className="k-ink" style={{ font: `16px/1.6 ${SANS}`, color: INK, margin: "0 0 24px" }}>
            {message}
          </Text>
          <Button
            href={url}
            style={{
              backgroundColor: RED,
              color: "#ffffff",
              font: `600 16px ${SANS}`,
              padding: "14px 28px",
              borderRadius: 999,
              textDecoration: "none",
            }}
          >
            {cta}
          </Button>
          <Text className="k-muted" style={{ font: `13px/1.6 ${SANS}`, color: BARK, margin: "24px 0 0" }}>
            {finePrint}
          </Text>
        </Section>
        <Section style={{ padding: "0 24px" }}>
          <div className="k-rule" style={{ borderTop: `1px solid ${ENVELOPE_SAND}` }}>
            <Footer color={BARK} className="k-muted" />
          </div>
        </Section>
      </Container>
    </Body>
  </Html>
);

// Apple Mail honours these; Gmail ignores them and applies its own dark mode. The `k-` prefix keeps
// the classes clear of the mail client's own CSS. react-email copies Body's background onto its
// wrapper cell, so that cell takes the class's colour too.
const DARK_STYLES = `
@media (prefers-color-scheme: dark) {
  .k-page, .k-page > table > tbody > tr > td { background-color: ${ENVELOPE_DARK_PAPER} !important; }
  .k-flap { background-color: ${ENVELOPE_DARK_SAND} !important; }
  .k-rule { border-color: ${ENVELOPE_DARK_SAND} !important; }
  .k-ink { color: ${PAPER} !important; }
  .k-muted { color: ${ENVELOPE_DARK_BARK} !important; }
  .k-stamp { color: ${ENVELOPE_DARK_RED} !important; border-color: ${ENVELOPE_DARK_RED} !important; }
}`;
