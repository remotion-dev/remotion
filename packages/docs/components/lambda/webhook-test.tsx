import type { WebhookPayload } from "@remotion/lambda/client";
import React, { useCallback, useState } from "react";
import { BlueButton } from "../layout/Button";
import { Spinner } from "../Spinner";
import { CoolInput } from "../TextInput";

// This is a re-implementation of the calculateSignature function
// used in @remotion/lambda. This version uses the Crypto Web APIs
// instead of the NodeJS Crypto library and can therefore run in the browser.
async function calculateSignature(payload: string, secret?: string) {
  if (!secret) {
    return "NO_SECRET_PROVIDED";
  }

  const enc = new TextEncoder();
  const algorithm = { name: "HMAC", hash: "SHA-512" };
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    algorithm,
    false,
    ["sign", "verify"]
  );
  const signature = await crypto.subtle.sign(
    algorithm.name,
    key,
    enc.encode(payload)
  );
  const digest = Array.from(new Uint8Array(signature))
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
  return `sha512=${digest}`;
}

const buttonFlex: React.CSSProperties = {
  paddingBottom: 48,
  paddingTop: 8,
  display: "flex",
  justifyContent: "flex-start",
  gap: 16,
};

const inputFlex: React.CSSProperties = {
  paddingBottom: 16,
  paddingTop: 8,
  display: "flex",
  flexDirection: "column",
  gap: 16,
};

export const WebhookTest: React.FC = () => {
  const [request, setRequest] = useState({});
  const [response, setResponse] = useState<Object | null>(null);
  const [responseStatus, setResponseStatus] = useState<null | boolean>(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    url: "http://localhost:8080/webhook",
    secret: "",
  });
  const handleWebhook = useCallback(
    async (type: "success" | "error" | "timeout") => {
      setLoading(true);
      setRequest({});
      setResponseStatus(null);
      setResponse(null);
      const payload: WebhookPayload =
        type === "success"
          ? {
              type,
              renderId: "demo-render-id",
              bucketName: "demo-bucket-name",
              customData: {},
              expectedBucketOwner: "demo-bucket-owner",
              outputUrl: "https://www.example.com",
              outputFile: "demo-output.mp4",
              timeToFinish: 1500,
              lambdaErrors: [],
              costs: {
                currency: "USD",
                disclaimer:
                  "Estimated cost for lambda invocations only. Does not include cost for S3 storage and data transfer.",
                estimatedCost: 0.01,
                estimatedDisplayCost: new Intl.NumberFormat("en-US", {
                  currency: "USD",
                  currencyDisplay: "narrowSymbol",
                }).format(0.01),
              },
            }
          : type === "error"
          ? {
              errors: [
                {
                  message: "demo-error-message",
                  name: "demo-error-name",
                  stack: "demo-error-stack",
                },
              ],
              type,
              renderId: "demo-render-id",
              bucketName: "demo-bucket-name",
              customData: {},
              expectedBucketOwner: "demo-bucket-owner",
            }
          : {
              type,
              renderId: "demo-render-id",
              bucketName: "demo-bucket-name",
              customData: {},
              expectedBucketOwner: "demo-bucket-owner",
            };
      const stringifiedPayload = JSON.stringify(payload);
      const req: RequestInit = {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          "X-Remotion-Signature": await calculateSignature(
            stringifiedPayload,
            data.secret
          ),
          "X-Remotion-Status": type,
          "X-Remotion-Mode": "demo",
        },
        body: stringifiedPayload,
      };
      fetch(data.url, req)
        .then((res) => {
          setResponseStatus(res.ok);
          return res.json();
        })
        .then((res) => {
          setResponse(res);
        })
        .catch((err) => {
          setResponse(err);
        })
        .finally(() => {
          setRequest({ ...req, body: payload });
          setLoading(false);
        });
    },
    [data.secret, data.url]
  );
  return (
    <div>
      <div style={inputFlex}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ paddingBottom: 8 }}>Your webhook URL:</span>
          <CoolInput
            style={{ width: "100%" }}
            placeholder="Your webhook endpoint"
            value={data.url}
            onChange={(e) =>
              setData((prev) => ({ ...prev, url: e.target.value }))
            }
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ paddingBottom: 8 }}>Your webhook secret:</span>
          <CoolInput
            style={{ width: "100%" }}
            placeholder="Your webhook secret"
            value={data.secret}
            onChange={(e) =>
              setData((prev) => ({ ...prev, secret: e.target.value }))
            }
          />
        </div>
      </div>
      <div style={buttonFlex}>
        <BlueButton
          size="sm"
          fullWidth={false}
          loading={loading}
          onClick={() => handleWebhook("success")}
        >
          Send success
        </BlueButton>
        <BlueButton
          size="sm"
          fullWidth={false}
          loading={loading}
          onClick={() => handleWebhook("timeout")}
        >
          Send timeout
        </BlueButton>
        <BlueButton
          size="sm"
          fullWidth={false}
          loading={loading}
          onClick={() => handleWebhook("error")}
        >
          Send error
        </BlueButton>
      </div>
      {/* results */}
      {loading ? (
        <div
          style={{ width: "100%", display: "flex", justifyContent: "center" }}
        >
          <Spinner />
        </div>
      ) : null}
      {response ? (
        <>
          <span style={{ paddingBottom: 8 }}>What we sent:</span>
          <pre>{JSON.stringify(request, null, 2)}</pre>
          <span style={{ paddingBottom: 8 }}>What we received:</span>
          <pre>
            {responseStatus ? (
              <div style={{ color: "green" }}>response ok</div>
            ) : (
              <div style={{ color: "red" }}>response not ok</div>
            )}
            {JSON.stringify(response, null, 2)}
          </pre>
        </>
      ) : null}
    </div>
  );
};
