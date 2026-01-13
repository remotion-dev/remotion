import {PlayerInternals} from '@remotion/player';
import {useRef} from 'react';
import {Canvas} from './Canvas';
import type {TimingComponent, TimingConfig} from './types';

export const CanvasWrapper: React.FC<{
	readonly components: TimingComponent[];
	readonly draggedState: {componentId: string; config: TimingConfig} | null;
	readonly draggedDuration: number | null;
	readonly duration: number;
	readonly fps: number;
	readonly replayKey: number;
}> = ({components, draggedState, draggedDuration, duration, fps, replayKey}) => {
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
					components={components}
					draggedState={draggedState}
					draggedDuration={draggedDuration}
					duration={duration}
					fps={fps}
					height={elementSize.height * window.devicePixelRatio}
					width={elementSize.width * window.devicePixelRatio}
					replayKey={replayKey}
				/>
			) : null}
		</div>
	);
};
