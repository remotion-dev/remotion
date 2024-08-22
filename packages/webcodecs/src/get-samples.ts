import type {MP4File, MP4MediaTrack, Sample} from 'mp4box';

export const getSamples = ({
	mp4File,
	track,
}: {
	mp4File: MP4File;
	track: MP4MediaTrack;
}) => {
	mp4File.setExtractionOptions(track.id, null, {
		nbSamples: Infinity,
	});

	return new Promise<Sample[]>((resolve, reject) => {
		mp4File.onSamples = (track_id, _ref, samples) => {
			if (track_id === track.id) {
				resolve(samples);
				mp4File.onSamples = undefined;
				mp4File.onError = undefined;
			}
		};

		mp4File.onError = (e) => {
			reject(e);
			mp4File.onSamples = undefined;
			mp4File.onError = undefined;
		};

		mp4File.start();
	});
};
