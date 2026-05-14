import React from 'react';
import {AbsoluteFill, HtmlInCanvas, Img, staticFile} from 'remotion';

// Port of https://github.com/WICG/html-in-canvas/blob/main/Examples/complex-text.html —
// demonstrates rasterizing rich text (RTL, vertical writing mode, emoji,
// inline `<img>` and inline `<svg>`) through `drawElementImage`, then
// applying a 2D-context rotation/translation to the bitmap.
export const HtmlInCanvasComplexText: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
				backgroundColor: 'white',
			}}
		>
			<HtmlInCanvas
				width={1276}
				height={636}
				style={{border: '2px solid blue'}}
				onPaint={({canvas, element, elementImage}) => {
					const ctx = canvas.getContext('2d');
					if (!ctx) {
						throw new Error('Failed to acquire 2D context');
					}

					ctx.reset();
					ctx.rotate((15 * Math.PI) / 180);
					ctx.translate(160, -40);
					const transform = ctx.drawElementImage(elementImage, 0, 0);
					element.style.transform = transform.toString();
				}}
			>
				<div
					style={{
						width: 1100,
						fontSize: 36,
						fontFamily: 'sans-serif',
						lineHeight: 1.4,
						color: 'black',
					}}
				>
					Hello from{' '}
					<a href="https://github.com/WICG/html-in-canvas">html-in-canvas</a>!
					<br />
					I&apos;m multi-line, <b>formatted</b>, rotated text with emoji
					(&#128512;), RTL text <span dir="rtl">من فارسی صحبت میکنم</span>,
					vertical text,
					<p style={{writingMode: 'vertical-rl'}}>这是垂直文本</p>
					an inline image (
					<Img
						width={150}
						src={staticFile('1.jpg')}
						alt="inline"
						style={{verticalAlign: 'middle'}}
					/>
					), and{' '}
					<svg width={50} height={50} style={{verticalAlign: 'middle'}}>
						<circle cx={25} cy={25} r={20} fill="green" />
						<text x={25} y={30} fontSize={15} textAnchor="middle" fill="#fff">
							SVG
						</text>
					</svg>
					!
				</div>
			</HtmlInCanvas>
		</AbsoluteFill>
	);
};
