import type { FC } from "react";
import { Container, Link, Text } from "react-email";
import { SANS } from "./theme";

/** The footer every email carries (SPEC §8), in a colour that reads on its page. */
export const Footer: FC<{ color: string }> = ({ color }) => (
  <Container style={{ maxWidth: 560 }}>
    <Text style={{ font: `12px/1.6 ${SANS}`, color, margin: "32px 0 0" }}>
      Kesho · letters to your future self ·{" "}
      <Link href="https://kesho.et" style={{ color }}>
        kesho.et
      </Link>
      <br />
      You&apos;re getting this because of your Kesho account. Replies reach a human at hello@kesho.et.
    </Text>
  </Container>
);
