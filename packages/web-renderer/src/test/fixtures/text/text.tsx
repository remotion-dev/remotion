import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';

const Component: React.FC = () => {
	// TODO: Bug - if we apply the rotate to the child,
	// it does not apply.
	return (
		<AbsoluteFill
			style={{
				backgroundColor: 'gray',
				padding: 20,
				transform: 'rotate(3deg)',
			}}
		>
			<div style={{width: 550}}>
				Hello from{' '}
				<a href="https://github.com/WICG/html-in-canvas">
					remotion-web-renderer
				</a>
				!
				<br />I{"'"}m multi-line, <b>formatted</b>, rotated text with emoji
				(&#128512;), RTL text
				<span dir="rtl">من فارسی صحبت میکنم</span>
				{','}
				vertical text,
				<p style={{writingMode: 'vertical-rl'}}>这是垂直文本</p>
				an inline image (
				<Img width={150} src={staticFile('1.jpg')} alt="Wolf" />
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

export const textFixture = {
	component: Component,
	id: 'text',
	width: 550,
	height: 400,
	fps: 30,
	durationInFrames: 100,
} as const;
