import {Audio} from '@remotion/media';
import {
	CalculateMetadataFunction,
	Composition,
	useCurrentFrame,
} from 'remotion';
// https://www.remotion.dev/docs/mediabunny/metadata
import {useMemo} from 'react';
import {getMediaMetadata} from '../get-media-metadata';

const src = 'https://remotion.media/dialogue.wav';

export const calculateMetadataFn: CalculateMetadataFunction<
	Record<string, unknown>
> = async () => {
	const {durationInSeconds} = await getMediaMetadata(src);

	return {
		durationInFrames: Math.round(durationInSeconds * 30),
		fps: 30,
		width: 100,
		height: 100,
	};
};

export const Component = () => {
	const frame = useCurrentFrame();

	const trimBefore = useMemo(() => {
		if (frame < 90) {
			return 0;
		}

		if (frame < 270) {
			return 200;
		}

		return 400;
	}, [frame]);

	return <Audio src={src} trimBefore={trimBefore} />;
};

export const ChangingTrimBeforeValue = () => {
	return (
		<Composition
			component={Component}
			id="ChangingTrimBeforeValue"
			calculateMetadata={calculateMetadataFn}
		/>
	);
};

// In Root.tsx:
// <ChangingTrimBeforeValue />
