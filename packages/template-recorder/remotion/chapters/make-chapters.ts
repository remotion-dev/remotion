import type { SceneAndMetadata } from "../../config/scenes";

export type ChapterType = {
  title: string;
  start: number;
  index: number;
};

export const makeChapters = ({ scenes }: { scenes: SceneAndMetadata[] }) => {
  const chapters: ChapterType[] = [];

  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i] as SceneAndMetadata;

    if (scene.type === "video-scene" && scene.scene.newChapter) {
      const chapter: ChapterType = {
        title: scene.scene.newChapter,
        start: scene.from,
        index: chapters.length,
      };

      chapters.push(chapter);
    }

    if (scene.type === "video-scene" && scene.scene.stopChapteringAfterThis) {
      break;
    }
  }

  return chapters;
};
