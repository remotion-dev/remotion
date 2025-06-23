import type {DownloadBehavior} from 'remotion';

export type EmittedArtifact = {
	filename: string;
	content: string | Uint8Array;
	frame: number;
	downloadBehavior: DownloadBehavior | null;
};
