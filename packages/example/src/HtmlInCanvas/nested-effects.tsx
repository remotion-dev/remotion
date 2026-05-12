import React, {useCallback} from 'react';
import {
	AbsoluteFill,
	HtmlInCanvas,
	type HtmlInCanvasOnPaint,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

const paintBlur: HtmlInCanvasOnPaint = ({canvas, element, elementImage}) => {
	const ctx = canvas.getContext('2d');
	if (!ctx) {
		throw new Error('Failed to acquire 2D context');
	}
	ctx.reset();
	ctx.filter = 'blur(6px)';
	const transform = ctx.drawElementImage(elementImage, 0, 0);
	element.style.transform = transform.toString();
};

export const HtmlInCanvasNestedEffects: React.FC = () => {
	const frame = useCurrentFrame();
	const {width, height} = useVideoConfig();

	const paintRotation: HtmlInCanvasOnPaint = useCallback(
		({canvas, element, elementImage}) => {
			const ctx = canvas.getContext('2d');
			if (!ctx) {
				throw new Error('Failed to acquire 2D context');
			}
			ctx.reset();
			const angle = (frame / 60) * Math.PI * 2;
			ctx.translate(canvas.width / 2, canvas.height / 2);
			ctx.rotate(angle);
			ctx.translate(-canvas.width / 2, -canvas.height / 2);
			const transform = ctx.drawElementImage(elementImage, 0, 0);
			element.style.transform = transform.toString();
		},
		[frame],
	);

	const paintTint: HtmlInCanvasOnPaint = useCallback(
		({canvas, element, elementImage}) => {
			const ctx = canvas.getContext('2d');
			if (!ctx) {
				throw new Error('Failed to acquire 2D context');
			}
			ctx.reset();
			const transform = ctx.drawElementImage(elementImage, 0, 0);
			element.style.transform = transform.toString();
			ctx.globalCompositeOperation = 'multiply';
			ctx.fillStyle = '#00aaff';
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			ctx.globalCompositeOperation = 'source-over';
		},
		[],
	);

	return (
		<HtmlInCanvas width={width} height={height} onPaint={paintTint}>
			<AbsoluteFill
				style={{
					backgroundColor: 'white',
					justifyContent: 'center',
					alignItems: 'center',
				}}
			>
				<HtmlInCanvas width={200} height={200} onPaint={paintRotation} nested>
					<AbsoluteFill
						style={{
							backgroundColor: '#ffcc00',
							justifyContent: 'center',
							alignItems: 'center',
						}}
					>
						<HtmlInCanvas width={100} height={100} onPaint={paintBlur} nested>
							<AbsoluteFill
								style={{
									backgroundColor: '#ff0044',
									justifyContent: 'center',
									alignItems: 'center',
									color: 'white',
									fontFamily: 'sans-serif',
									fontSize: 48,
									fontWeight: 700,
								}}
							>
								B
							</AbsoluteFill>
						</HtmlInCanvas>
					</AbsoluteFill>
				</HtmlInCanvas>
			</AbsoluteFill>
		</HtmlInCanvas>
	);
};
