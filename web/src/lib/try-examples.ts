/** Try-example chips on the home scan form — shared with FAQ copy. */
export const TRY_EXAMPLE_URLS = [
  {
    label: "example.com",
    url: "https://example.com",
    hint: "quick Pass-style check",
    faqPhrase: "a quick Pass-style check",
    ariaDescription: "Simple public page — usually a strong Pass (batch #26)",
  },
  {
    label: "W3C bad demo",
    url: "https://www.w3.org/WAI/demos/bad/before/home.html",
    hint: "many issues on purpose",
    faqPhrase: "many intentional issues",
    ariaDescription: "Known-bad demo — expect many issues (batch #27, Fail)",
    chipClass: "demo-bad" as const,
  },
] as const;

export function tryExamplesFaqSentence(): string {
  const [first, second] = TRY_EXAMPLE_URLS;
  return `Try ${first.label} for ${first.faqPhrase}, or ${second.label} for ${second.faqPhrase}. Both buttons fill the URL field above.`;
}
