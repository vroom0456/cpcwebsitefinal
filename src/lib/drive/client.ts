import { google } from "googleapis";

let cachedDrive: ReturnType<typeof google.drive> | null = null;

/**
 * Service-account Drive client, server-only. Never import this into
 * client components — the private key must stay server-side.
 *
 * The service account needs "Viewer" access on the club's Drive folder
 * tree (shared with its email address) — it never needs write access,
 * since the club uploads originals manually and this app only reads.
 */
function cleanPrivateKey(rawKey?: string | null): string | null {
  if (!rawKey) return null;
  let key = rawKey.trim();
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1).trim();
  }
  return key.replace(/\\r\\n/g, "\n").replace(/\\n/g, "\n");
}

export function getDriveClient() {
  if (cachedDrive) return cachedDrive;

  const clientEmail = process.env.GOOGLE_DRIVE_CLIENT_EMAIL?.trim();
  const privateKey = cleanPrivateKey(process.env.GOOGLE_DRIVE_PRIVATE_KEY);

  if (!clientEmail || !privateKey || privateKey.includes("mock-private-key")) {
    throw new Error(
      "Google Drive API credentials not configured yet — please add a real Google Service Account email and private key in your .env file."
    );
  }

  if (!privateKey.includes("-----BEGIN")) {
    throw new Error(
      "GOOGLE_DRIVE_PRIVATE_KEY is invalid. It must be a valid PEM private key starting with '-----BEGIN PRIVATE KEY-----'."
    );
  }

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });

  cachedDrive = google.drive({ version: "v3", auth });
  return cachedDrive;
}

export function hasDriveCredentials(): boolean {
  const clientEmail = process.env.GOOGLE_DRIVE_CLIENT_EMAIL?.trim();
  const privateKey = cleanPrivateKey(process.env.GOOGLE_DRIVE_PRIVATE_KEY);
  if (!clientEmail || !privateKey) return false;
  if (clientEmail.includes("mock") || privateKey.includes("mock")) return false;
  if (!privateKey.includes("-----BEGIN")) return false;
  return true;
}
