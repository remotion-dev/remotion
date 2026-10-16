import { createHash, randomUUID } from "node:crypto";
import { readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { elements } from "../elements/registry.ts";

const { values } = parseArgs({
  options: {
    element: { type: "string" },
    help: { type: "boolean", short: "h" },
  },
});

if (values.help) {
  console.log(
    "Usage: npm run upload-previews -- [--element=<slug>]\nConfigure .env using .env.example. Render and review previews first.",
  );
  process.exit(0);
}

const selected =
  values.element === undefined
    ? elements
    : elements.filter(({ slug }) => slug === values.element);

if (selected.length === 0)
  throw new Error(`Unknown Element: ${values.element}`);

const {
  S3_ENDPOINT,
  S3_BUCKET,
  S3_PUBLIC_URL,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
} = process.env;

if (
  !S3_ENDPOINT ||
  !S3_BUCKET ||
  !S3_PUBLIC_URL ||
  !AWS_ACCESS_KEY_ID ||
  !AWS_SECRET_ACCESS_KEY
) {
  throw new Error(
    "Missing upload configuration. Copy .env.example to .env and configure your bucket, public URL, and credentials.",
  );
}

const publicBase = new URL(`${S3_PUBLIC_URL.replace(/\/$/, "")}/`);

if (
  publicBase.protocol !== "https:" ||
  publicBase.username ||
  publicBase.password ||
  publicBase.search ||
  publicBase.hash
) {
  throw new Error(
    "S3_PUBLIC_URL must be a public HTTPS URL without credentials, a query, or a fragment.",
  );
}

const prefix = process.env.S3_PREFIX ?? "element-previews";

if (!/^[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*$/.test(prefix)) {
  throw new Error(
    "S3_PREFIX must contain slash-separated letters, numbers, underscores, or hyphens.",
  );
}

const manifestPath = path.resolve("elements/previews.json");

const previews: Record<string, { posterUrl: string; videoUrl: string }> =
  JSON.parse(await readFile(manifestPath, "utf8"));

const version = randomUUID();

const uploads: {
  slug: string;
  field: "posterUrl" | "videoUrl";
  bytes: Buffer;
  contentType: string;
  key: string;
  publicUrl: string;
}[] = [];

for (const definition of selected) {
  const { slug } = definition;

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))
    throw new Error(`Invalid Element slug: ${slug}`);
  const preview = previews[slug];

  if (!preview) throw new Error(`Run render-previews for ${slug} first.`);
  let size = 0;

  for (const field of ["posterUrl", "videoUrl"] as const) {
    const url = preview[field];

    const extension =
      field === "posterUrl"
        ? "png"
        : definition.previewBackground === "transparent"
          ? "webm"
          : "mp4";

    const pattern = new RegExp(
      `^/previews/${slug}/[a-f0-9-]+/preview\\.${extension}$`,
    );

    if (typeof url !== "string" || !pattern.test(url)) {
      throw new Error(
        `Render and review local previews for ${slug} before uploading. Hosted previews are not downloaded or overwritten.`,
      );
    }

    const bytes = await readFile(path.join("public", url));

    const valid =
      extension === "png"
        ? bytes
            .subarray(0, 8)
            .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
        : extension === "webm"
          ? bytes.subarray(0, 4).equals(Buffer.from([26, 69, 223, 163]))
          : bytes.subarray(4, 8).toString() === "ftyp";

    if (!valid) throw new Error(`Invalid ${extension} preview: ${url}`);
    size += bytes.length;
    const key = `${prefix}/${slug}/${version}/preview.${extension}`;
    uploads.push({
      slug,
      field,
      bytes,
      key,
      contentType: extension === "png" ? "image/png" : `video/${extension}`,
      publicUrl: new URL(key, publicBase).href,
    });
  }

  if (size > 10 * 1024 * 1024)
    throw new Error(`Previews for ${slug} exceed 10 MiB.`);
}

const client = new S3Client({
  endpoint: S3_ENDPOINT,
  region: process.env.AWS_REGION ?? "auto",
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

try {
  for (const asset of uploads) {
    await client.send(
      new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: asset.key,
        Body: asset.bytes,
        ContentType: asset.contentType,
        CacheControl: "public, max-age=31536000, immutable",
        IfNoneMatch: "*",
      }),
    );

    const response = await fetch(asset.publicUrl, {
      signal: AbortSignal.timeout(30_000),
    });

    if (
      !response.ok ||
      response.headers.get("content-type")?.split(";")[0] !== asset.contentType
    ) {
      throw new Error(
        `Public preview verification failed: ${asset.publicUrl} (${response.status}). The manifest has not been changed.`,
      );
    }

    const remote = Buffer.from(await response.arrayBuffer());

    if (
      createHash("sha256").update(remote).digest("hex") !==
      createHash("sha256").update(asset.bytes).digest("hex")
    ) {
      throw new Error(
        `Uploaded preview checksum mismatch: ${asset.publicUrl}. The manifest has not been changed.`,
      );
    }

    previews[asset.slug][asset.field] = asset.publicUrl;
    console.log(`Verified ${asset.publicUrl}`);
  }

  const temporaryManifest = `${manifestPath}.${version}.tmp`;
  await writeFile(temporaryManifest, `${JSON.stringify(previews, null, 2)}\n`);
  await rename(temporaryManifest, manifestPath);
  console.log(
    "Updated elements/previews.json with verified hosted URLs. Local preview files are kept for review and ignored by Git.",
  );
} finally {
  client.destroy();
}
