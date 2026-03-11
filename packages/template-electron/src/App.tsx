import {useEffect, useState} from "react";

export const App: React.FC = () => {
  const [titleText, setTitleText] = useState("Hello from Electron");
  const [status, setStatus] = useState("Ready to render.");
  const [result, setResult] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    return window.remotionElectron.onRenderUpdate((update) => {
      if (update.type === "status") {
        setStatus(update.message);
        return;
      }

      const rounded = Math.round(update.progress);
      const label =
        update.stage === "bundling"
          ? "Bundling the Remotion project"
          : "Rendering video";
      setStatus(`${label}: ${rounded}%`);
    });
  }, []);

  const onRender = async () => {
    setIsBusy(true);
    setResult(null);

    try {
      setStatus("Choose where to save the render...");
      const saveDialog = await window.remotionElectron.selectRenderOutput();

      if (saveDialog.canceled || !saveDialog.outputPath) {
        setStatus("Render cancelled.");
        return;
      }

      setStatus("Preparing render...");
      const {outputPath} = await window.remotionElectron.renderVideo({
        titleText,
        outputPath: saveDialog.outputPath,
      });

      setStatus("Render complete.");
      setResult(`Saved to ${outputPath} and revealed in Finder.`);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Rendering failed for an unknown reason.";
      setStatus(`Render failed: ${message}`);
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <main className="app-shell">
      <p className="eyebrow">Electron Forge + Vite + TypeScript + React</p>
      <h1>Render a Remotion video from Electron</h1>
      <p className="description">
        This app launches a minimal Electron window, uses React for the UI layer,
        and renders the <code>HelloWorld</code> composition in the Electron main
        process.
      </p>
      <label className="field" htmlFor="title-text">
        Title text
      </label>
      <input
        id="title-text"
        className="text-input"
        type="text"
        value={titleText}
        onChange={(event) => setTitleText(event.currentTarget.value)}
        disabled={isBusy}
      />
      <button
        className="render-button"
        type="button"
        onClick={onRender}
        disabled={isBusy}
      >
        Render example video
      </button>
      <p className="status">{status}</p>
      {result ? <p className="result">{result}</p> : null}
    </main>
  );
};
