import {
  getStaticFiles,
  reevaluateComposition,
  watchPublicFolder,
} from "@remotion/studio";
import { useEffect, useState } from "react";
import { StaticFile } from "remotion";
import {
  ALTERNATIVE1_PREFIX,
  ALTERNATIVE2_PREFIX,
  DISPLAY_PREFIX,
  WEBCAM_PREFIX,
} from "../../config/cameras";

const filterForCurrentComposition = (
  files: StaticFile[],
  compositionId: string,
) => {
  return files.filter((f) => {
    const PREFIXES_TO_WATCH = [
      `${compositionId}/${WEBCAM_PREFIX}`,
      `${compositionId}/${DISPLAY_PREFIX}`,
      `${compositionId}/${ALTERNATIVE1_PREFIX}`,
      `${compositionId}/${ALTERNATIVE2_PREFIX}`,
    ];

    return PREFIXES_TO_WATCH.some((p) => f.name.startsWith(p));
  });
};

export const useRefreshOnPublicFolderChange = (compositionId: string) => {
  const [staticFiles, setStaticFiles] = useState(() =>
    filterForCurrentComposition(getStaticFiles(), compositionId),
  );

  useEffect(() => {
    const { cancel } = watchPublicFolder(() => {
      const newStaticFiles = filterForCurrentComposition(
        getStaticFiles(),
        compositionId,
      );

      if (JSON.stringify(newStaticFiles) === JSON.stringify(staticFiles)) {
        return;
      }

      setStaticFiles(newStaticFiles);
      reevaluateComposition();
    });

    return () => {
      cancel();
    };
  }, [compositionId, staticFiles]);
};
