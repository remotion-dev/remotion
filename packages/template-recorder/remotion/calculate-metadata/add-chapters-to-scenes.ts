import { SceneAndMetadata } from "../../config/scenes";

export const addChaptersToScenesAndMetadata = (
  scenesAndMetadata: SceneAndMetadata[],
): SceneAndMetadata[] => {
  let currentChapter: string | null = null;
  const newScenes: SceneAndMetadata[] = [];

  for (const scene of scenesAndMetadata) {
    if (scene.type !== "video-scene") {
      newScenes.push(scene);
      continue;
    }

    if (scene.scene.newChapter) {
      currentChapter = scene.scene.newChapter;
    }

    newScenes.push({ ...scene, chapter: currentChapter });
    if (scene.scene.stopChapteringAfterThis) {
      currentChapter = null;
    }
  }

  return newScenes;
};
