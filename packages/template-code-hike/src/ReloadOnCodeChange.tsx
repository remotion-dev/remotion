import { getStaticFiles, reevaluateComposition } from "@remotion/studio";
import { useState } from "react";
import React, { useEffect } from "react";
import { watchPublicFolder } from "@remotion/studio";
import { useRemotionEnvironment } from "remotion";

const getCurrentHash = () => {
  const files = getStaticFiles();
  const codeFiles = files.filter((file) => file.name.startsWith("code"));
  const contents = codeFiles.map((file) => file.src + file.lastModified);
  return contents.join("");
};

export const RefreshOnCodeChange: React.FC = () => {
  const [files, setFiles] = useState(getCurrentHash());
  const env = useRemotionEnvironment();

  useEffect(() => {
    if (env.isReadOnlyStudio) {
      return;
    }

    const { cancel } = watchPublicFolder(() => {
      const hash = getCurrentHash();
      if (hash !== files) {
        setFiles(hash);
        reevaluateComposition();
      }
    });

    return () => {
      cancel();
    };
  }, [files, env.isReadOnlyStudio]);

  return null;
};
