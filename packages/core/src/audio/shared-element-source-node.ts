export const makeSharedElementSourceNode = ({
	audioContext,
	ref,
}: {
	audioContext: AudioContext;
	ref: React.RefObject<HTMLAudioElement | null>;
}) => {
	let connected: MediaElementAudioSourceNode | null = null;
	let disposed = false;

	// We must allow this to cleanup and create a new one due to strict mode.
	return {
		attemptToConnect: () => {
			if (disposed) {
				throw new Error('SharedElementSourceNode has been disposed');
			}

			if (!connected && ref.current) {
				const mediaElementSourceNode = audioContext.createMediaElementSource(
					ref.current,
				);

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
