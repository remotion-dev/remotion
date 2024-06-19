import type {EmittedArtifact} from '@remotion/renderer';

export type SerializedArtifact = {
	filename: string;
	stringContent: string;
	frame: number;
	binary: boolean;
};

export const deserializeArtifact = (
	serializedArtifact: SerializedArtifact,
): EmittedArtifact => {
	if (serializedArtifact.binary) {
		const encoder = new TextEncoder();
		const content = encoder.encode(atob(serializedArtifact.stringContent));

		return {
			filename: serializedArtifact.filename,
			content,
			frame: serializedArtifact.frame,
		};
	}

	return {
		filename: serializedArtifact.filename,
		content: serializedArtifact.stringContent,
		frame: serializedArtifact.frame,
	};
};

export const serializeArtifact = (
	artifact: EmittedArtifact,
): SerializedArtifact => {
	if (artifact.content instanceof Uint8Array) {
		const decoder = new TextDecoder('utf8');
		const b64encoded = btoa(decoder.decode(artifact.content));
		return {
			filename: artifact.filename,
			stringContent: b64encoded,
			frame: artifact.frame,
			binary: true,
		};
	}

	return {
		filename: artifact.filename,
		stringContent: artifact.content,
		frame: artifact.frame,
		binary: false,
	};
};
