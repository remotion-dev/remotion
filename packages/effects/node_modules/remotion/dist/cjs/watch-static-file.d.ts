import type { StaticFile } from './get-static-files';
type WatcherCallback = (newData: StaticFile | null) => void;
export declare const WATCH_REMOTION_STATIC_FILES = "remotion_staticFilesChanged";
export type WatchRemotionStaticFilesPayload = {
    files: StaticFile[];
};
export declare const watchStaticFile: (fileName: string, callback: WatcherCallback) => {
    cancel: () => void;
};
export {};
