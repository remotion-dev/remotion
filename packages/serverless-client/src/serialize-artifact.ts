import type {EmittedArtifact} from '@remotion/renderer';
import type {DownloadBehavior} from 'remotion/no-react';

export type SerializedArtifact = {
	filename: string;
	stringContent: string;
	frame: number;
	binary: boolean;
	downloadBehavior: DownloadBehavior | null;
};

export const deserializeArtifact = (
	serializedArtifact: SerializedArtifact,
): EmittedArtifact => {
	if (serializedArtifact.binary) {
		const binaryString = atob(serializedArtifact.stringContent);
		const bytes = new Uint8Array(binaryString.length);
		for (let i = 0; i < binaryString.length; i++) {
			bytes[i] = binaryString.charCodeAt(i);
		}

		return {
			filename: serializedArtifact.filename,
			content: bytes,
			frame: serializedArtifact.frame,
			downloadBehavior: serializedArtifact.downloadBehavior,
		};
	}

	return {
		filename: serializedArtifact.filename,
		content: serializedArtifact.stringContent,
		frame: serializedArtifact.frame,
		downloadBehavior: serializedArtifact.downloadBehavior,
	};
};

export const serializeArtifact = (
	artifact: EmittedArtifact,
): SerializedArtifact => {
	if (artifact.content instanceof Uint8Array) {
		let binary = '';
		const bytes = new Uint8Array(artifact.content);
		const len = bytes.byteLength;
		for (let i = 0; i < len; i++) {
			binary += String.fromCharCode(bytes[i]);
		}

		const b64encoded = btoa(binary);
		return {
			filename: artifact.filename,
			stringContent: b64encoded,
			frame: artifact.frame,
			binary: true,
			downloadBehavior: artifact.downloadBehavior,
		};
	}

	return {
		filename: artifact.filename,
		stringContent: artifact.content,
		frame: artifact.frame,
		binary: false,
		downloadBehavior: artifact.downloadBehavior,
	};
};
