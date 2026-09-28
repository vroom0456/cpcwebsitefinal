import { google } from "googleapis";
import fs from "fs";
import path from "path";

let cachedDrive: ReturnType<typeof google.drive> | null = null;

function cleanPrivateKey(rawKey?: string | null): string | null {
  if (!rawKey) return null;
  let key = rawKey.trim();
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1).trim();
  }
  return key.replace(/\\r\\n/g, "\n").replace(/\\n/g, "\n");
}

interface ResolvedCredentials {
  clientEmail: string | null;
  privateKey: string | null;
}

export function getResolvedCredentials(): ResolvedCredentials {
  let clientEmail = process.env.GOOGLE_DRIVE_CLIENT_EMAIL?.trim() || null;
  let privateKey = cleanPrivateKey(process.env.GOOGLE_DRIVE_PRIVATE_KEY);

  // 1. Check if GOOGLE_DRIVE_PRIVATE_KEY is actually the raw JSON from Google Cloud Console
  if (privateKey && privateKey.startsWith("{") && privateKey.includes("client_email")) {
    try {
      const parsed = JSON.parse(privateKey);
      if (parsed.client_email && parsed.private_key) {
        return {
          clientEmail: parsed.client_email.trim(),
          privateKey: cleanPrivateKey(parsed.private_key),
        };
      }
    } catch {
      // not JSON, keep as-is
    }
  }

  // 2. Check if GOOGLE_SERVICE_ACCOUNT_JSON env var is set
  const jsonEnv = process.env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim();
  if (jsonEnv) {
    try {
      const parsed = JSON.parse(jsonEnv);
      if (parsed.client_email && parsed.private_key) {
        return {
          clientEmail: parsed.client_email.trim(),
          privateKey: cleanPrivateKey(parsed.private_key),
        };
      }
    } catch {
      // not JSON
    }
  }

  // 3. Check for service-account.json or google-credentials.json in project root
  const rootFiles = [
    path.join(process.cwd(), "service-account.json"),
    path.join(process.cwd(), "service_account.json"),
    path.join(process.cwd(), "google-credentials.json"),
    path.join(process.cwd(), "credentials.json"),
  ];

  for (const filePath of rootFiles) {
    try {
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, "utf-8");
        const parsed = JSON.parse(fileContent);
        if (parsed.client_email && parsed.private_key) {
          return {
            clientEmail: parsed.client_email.trim(),
            privateKey: cleanPrivateKey(parsed.private_key),
          };
        }
      }
    } catch {
      // ignore
    }
  }

  return { clientEmail, privateKey };
}

export function getDriveClient() {
  if (cachedDrive) return cachedDrive;

  const { clientEmail, privateKey } = getResolvedCredentials();
  const apiKey = process.env.GOOGLE_DRIVE_API_KEY?.trim();

  // 1. If valid Service Account credentials exist, use JWT auth
  if (
    clientEmail &&
    privateKey &&
    !clientEmail.includes("mock") &&
    !privateKey.includes("mock") &&
    privateKey.includes("-----BEGIN")
  ) {
    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });

    cachedDrive = google.drive({ version: "v3", auth });
    return cachedDrive;
  }

  // 2. If Google Drive API Key exists, use API key auth
  if (apiKey && !apiKey.includes("mock")) {
    cachedDrive = google.drive({ version: "v3", auth: apiKey });
    return cachedDrive;
  }

  throw new Error(
    "Google Drive API credentials not configured yet — please set GOOGLE_DRIVE_API_KEY or provide a Google Service Account in your .env file."
  );
}

export function hasDriveCredentials(): boolean {
  const { clientEmail, privateKey } = getResolvedCredentials();
  const apiKey = process.env.GOOGLE_DRIVE_API_KEY?.trim();

  if (
    clientEmail &&
    privateKey &&
    !clientEmail.includes("mock") &&
    !privateKey.includes("mock") &&
    privateKey.includes("-----BEGIN")
  ) {
    return true;
  }

  if (apiKey && !apiKey.includes("mock") && apiKey.length > 10) {
    return true;
  }

  return false;
}


