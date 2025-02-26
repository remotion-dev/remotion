
import { PassThrough } from "node:stream";

import { createReadableStreamFromReadable } from "@react-router/node";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import type {AppLoadContext, EntryContext} from 'react-router'
import {  ServerRouter } from "react-router";

export const streamTimeout = 5_000;

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  context: EntryContext,
  // This is ignored so we can keep it in the template for visibility.  Feel
  // free to delete this parameter in your app if you're not using it!
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  loadContext: AppLoadContext,
) {
  return isbot(request.headers.get("user-agent") || "")
    ? handleBotRequest(
        request,
        responseStatusCode,
        responseHeaders,
        context,
      )
    : handleBrowserRequest(
        request,
        responseStatusCode,
        responseHeaders,
        context,
      );
}

function handleBotRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  context: EntryContext,
) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      <ServerRouter
        context={context}
        url={request.url}

      />,
      {
        onAllReady() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);

          responseHeaders.set("Content-Type", "text/html");

          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode,
            }),
          );

          pipe(body);
        },
        onShellError(error: unknown) {
          reject(error);
        },
        onError(error: unknown) {
          responseStatusCode = 500;
          // Log streaming rendering errors from inside the shell.  Don't log
          // errors encountered during initial shell rendering since they'll
          // reject and get logged in handleDocumentRequest.
          if (shellRendered) {
            console.error(error);
          }
        },
      },
    );

    setTimeout(abort, streamTimeout + 1000);
  });
}

function handleBrowserRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  context: EntryContext,
) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      <ServerRouter
        context={context}
        url={request.url}
      />,
      {
        onShellReady() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);

          responseHeaders.set("Content-Type", "text/html");

          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode,
            }),
          );

          pipe(body);
        },
        onShellError(error: unknown) {
          reject(error);
        },
        onError(error: unknown) {
          responseStatusCode = 500;
          // Log streaming rendering errors from inside the shell.  Don't log
          // errors encountered during initial shell rendering since they'll
          // reject and get logged in handleDocumentRequest.
          if (shellRendered) {
            console.error(error);
          }
        },
      },
    );

    setTimeout(abort, streamTimeout + 1000);
  });
}
