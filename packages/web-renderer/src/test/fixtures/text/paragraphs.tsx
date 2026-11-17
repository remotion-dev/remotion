import React from 'react';
import {AbsoluteFill} from 'remotion';

const Component: React.FC = () => {
	return (
		<AbsoluteFill>
			<div style={{width: 550, height: 240, flexShrink: 0}}>
				<p style={{color: 'red'}}>
					Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non
					risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec,
					ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula
					massa, varius a, semper congue, euismod non, mi. Proin porttitor, orci
					nec nonummy molestie, enim est eleifend mi, non fermentum diam nisl
					sit amet erat. Duis semper. Duis arcu massa, scelerisque vitae,
					consequat in, pretium a, enim. Pellentesque congue. Ut in risus
					volutpat libero pharetra tempor. Cras vestibulum bibendum augue.
					Praesent egestas leo in pede. Praesent blandit odio eu enim.
					Pellentesque sed dui ut augue blandit sodales. Vestibulum ante ipsum
					primis in faucibus orci luctus et ultrices posuere cubilia Curae;
					Aliquam nibh. Mauris ac mauris sed pede pellentesque fermentum.
					Maecenas adipiscing ante non diam sodales hendrerit.
				</p>
			</div>
			<div
				style={{
					display: 'flex',
					gap: 8,
					fontFamily: 'Arial, sans-serif',
					fontSize: 32,
					lineHeight: 1.2,
				}}
			>
				{[
					'\u4eca\u5929\u5929\u6c14\u5f88\u597d\uff0c\u6211\u4eec\u4e00\u8d77\u53bb\u516c\u56ed\u6563\u6b65\u5427\u3002',
					'\u4eca\u65e5\u306f\u3068\u3066\u3082\u826f\u3044\u5929\u6c17\u306a\u306e\u3067\u4e00\u7dd2\u306b\u516c\u5712\u3078\u6563\u6b69\u306b\u884c\u304d\u307e\u3057\u3087\u3046\u3002',
					'\uc624\ub298\uc740 \ub0a0\uc528\uac00 \uc88b\uc73c\ub2c8 \ud568\uaed8 \uacf5\uc6d0\uc73c\ub85c \uc0b0\ucc45\ud558\ub7ec \uac11\uc2dc\ub2e4.',
				].map((text) => (
					<p key={text} style={{width: 174, flexShrink: 0, margin: 0}}>
						{text}
					</p>
				))}
			</div>
		</AbsoluteFill>
	);
};

export const paragraphs = {
	component: Component,
	id: 'paragraphs',
	width: 550,
	height: 560,
	fps: 30,
	durationInFrames: 100,
} as const;
