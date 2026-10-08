import {useCallback} from 'react';
import {HtmlInCanvas, type HtmlInCanvasOnPaint} from 'remotion';

export type HtmlInCanvasBlurProps = {
	readonly filter: string;
	readonly offset: boolean;
	readonly onPainted: ((canvas: OffscreenCanvas) => void) | null;
};

const Component: React.FC<HtmlInCanvasBlurProps> = ({
	filter,
	offset,
	onPainted,
}) => {
	const onPaint: HtmlInCanvasOnPaint = useCallback(
		({canvas, elementImage}) => {
			const ctx = canvas.getContext('2d');
			if (!ctx) {
				throw new Error('Failed to acquire 2D context');
			}

			ctx.reset();
			ctx.filter = filter;
			ctx.drawElementImage(elementImage, 0, 0);
			onPainted?.(canvas);
		},
		[filter, onPainted],
	);

	return (
		<HtmlInCanvas
			width={1280}
			height={720}
			pixelDensity={1}
			onPaint={onPaint}
			style={{backgroundColor: 'red'}}
		>
			<div
				style={{
					fontSize: 80,
					color: 'black',
					...(offset
						? ({
								width: 2875,
								height: 1487,
								position: 'relative',
								left: 338,
								top: 299,
							} as const)
						: {}),
				}}
			>
				Hello
			</div>
		</HtmlInCanvas>
	);
};

// #12053 uses the offset child; #9917 uses the unpositioned child.
export const htmlInCanvasBlur = {
	component: Component,
	id: 'html-in-canvas-blur',
	width: 1280,
	height: 720,
	fps: 30,
	durationInFrames: 60,
	defaultProps: {filter: 'blur(8px)', offset: true, onPainted: null},
} as const;
