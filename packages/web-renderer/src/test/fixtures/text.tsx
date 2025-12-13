import React from 'react';
import {AbsoluteFill} from 'remotion';

const Component: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				backgroundColor: 'white',
			}}
		>
			<div style={{width: 550}}>
				Hello from{' '}
				<a href="https://github.com/WICG/html-in-canvas">html-in-canvas</a>!
				<br />I{"'"}m multi-line, <b>formatted</b>, rotated text with emoji
				(&#128512;), RTL text
				<span dir="rtl">من فارسی صحبت میکنم</span>
				{','}
				vertical text,
				<p style={{writingMode: 'vertical-rl'}}>这是垂直文本</p>
				an inline image (
				<img width={150} src="wolf.jpg" alt="Wolf" />
				), and
				<svg width={50} height={50}>
					<circle cx={25} cy={25} r={20} fill="green" />
					<text x={25} y={30} fontSize={15} textAnchor="middle" fill="#fff">
						SVG
					</text>
				</svg>
				!
			</div>
		</AbsoluteFill>
	);
};

export const simpleRotatedSvg = {
	component: Component,
	id: 'paragraph-with-strong',
	width: 100,
	height: 100,
	fps: 30,
	durationInFrames: 100,
} as const;
