import {PlayerInternals} from '@remotion/player';
import {useRef} from 'react';
import {Canvas} from './Canvas';
import type {DraggedConfig} from './types';

export const CanvasWrapper: React.FC<{
	readonly draggedConfig: DraggedConfig | null;
	readonly draggedDuration: number | null;
	readonly duration: number;
	readonly config: DraggedConfig;
	readonly fps: number;
}> = ({config, draggedConfig, draggedDuration, duration, fps}) => {
	const outer = useRef<HTMLDivElement>(null);

	const elementSize = PlayerInternals.useElementSize(outer, {
		shouldApplyCssTransforms: false,
		triggerOnWindowResize: true,
	});

	return (
		<div
			ref={outer}
			style={{
				flex: 1,
				overflow: 'hidden',
				width: '100%',
				height: '100%',
				position: 'relative',
			}}
		>
			{elementSize ? (
				<Canvas
					config={config}
					draggedConfig={draggedConfig}
					draggedDuration={draggedDuration}
					duration={duration}
					fps={fps}
					height={elementSize.height * window.devicePixelRatio}
					width={elementSize.width * window.devicePixelRatio}
				/>
			) : null}
		</div>
	);
};
