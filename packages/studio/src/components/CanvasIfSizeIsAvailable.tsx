import {useContext, useMemo} from 'react';
import {Internals} from 'remotion';
import {RULER_WIDTH} from '../state/editor-rulers';
import {CanvasOrLoading} from './CanvasOrLoading';
import {useIsRulerVisible} from './EditorRuler/use-is-ruler-visible';

export const CanvasIfSizeIsAvailable: React.FC = () => {
	const rulersAreVisible = useIsRulerVisible();
	const context = useContext(Internals.CurrentScaleContext);

	const sizeWithRulersApplied = useMemo(() => {
		const size =
			context && context.type === 'canvas-size' ? context.canvasSize : null;

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
	}, [context, rulersAreVisible]);

	if (!sizeWithRulersApplied) {
		return null;
	}

	return <CanvasOrLoading size={sizeWithRulersApplied} />;
};
