export const makeSharedElementSourceNode = ({
	audioContext,
	ref,
}: {
	audioContext: AudioContext | null;
	ref: React.RefObject<HTMLAudioElement | null>;
}) => {
	let connected: MediaElementAudioSourceNode | null = null;
	let disposed = false;
	let currentAudioContext = audioContext;

	// We must allow this to cleanup and create a new one due to strict mode.
	return {
		setAudioContext: (newAudioContext: AudioContext | null) => {
			currentAudioContext = newAudioContext;
		},
		attemptToConnect: () => {
			if (disposed) {
				throw new Error('SharedElementSourceNode has been disposed');
			}

			if (!connected && ref.current && currentAudioContext) {
				const mediaElementSourceNode =
					currentAudioContext.createMediaElementSource(ref.current);

				connected = mediaElementSourceNode;
			}
		},
		get: () => {
			if (!connected) {
				throw new Error('Audio element not connected');
			}

			return connected;
		},
		cleanup: () => {
			if (connected) {
				connected.disconnect();
				connected = null;
			}

			disposed = true;
		},
	};
};

export type SharedElementSourceNode = ReturnType<
	typeof makeSharedElementSourceNode
>;
