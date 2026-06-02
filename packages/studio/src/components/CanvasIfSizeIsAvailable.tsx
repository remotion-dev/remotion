import type {Size} from '@remotion/player';
import {useMemo} from 'react';
import {RULER_WIDTH} from '../state/editor-rulers';
import {CanvasOrLoading} from './CanvasOrLoading';
import {useIsRulerVisible} from './EditorRuler/use-is-ruler-visible';

export const CanvasIfSizeIsAvailable: React.FC<{
	readonly size: Size | null;
}> = ({size}) => {
	const rulersAreVisible = useIsRulerVisible();

	const sizeWithRulersApplied = useMemo(() => {
		if (!rulersAreVisible) {
			return size;
		}

		if (!size) {
			return null;
		}

		return {
			...size,
			width: size.width - RULER_WIDTH,
			height: size.height - RULER_WIDTH,
		};
	}, [size, rulersAreVisible]);

	if (!sizeWithRulersApplied) {
		return null;
	}

	return <CanvasOrLoading size={sizeWithRulersApplied} />;
};
