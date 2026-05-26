import {
  addBundleToSandbox,
  createSandbox,
  renderMediaOnVercel,
} from "@remotion/vercel";
import { COMP_NAME } from "../../../../types/constants";
import { RenderRequest } from "../../../../types/schema";
import { bundleRemotionProject } from "./helpers";
import { restoreSnapshot } from "./restore-snapshot";

export async function POST(req: Request) {
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (!blobToken) {
    throw new Error(
      'BLOB_READ_WRITE_TOKEN is not set. To fix this, go to vercel.com, log in, select Storage, click "Create Database", select "Blob", link it to your project, then add BLOB_READ_WRITE_TOKEN to your .env file.',
    );
  }

  const payload = await req.json();
  const body = RenderRequest.parse(payload);

  const sandbox = process.env.VERCEL
    ? await restoreSnapshot()
    : await createSandbox();

  try {
    if (!process.env.VERCEL) {
      bundleRemotionProject(".remotion");
      await addBundleToSandbox({ sandbox, bundleDir: ".remotion" });
    }

    const { sandboxId, cmdId } = await renderMediaOnVercel({
      sandbox,
      compositionId: COMP_NAME,
      inputProps: body.inputProps,
      detached: true,
      vercelBlob: {
        blobToken,
        access: "public",
      },
    });

    return Response.json({ sandboxId, cmdId });
  } catch (err) {
    await sandbox.stop().catch(() => undefined);
    throw err;
  }
}
