import { Fragment, type FC } from "react";
import { Body, Button, Container, Head, Heading, Hr, Html, Preview, Text } from "react-email";
import { Footer } from "./footer";
import { BARK, CREAM, INK, MONO, PAPER, SAND, SANS, SERIF } from "./theme";

// Look A, the letter sheet: the delivery email mirrors the composer (SPEC §8; prototype/email-templates, variant W).

type LetterSheetProps = {
  preheader: string;
  /** "Written 24 Sept 2026 · Opened 24 Sept 2027" */
  label: string;
  subject: string | null;
  body: string;
};

export const LetterSheet: FC<LetterSheetProps> = ({ preheader, label, subject, body }) => (
  <Html lang="en">
    <Head />
    <Preview>{preheader}</Preview>
    <Body style={{ margin: 0, backgroundColor: CREAM, padding: "32px 16px" }}>
      <Container style={{ maxWidth: 560, backgroundColor: PAPER, borderRadius: 24, padding: "40px 36px" }}>
        <Text
          style={{ font: `12px ${MONO}`, letterSpacing: "0.2em", textTransform: "uppercase", color: BARK, margin: 0 }}
        >
          {label}
        </Text>
        {subject && (
          <Heading as="h1" style={{ font: `500 30px/1.2 ${SANS}`, color: INK, margin: "20px 0 0" }}>
            {subject}
          </Heading>
        )}
        <Text style={{ font: `italic 30px ${SERIF}`, color: INK, margin: "28px 0 8px" }}>Dear future me,</Text>
        {paragraphs(body).map((lines, i) => (
          <Text key={i} style={{ font: `19px/1.7 ${SERIF}`, color: INK, margin: "0 0 18px" }}>
            {lines.map((line, j) => (
              <Fragment key={j}>
                {j > 0 && <br />}
                {line}
              </Fragment>
            ))}
          </Text>
        ))}
        <Hr style={{ border: 0, borderTop: `1px solid ${SAND}`, margin: "32px 0" }} />
        <Text style={{ font: `15px/1.6 ${SANS}`, color: INK, margin: "0 0 16px" }}>
          It&apos;s in your archive whenever you want it again. Maybe write back to the next you?
        </Text>
        <Button
          href="https://kesho.et"
          style={{
            backgroundColor: INK,
            color: PAPER,
            font: `600 15px ${SANS}`,
            padding: "14px 24px",
            borderRadius: 999,
            textDecoration: "none",
          }}
        >
          Write the next one →
        </Button>
      </Container>
      <Footer color={BARK} />
    </Body>
  </Html>
);

// Blank lines split paragraphs; single line breaks stay as <br>, since email clients drop pre-wrap.
function paragraphs(body: string): string[][] {
  return body
    .replace(/\r\n?/g, "\n")
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.split("\n"));
}
