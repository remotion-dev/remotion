import { head, put } from "@vercel/blob";

type SnapshotCache = {
  snapshotId: string;
};

const SNAPSHOT_BLOB_KEY = `snapshot-cache/${process.env.VERCEL_DEPLOYMENT_ID ?? "local"}.json`;

export async function getCachedSnapshot(): Promise<string | null> {
  if (!process.env.VERCEL) {
    return null;
  }

  try {
    const metadata = await head(SNAPSHOT_BLOB_KEY);
    const response = await fetch(metadata.url);
    const cache: SnapshotCache = await response.json();

    return cache.snapshotId;
  } catch {
    return null;
  }
}

export async function saveSnapshotCache(snapshotId: string): Promise<void> {
  const cache: SnapshotCache = {
    snapshotId,
  };

  await put(SNAPSHOT_BLOB_KEY, JSON.stringify(cache), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
  });
}
