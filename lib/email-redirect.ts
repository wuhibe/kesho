// Outside production every email goes to one inbox with a tagged subject, so previews
// and local runs never mail a real Author (SPEC §8).
export function routeEmail(
  to: string,
  subject: string,
  env: Record<string, string | undefined> = process.env,
): { to: string; subject: string } {
  if (env.VERCEL_ENV === "production") return { to, subject };

  const redirectTo = env.EMAIL_REDIRECT_TO;
  if (!redirectTo) throw new Error("EMAIL_REDIRECT_TO must be set outside production");
  const tag = env.VERCEL_ENV === "preview" ? "[preview]" : "[local]";
  return { to: redirectTo, subject: `${tag} ${subject}` };
}
