import React, { useEffect, useState } from "react";
import {
  getInputProps,
  delayRender,
  continueRender,
  AbsoluteFill,
} from "remotion";
import { compileCode } from "./compiler";

interface DynamicCompProps {
  code: string;
  [key: string]: unknown;
}

export const DynamicComp: React.FC = () => {
  const { code } = getInputProps() as DynamicCompProps;

  const [handle] = useState(() => delayRender("Compiling code..."));
  const [Component, setComponent] = useState<React.ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const result = compileCode(code);

      if (result.error) {
        setError(result.error);
      } else {
        setComponent(() => result.Component);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      continueRender(handle);
    }
  }, [code, handle]);

  if (error) {
    return (
      <AbsoluteFill
        style={{
          backgroundColor: "#1a1a2e",
          justifyContent: "center",
          alignItems: "center",
          padding: 60,
        }}
      >
        <div
          style={{
            color: "#ff6b6b",
            fontSize: 42,
            fontFamily: "system-ui, sans-serif",
            textAlign: "center",
            maxWidth: "80%",
          }}
        >
          Compilation Error
        </div>
        <div
          style={{
            color: "#fff",
            fontSize: 24,
            fontFamily: "monospace",
            marginTop: 24,
            textAlign: "center",
            maxWidth: "80%",
            wordBreak: "break-word",
          }}
        >
          {error}
        </div>
      </AbsoluteFill>
    );
  }

  if (!Component) {
    return null;
  }

  return <Component />;
};
