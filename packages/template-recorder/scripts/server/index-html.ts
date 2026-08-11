import { readFileSync } from "node:fs";
import { IncomingMessage, ServerResponse } from "node:http";
import path from "path";
import type { ViteDevServer } from "vite";

declare global {
  interface Window {
    remotionServerEnabled: boolean | undefined;
  }
}

export const indexHtmlDev = (vite: ViteDevServer, viteDir: string) => {
  const index = path.join(viteDir, "index.html");
  return async (req: IncomingMessage, response: ServerResponse) => {
    const template = readFileSync(index, "utf-8");
    const transformed = await vite.transformIndexHtml(
      req.url as string,
      template,
    );
    const injected = transformed.replace(
      "<!--remotion-server-placeholder-->",
      "<script>window.remotionServerEnabled = true</script>",
    );
    response.writeHead(200, {
      "Content-Type": "text/html",
    });
    response.write(injected);
    response.end();
  };
};
