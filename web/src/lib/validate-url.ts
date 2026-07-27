const PRIVATE_HOST_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^0\.0\.0\.0$/,
  /^\[::1\]$/,
  /^::1$/,
  /^169\.254\./,
  /^metadata\.google\.internal$/i,
];

export type UrlValidationResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

export function validateScanUrl(raw: string): UrlValidationResult {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { ok: false, error: "Enter a website URL to check." };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`);
  } catch {
    return { ok: false, error: "That URL looks invalid. Try https://example.com" };
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { ok: false, error: "Only http and https URLs are supported." };
  }

  const host = parsed.hostname;
  if (PRIVATE_HOST_PATTERNS.some((pattern) => pattern.test(host))) {
    return {
      ok: false,
      error: "Private or local network addresses cannot be scanned.",
    };
  }

  return { ok: true, url: parsed.toString() };
}
