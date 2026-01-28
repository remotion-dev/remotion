export const getCodecContainerMismatch = ({
	codec,
	container,
	supportedCodecs,
}: {
	codec: string;
	container: string;
	supportedCodecs: readonly string[];
}) => {
	if (supportedCodecs.includes(codec)) {
		return null;
	}

	return `Codec ${codec} is not supported for container ${container}`;
};
