import type {AvcInfo} from './parse-avc';

export const getKeyFrameOrDeltaFromAvcInfo = (infos: AvcInfo[]) => {
	const keyOrDelta = infos.find(
		(i) => i.type === 'keyframe' || i.type === 'delta-frame',
	);
	if (!keyOrDelta) {
		throw new Error('expected avc to contain info about key or delta');
	}

	return keyOrDelta.type === 'keyframe' ? 'key' : 'delta';
};
