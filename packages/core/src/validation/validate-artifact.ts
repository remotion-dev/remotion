import type {TRenderAsset} from '../CompositionManager';

export const validateArtifactFilename = (filename: unknown) => {
	if (typeof filename !== 'string') {
		throw new TypeError(
			`The "filename" must be a string, but you passed a value of type ${typeof filename}`,
		);
	}

	if (filename.trim() === '') {
		throw new Error('The `filename` must not be empty');
	}

	if (!filename.match(/^([0-9a-zA-Z-!_.*'()/:&$@=;+,?]+)/g)) {
		throw new Error(
			'The `filename` must match "/^([0-9a-zA-Z-!_.*\'()/:&$@=;+,?]+)/g". Use forward slashes only, even on Windows.',
		);
	}
};

const validateContent = (content: unknown) => {
	if (typeof content !== 'string' && !(content instanceof Uint8Array)) {
		throw new TypeError(
			`The "content" must be a string or Uint8Array, but you passed a value of type ${typeof content}`,
		);
	}

	if (typeof content === 'string' && content.trim() === '') {
		throw new Error('The `content` must not be empty');
	}
};

export const validateRenderAsset = (artifact: TRenderAsset) => {
	// We don't have validation for it yet
	if (artifact.type !== 'artifact') {
		return;
	}

	validateArtifactFilename(artifact.filename);
	validateContent(artifact.content);
};
