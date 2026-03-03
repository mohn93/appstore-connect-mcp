import jwt from "jsonwebtoken";
import { readFileSync } from "node:fs";

interface TokenConfig {
  keyId: string;
  issuerId: string;
  privateKeyPath: string;
}

let cachedToken: string | null = null;
let tokenExpiry: number = 0;

function getConfig(): TokenConfig {
  const keyId = process.env.ASC_KEY_ID;
  const issuerId = process.env.ASC_ISSUER_ID;
  const privateKeyPath = process.env.ASC_PRIVATE_KEY_PATH;

  if (!keyId || !issuerId || !privateKeyPath) {
    throw new Error(
      "Missing required environment variables: ASC_KEY_ID, ASC_ISSUER_ID, ASC_PRIVATE_KEY_PATH"
    );
  }

  return { keyId, issuerId, privateKeyPath };
}

export function generateToken(): string {
  const now = Math.floor(Date.now() / 1000);

  // Return cached token if still valid (with 30s buffer)
  if (cachedToken && tokenExpiry > now + 30) {
    return cachedToken;
  }

  const config = getConfig();
  const privateKey = readFileSync(config.privateKeyPath, "utf8");

  const payload = {
    iss: config.issuerId,
    iat: now,
    exp: now + 20 * 60, // 20 minutes
    aud: "appstoreconnect-v1",
  };

  const signOptions: jwt.SignOptions = {
    algorithm: "ES256",
    header: {
      alg: "ES256",
      kid: config.keyId,
      typ: "JWT",
    },
  };

  cachedToken = jwt.sign(payload, privateKey, signOptions);
  tokenExpiry = now + 20 * 60;

  return cachedToken;
}
