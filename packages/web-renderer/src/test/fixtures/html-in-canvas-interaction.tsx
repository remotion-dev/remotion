import {useCallback, useState} from 'react';
import {HtmlInCanvas, type HtmlInCanvasOnPaint} from 'remotion';

type Props = {
	readonly onEvent: ((event: 'enter' | 'click') => void) | null;
	readonly onPainted: ((canvas: OffscreenCanvas) => void) | null;
};

const Component: React.FC<Props> = ({onEvent, onPainted}) => {
	const [clicked, setClicked] = useState(false);
	const onPaint: HtmlInCanvasOnPaint = useCallback(
		({canvas, elementImage}) => {
			const ctx = canvas.getContext('2d')!;
			ctx.reset();
			ctx.translate(24, 12);
			ctx.scale(0.75, 0.75);
			ctx.drawElementImage(elementImage, 0, 0);
			onPainted?.(canvas);
		},
		[onPainted],
	);
	return (
		<HtmlInCanvas width={160} height={96} pixelDensity={1} onPaint={onPaint}>
			<button
				type="button"
				aria-label="Canvas interaction"
				onPointerEnter={() => onEvent?.('enter')}
				onClick={() => {
					onEvent?.('click');
					setClicked(true);
				}}
				style={{
					position: 'absolute',
					left: 20,
					top: 20,
					width: 80,
					height: 40,
					padding: 0,
					border: 0,
					background: clicked ? 'lime' : 'blue',
				}}
			/>
		</HtmlInCanvas>
	);
};

export const htmlInCanvasInteraction = {
	component: Component,
	id: 'html-in-canvas-interaction',
	width: 160,
	height: 96,
	fps: 30,
	durationInFrames: 1,
	defaultProps: {onEvent: null, onPainted: null},
} as const;
