import { createClient } from "redis";

const client = createClient({
  url: process.env.REDIS_URL || undefined,
});

client.on("error", function (err) {
  // Suppress errors to allow the application to run without Redis
  console.error("Redis Client Error", err);
});

async function ensureConnected() {
  if (!client.isOpen) {
    try {
      await client.connect();
    } catch (e) {
      console.error("Could not connect to Redis:", e);
      return false;
    }
  }
  return true;
}

export async function getCache(key: string): Promise<string | null> {
  const connected = await ensureConnected();
  if (!connected) return null;

  try {
    return await client.get(key);
  } catch (e) {
    console.error(`Failed to get key ${key} from Redis:`, e);
    return null;
  }
}

export async function setCache(key: string, value: string, options?: any) {
  const connected = await ensureConnected();
  if (!connected) return;

  try {
    await client.set(key, value, options);
  } catch (e) {
    console.error(`Failed to set key ${key} in Redis:`, e);
  }
}

export async function delCache(key: string) {
  const connected = await ensureConnected();
  if (!connected) return;

  try {
    await client.del(key);
  } catch (e) {
    console.error(`Failed to delete key ${key} from Redis:`, e);
  }
}
