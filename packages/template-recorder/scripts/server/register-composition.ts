import { existsSync, readFileSync, writeFileSync } from "fs";
import path from "path";

const ROOT_RELATIVE_PATH = path.join("remotion", "Root.tsx");
const TEMPLATE_COMPOSITION_ID = "empty";

const findEmptyCompositionBlock = (src: string): string | null => {
  const idMarker = `id="${TEMPLATE_COMPOSITION_ID}"`;
  const idIndex = src.indexOf(idMarker);
  if (idIndex === -1) {
    return null;
  }

  const startIndex = src.lastIndexOf("<Composition", idIndex);
  if (startIndex === -1) {
    return null;
  }

  const endMarker = "/>";
  const endIndex = src.indexOf(endMarker, idIndex);
  if (endIndex === -1) {
    return null;
  }

  return src.slice(startIndex, endIndex + endMarker.length);
};

export const registerComposition = ({
  rootDir,
  projectName,
}: {
  rootDir: string;
  projectName: string;
}): { registered: boolean; reason?: string } => {
  const rootPath = path.join(rootDir, ROOT_RELATIVE_PATH);

  if (!existsSync(rootPath)) {
    return { registered: false, reason: "Root.tsx not found" };
  }

  const src = readFileSync(rootPath, "utf-8");

  if (src.includes(`id="${projectName}"`)) {
    return { registered: false, reason: "Composition already exists" };
  }

  const emptyBlock = findEmptyCompositionBlock(src);
  if (!emptyBlock) {
    return {
      registered: false,
      reason: 'Could not find <Composition id="empty"> to clone',
    };
  }

  const defaultVideoScene = `          scenes: [
            {
              type: "videoscene" as const,
              webcamPosition: "bottom-right" as const,
              endOffset: 0,
              transitionToNextScene: false,
              newChapter: "",
              stopChapteringAfterThis: false,
              music: "none" as const,
              startOffset: 0,
              bRolls: [],
            },
          ],`;

  const cloned = emptyBlock
    .replace(
      `id="${TEMPLATE_COMPOSITION_ID}"`,
      `id="${projectName}"`,
    )
    .replace("          scenes: [],", defaultVideoScene);

  const newSrc = src.replace(emptyBlock, `${cloned}\n      ${emptyBlock}`);

  writeFileSync(rootPath, newSrc, "utf-8");
  return { registered: true };
};
