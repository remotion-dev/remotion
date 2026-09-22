import { existsSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import {
  duplicateComposition,
  setCompositionDefaultProps,
} from "@remotion/codemods";

const ROOT_RELATIVE_PATH = path.join("remotion", "Root.tsx");
const TEMPLATE_COMPOSITION_ID = "empty";

const compositionExists = (src: string, compositionId: string) => {
  return (
    src.includes(`id="${compositionId}"`) ||
    src.includes(`id={'${compositionId}'}`) ||
    src.includes(`id={"${compositionId}"}`)
  );
};

const getDefaultPropsForNewProject = () => ({
  theme: "light",
  canvasLayout: "square",
  platform: "youtube",
  scenes: [
    {
      type: "videoscene",
      webcamPosition: "bottom-right",
      endOffset: 0,
      transitionToNextScene: false,
      newChapter: "",
      stopChapteringAfterThis: false,
      music: "none",
      startOffset: 0,
      bRolls: [],
    },
  ],
  scenesAndMetadata: [],
});

export const registerComposition = async ({
  rootDir,
  projectName,
}: {
  rootDir: string;
  projectName: string;
}): Promise<{ registered: boolean; reason?: string }> => {
  const rootPath = path.join(rootDir, ROOT_RELATIVE_PATH);

  if (!existsSync(rootPath)) {
    return { registered: false, reason: "Root.tsx not found" };
  }

  const src = readFileSync(rootPath, "utf-8");

  if (compositionExists(src, projectName)) {
    return { registered: false, reason: "Composition already exists" };
  }

  try {
    const duplicated = duplicateComposition({
      project: { rootDir, files: { [rootPath]: src } },
      compositionFile: rootPath,
      compositionId: TEMPLATE_COMPOSITION_ID,
      newId: projectName,
    });
    const result = setCompositionDefaultProps({
      project: duplicated.project,
      compositionFile: rootPath,
      compositionId: projectName,
      defaultProps: getDefaultPropsForNewProject(),
    });
    const withDefaultScene = result.project.files[rootPath];
    if (withDefaultScene === undefined) {
      throw new Error("Could not find the updated composition file");
    }

    writeFileSync(rootPath, withDefaultScene, "utf-8");
    return { registered: true };
  } catch (err) {
    return {
      registered: false,
      reason: err instanceof Error ? err.message : String(err),
    };
  }
};
