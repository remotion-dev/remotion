import type {Map as MapTilerMap} from '@maptiler/sdk';

export const delayMapRender = ({
	continueRender,
	delayRender,
	label,
	map,
}: {
	readonly continueRender: (handle: number) => void;
	readonly delayRender: (label?: string) => number;
	readonly label: string;
	readonly map: MapTilerMap;
}) => {
	const handle = delayRender(label);
	let hasFinished = false;
	const finish = () => {
		if (hasFinished) {
			return;
		}

		hasFinished = true;
		continueRender(handle);
	};

	map.once('idle', finish);
	map.triggerRepaint();

	return () => {
		map.off('idle', finish);
		finish();
	};
};
