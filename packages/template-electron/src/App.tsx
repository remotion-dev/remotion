import {useEffect, useRef, useState} from "react";
import {RENDER_CANCELLED_MESSAGE} from "./electron-api";

function getProgressLabel(stage: "browser-download" | "bundling" | "rendering") {
  switch (stage) {
    case "browser-download":
      return "Downloading Chrome Headless Shell";
    case "bundling":
      return "Bundling the Remotion project";
    case "rendering":
      return "Rendering video";
    default:
      throw new Error(`Unknown render stage: ${stage satisfies never}`);
  }
}

type StatusState = "error" | "success" | "progress" | "cancelled" | "idle";

function getStatusState({
  isBusy,
  result,
  status,
}: {
  isBusy: boolean;
  result: string | null;
  status: string;
}): StatusState {
  if (status.startsWith("Render failed:")) {
    return "error";
  }

  if (result) {
    return "success";
  }

  if (isBusy) {
    return "progress";
  }

  if (status === "Render cancelled.") {
    return "cancelled";
  }

  return "idle";
}

function getStatusLabel(statusState: StatusState) {
  switch (statusState) {
    case "error":
      return "Failed";
    case "success":
      return "Complete";
    case "progress":
      return "Rendering";
    case "cancelled":
      return "Cancelled";
    case "idle":
      return "Ready";
    default:
      throw new Error(`Unknown status state: ${statusState satisfies never}`);
  }
}

function getStatusDetail({
  result,
  status,
  statusState,
}: {
  result: string | null;
  status: string;
  statusState: StatusState;
}) {
  switch (statusState) {
    case "error":
      return status.replace(/^Render failed:\s*/, "");
    case "success":
      return result;
    case "progress":
      return status;
    case "cancelled":
      return "No file was written.";
    case "idle":
      return null;
    default:
      throw new Error(`Unknown status state: ${statusState satisfies never}`);
  }
}

function getStatusClasses(statusState: StatusState) {
  switch (statusState) {
    case "error":
      return {
        badge: "border-red-500/30 bg-red-500/10 text-red-200",
        panel: "border-red-500/20 bg-red-500/10",
      };
    case "success":
      return {
        badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
        panel: "border-emerald-500/20 bg-emerald-500/10",
      };
    case "progress":
      return {
        badge: "border-sky-500/30 bg-sky-500/10 text-sky-100",
        panel: "border-sky-500/20 bg-sky-500/10",
      };
    case "cancelled":
      return {
        badge: "border-white/10 bg-white/5 text-slate-200",
        panel: "border-white/10 bg-white/5",
      };
    case "idle":
      return {
        badge: "border-white/10 bg-white/5 text-slate-200",
        panel: "border-white/10 bg-white/5",
      };
    default:
      throw new Error(`Unknown status state: ${statusState satisfies never}`);
  }
}

function isFinalStatusMessage(message: string) {
  return (
    message === RENDER_CANCELLED_MESSAGE ||
    message.startsWith("Render failed:") ||
    message.startsWith("Render complete:")
  );
}

