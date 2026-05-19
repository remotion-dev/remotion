import {Audio} from '@remotion/media';
import {useMemo} from 'react';
import {Composition, useCurrentFrame} from 'remotion';
import {calculateMetadataFn} from './ChangingTrimBefore-calculate-metadata';

const src = 'https://remotion.media/dialogue.wav';

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
