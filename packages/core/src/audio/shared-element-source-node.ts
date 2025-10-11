export const makeSharedElementSourceNode = ({
	audioContext,
	ref,
}: {
	audioContext: AudioContext;
	ref: React.RefObject<HTMLAudioElement | null>;
}) => {
	let connected: MediaElementAudioSourceNode | null = null;

	return {
		attemptToConnect: () => {
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
	};
};

export type SharedElementSourceNode = ReturnType<
	typeof makeSharedElementSourceNode
>;
