import dns from "node:dns/promises";
import net from "node:net";

function isPrivateIp(ip: string): boolean {
  if (ip === "::1" || ip === "0.0.0.0") return true;

  if (net.isIPv4(ip)) {
    const parts = ip.split(".").map(Number);
    const [a, b] = parts;
    if (a === 10) return true;
    if (a === 127) return true;
    if (a === 0) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    return false;
  }

  const normalized = ip.toLowerCase();
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true;
  if (normalized.startsWith("fe80")) return true;
  return false;
}

/**
 * Resolve hostname and reject private/link-local targets (SSRF hardening).
 */
export async function assertPublicHostname(hostname: string): Promise<void> {
  let records: Array<{ address: string; family: number }>;
  try {
    records = await dns.lookup(hostname, { all: true, verbatim: true });
  } catch {
    throw new Error(
      "Could not resolve that hostname. Check the URL and try again.",
    );
  }

  if (!records.length) {
    throw new Error("Could not resolve that hostname.");
  }

  for (const record of records) {
    if (isPrivateIp(record.address)) {
      throw new Error(
        "Private or local network addresses cannot be scanned.",
      );
    }
  }
}
