import crypto from "crypto";
import { cookies } from "next/headers";

export interface CCMember {
  id: string;
  username: string;
  aliases?: string[];
  name: string;
  role: string;
  email: string;
  passwordHash: string; // PBKDF2 hash of individual password
}

// Require a real secret in production; fall back in local dev only
const SESSION_SECRET =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.CC_SESSION_SECRET ||
  (process.env.NODE_ENV === "production"
    ? (() => { throw new Error("CC_SESSION_SECRET env var is required in production"); })()
    : "cpc-dev-only-secret-not-for-production");

export const CC_SESSION_COOKIE = "cpc_admin_session";

/**
 * PBKDF2-based password hash with a per-member salt derived from their ID.
 * 100,000 iterations of SHA-256 — far stronger than plain SHA-256.
 */
function hashPassword(password: string, salt: string): string {
  return crypto
    .pbkdf2Sync(password.trim(), salt, 100_000, 32, "sha256")
    .toString("hex");
}

/** Legacy SHA-256 — kept only for migration comparison */
function sha256(text: string): string {
  return crypto.createHash("sha256").update(text.trim()).digest("hex");
}

/**
 * Official Core Committee Member Directory with individual unique credentials.
 * Strictly limited to the 9 active CC members:
 * Niteesh, Varun, Sankeerth, Ramshri, Mahitha, Kevin, Hamsini, Surya, Rashmith.
 */
export const CC_MEMBERS: CCMember[] = [
  {
    id: "cc-niteesh",
    username: "niteesh",
    aliases: ["niteesh_cpc"],
    name: "Niteesh",
    role: "President",
    email: "niteesh@cbitphotoclub.in",
    passwordHash: hashPassword("cpc_niteesh#2026", "cc-niteesh"),
  },
  {
    id: "cc-sankeerth",
    username: "sankeerth",
    aliases: ["saisankeerth", "saisankeerthreddy"],
    name: "Sai Sankeerth Reddy",
    role: "Vice President",
    email: "sankeerth@cbitphotoclub.in",
    passwordHash: hashPassword("cpc_sankeerth#2026", "cc-sankeerth"),
  },
  {
    id: "cc-varun",
    username: "varun",
    aliases: ["varunteja", "varunteja_cpc"],
    name: "Varun Teja Cherukuthota",
    role: "Creative Director",
    email: "varun@cbitphotoclub.in",
    passwordHash: hashPassword("cpc_varun#2026", "cc-varun"),
  },
  {
    id: "cc-hamsini",
    username: "hamsini",
    aliases: ["hamsini_cpc"],
    name: "Hamsini",
    role: "General Secretary",
    email: "hamsini@cbitphotoclub.in",
    passwordHash: hashPassword("cpc_hamsini#2026", "cc-hamsini"),
  },
  {
    id: "cc-kevin",
    username: "kevin",
    aliases: ["kevintejas"],
    name: "Kevin Tejas",
    role: "Joint Secretary",
    email: "kevin@cbitphotoclub.in",
    passwordHash: hashPassword("cpc_kevin#2026", "cc-kevin"),
  },
  {
    id: "cc-mahitha",
    username: "mahitha",
    aliases: ["mahitha_v", "mahithavedantam"],
    name: "Mahitha Vedantam",
    role: "Joint Secretary",
    email: "mahitha@cbitphotoclub.in",
    passwordHash: hashPassword("cpc_mahitha#2026", "cc-mahitha"),
  },
  {
    id: "cc-ramshri",
    username: "ramshri",
    aliases: ["ramsri", "ramsrivarun"],
    name: "Ram Sri Varun",
    role: "Head of Social Media & PR",
    email: "ramshri@cbitphotoclub.in",
    passwordHash: hashPassword("cpc_ramshri#2026", "cc-ramshri"),
  },
  {
    id: "cc-surya",
    username: "surya",
    aliases: ["suryateja", "suryatejajangli"],
    name: "Suryateja Jangli",
    role: "Image Processing Lead",
    email: "surya@cbitphotoclub.in",
    passwordHash: hashPassword("cpc_surya#2026", "cc-surya"),
  },
  {
    id: "cc-rashmith",
    username: "rashmith",
    aliases: ["rashmithsheela"],
    name: "Rashmith Sheela",
    role: "Head of Events & Documentation",
    email: "rashmith@cbitphotoclub.in",
    passwordHash: hashPassword("cpc_rashmith#2026", "cc-rashmith"),
  },
];

export interface SessionPayload {
  memberId: string;
  username: string;
  name: string;
  role: string;
  email: string;
  issuedAt: number;
  expiresAt: number;
}

/**
 * Creates a cryptographically signed HMAC-SHA256 session token
 */
export function createSignedSessionToken(member: CCMember): string {
  const payload: SessionPayload = {
    memberId: member.id,
    username: member.username,
    name: member.name,
    role: member.role,
    email: member.email,
    issuedAt: Date.now(),
    expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(payloadB64)
    .digest("base64url");

  return `${payloadB64}.${signature}`;
}

/**
 * Verifies HMAC-SHA256 signature and validity of session token
 */
export function verifySignedSessionToken(token?: string | null): SessionPayload | null {
  if (!token || !token.includes(".")) return null;

  try {
    const [payloadB64, signature] = token.split(".");
    if (!payloadB64 || !signature) return null;

    const expectedSig = crypto
      .createHmac("sha256", SESSION_SECRET)
      .update(payloadB64)
      .digest("base64url");

    if (
      signature.length !== expectedSig.length ||
      !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))
    ) {
      return null;
    }

    const payload: SessionPayload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf-8")
    );

    if (Date.now() > payload.expiresAt) {
      return null; // Expired session
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Authenticates a Core Committee member with username/email + individual password
 */
export async function authenticateCCMember(
  identifier: string,
  passcode: string
): Promise<{ success: boolean; member?: CCMember; error?: string }> {
  const cleanId = (identifier || "").trim().toLowerCase();
  const cleanPass = (passcode || "").trim();

  if (!cleanId && !cleanPass) {
    return { success: false, error: "Please enter your username/email and password." };
  }

  // Find matching CC member among the 9 active CC members
  const member = CC_MEMBERS.find((m) => {
    if (m.username.toLowerCase() === cleanId) return true;
    if (m.email.toLowerCase() === cleanId) return true;
    if (m.aliases && m.aliases.some((a) => a.toLowerCase() === cleanId)) return true;
    return false;
  });

  if (!member) {
    return { success: false, error: "No Core Committee account matches that username or email." };
  }

  // Verify using PBKDF2 (primary). Fall back to legacy SHA-256 so existing
  // sessions are not broken if the hash table was just migrated.
  const pbkdf2Hash = hashPassword(cleanPass, member.id);
  const legacyHash = sha256(cleanPass);
  const validPbkdf2 = crypto.timingSafeEqual(Buffer.from(pbkdf2Hash, "hex"), Buffer.from(member.passwordHash, "hex") as Buffer).valueOf();
  const validLegacy = member.passwordHash.length === 64 && crypto.timingSafeEqual(Buffer.from(legacyHash), Buffer.from(member.passwordHash)) as unknown as boolean;

  if (!validPbkdf2 && !validLegacy) {
    return { success: false, error: "Incorrect password for this Core Committee account." };
  }

  return { success: true, member };
}

/**
 * Helper to get currently logged in CC member from cookies
 */
export async function getCurrentCCSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(CC_SESSION_COOKIE)?.value;
    return verifySignedSessionToken(token);
  } catch {
    return null;
  }
}
