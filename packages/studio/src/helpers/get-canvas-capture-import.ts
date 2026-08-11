import {parseCanvasCaptureData} from '@remotion/studio-shared';
import {ALL_FORMATS, BlobSource, Input} from 'mediabunny';

export const getCanvasCaptureImport = async (file: File) => {
	const input = new Input({
		formats: ALL_FORMATS,
		source: new BlobSource(file),
	});

	try {
		const [metadata, videoTrack] = await Promise.all([
			input.getMetadataTags(),
			input.getPrimaryVideoTrack(),
		]);
		const data = parseCanvasCaptureData(metadata);
		if (data === null || videoTrack === null) {
			return null;
		}

		const durationFromMetadata = await input.getDurationFromMetadata();
		const durationInSeconds =
			durationFromMetadata ?? (await input.computeDuration([videoTrack]));
		if (!Number.isFinite(durationInSeconds) || durationInSeconds <= 0) {
			return null;
		}

		return {data, durationInSeconds, file};
	} catch {
		return null;
	} finally {
		input.dispose();
	}
};