export const App: React.FC = () => {
  const [titleText, setTitleText] = useState("Hello from Electron");
  const [status, setStatus] = useState("Ready to render.");
  const [result, setResult] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [hasStartedRender, setHasStartedRender] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const isCancellingRef = useRef(false);

  useEffect(() => {
    isCancellingRef.current = isCancelling;
  }, [isCancelling]);

  useEffect(() => {
    return window.remotionElectron.onRenderUpdate((update) => {
      if (update.type === "status") {
        if (isCancellingRef.current && !isFinalStatusMessage(update.message)) {
          return;
        }

        setStatus(update.message);
        return;
      }

      if (isCancellingRef.current) {
        return;
      }

      const rounded = Math.round(update.progress);
      setStatus(`${getProgressLabel(update.stage)}: ${rounded}%`);
    });
  }, []);

  async function onRender() {
    setHasStartedRender(true);
    setIsBusy(true);
    setIsCancelling(false);
    setResult(null);

    try {
      setStatus("Choose where to save the render...");
      const saveDialog = await window.remotionElectron.selectRenderOutput();

      if (saveDialog.canceled || !saveDialog.outputPath) {
        setStatus("Render cancelled.");
        return;
      }

      setStatus("Preparing render...");
      const renderResult = await window.remotionElectron.renderVideo({
        titleText,
        outputPath: saveDialog.outputPath,
      });

      if (renderResult.cancelled) {
        setStatus(RENDER_CANCELLED_MESSAGE);
        return;
      }

      setStatus("Render complete.");
      setResult(
        `Saved to ${renderResult.outputPath} and revealed in your file manager.`,
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Rendering failed for an unknown reason.";
      setStatus(`Render failed: ${message}`);
    } finally {
      setIsCancelling(false);
      setIsBusy(false);
    }
  }

  async function onCancel() {
    setIsCancelling(true);
    setStatus("Cancelling render...");

    try {
      const result = await window.remotionElectron.cancelRender();
      if (!result.didCancel) {
        setStatus(RENDER_CANCELLED_MESSAGE);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to cancel render.";
      setStatus(`Render failed: ${message}`);
      setIsBusy(false);
    } finally {
      setIsCancelling(false);
    }
  }

  const statusState = getStatusState({isBusy, result, status});
  const statusLabel = getStatusLabel(statusState);
  const statusDetail = getStatusDetail({result, status, statusState});
  const statusClasses = getStatusClasses(statusState);
  const showOutcome = hasStartedRender && !isBusy && statusState !== "idle";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-app text-app-text">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>
      <div className="relative mx-auto flex w-full max-w-3xl px-6 py-6 sm:px-8">
        <section className="w-full border border-panel-edge bg-panel px-6 py-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)] sm:px-8">
          <h1 className=" text-balance text-[30px] font-semibold leading-[1.02] text-white sm:text-2xl">
            Remotion + Electron
          </h1>
          <p className="mt-3 max-w-[58ch] text-[15px] leading-6 text-app-muted">
            A minimal starter for desktop video rendering with React, Vite, and
            Remotion. Set a title, choose an output path, and export the sample
            composition locally.
          </p>
          <div className="mt-4 border border-white/8 bg-app/60 p-4">
            <div className="space-y-3">
              <label
                className="block text-[13px] font-medium text-slate-300"
                htmlFor="title-text"
              >
                Title text
              </label>
              <input
                id="title-text"
                className="w-full border border-input-border bg-input px-3 py-2.5 text-[15px] leading-6 text-white outline-none placeholder:text-app-dim hover:border-input-border-hover focus:border-brand disabled:cursor-not-allowed disabled:opacity-70"
                type="text"
                value={titleText}
                onChange={(event) => setTitleText(event.currentTarget.value)}
                disabled={isBusy}
                placeholder="Hello from Electron"
              />
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                {isBusy ? (
                  <>
                    <div
                      className={`flex min-h-10 flex-1 items-center border px-3 py-2 ${statusClasses.panel}`}
                    >
                      <p className="truncate text-[14px] leading-6 text-app-text">
                        {statusDetail}
                      </p>
                    </div>
                    <button
                      className="inline-flex min-h-8 items-center justify-center border border-white/15 bg-white/5 px-3 py-1.5 text-[13px] font-semibold text-white hover:border-white/25 hover:bg-white/10 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-slate-400"
                      type="button"
                      onClick={onCancel}
                      disabled={isCancelling}
                    >
                      {isCancelling ? "Cancelling..." : "Cancel render"}
                    </button>
                  </>
                ) : (
                  <button
                    className="inline-flex min-h-8 items-center justify-center border border-brand/70 bg-brand px-3 py-1.5 text-[13px] font-semibold text-white hover:border-brand-bright hover:bg-brand-bright disabled:cursor-not-allowed disabled:border-brand/35 disabled:bg-brand-muted"
                    type="button"
                    onClick={onRender}
                    disabled={isBusy}
                  >
                    Export video
                  </button>
                )}
              </div>
            </div>
          </div>
          {showOutcome ? (
            <div className={`mt-4 border p-4 ${statusClasses.panel}`}>
              <div className="flex items-center gap-3">
                <p
                  className={`inline-flex items-center border px-2 py-1 text-[11px] font-semibold ${statusClasses.badge}`}
                >
                  {statusLabel}
                </p>
              </div>
              {statusDetail ? (
                <p className="mt-4 text-[14px] leading-6 text-app-text">
                  {statusDetail}
                </p>
              ) : null}
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
};
