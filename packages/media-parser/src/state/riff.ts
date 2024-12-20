import type {SpsAndPps} from './parser-state';

type AvcProfileInfoCallback = (profile: SpsAndPps) => Promise<void>;

export const riffSpecificState = () => {
	let avcProfile: SpsAndPps | null = null;
	let nextTrackIndex = 0;

	const profileCallbacks: AvcProfileInfoCallback[] = [];

	const registerOnAvcProfileCallback = (callback: AvcProfileInfoCallback) => {
		profileCallbacks.push(callback);
	};

	const onProfile = async (profile: SpsAndPps) => {
		avcProfile = profile;
		for (const callback of profileCallbacks) {
			await callback(profile);
		}

		profileCallbacks.length = 0;
	};

	return {
		getAvcProfile: () => {
			return avcProfile;
		},
		onProfile,
		registerOnAvcProfileCallback,
		getNextTrackIndex: () => {
			return nextTrackIndex;
		},
		incrementNextTrackIndex: () => {
			nextTrackIndex++;
		},
	};
};
