import {loadFont} from '@remotion/google-fonts/NotoSansSC';
import React from 'react';
import {AbsoluteFill} from 'remotion';

const {fontFamily} = loadFont('normal', {
	weights: ['400'],
	subsets: ['latin', 'chinese-simplified'],
	ignoreTooManyRequestsWarning: true,
});

/**
 * Regression cover for #7258: named CJK subsets must resolve to numbered Google Fonts chunks.
 * Loads many files on purpose — open only when validating CJK loading.
 */
export const GoogleFontsCjk: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
				backgroundColor: '#ffffff',
			}}
		>
			<div
				style={{
					fontFamily,
					fontSize: 80,
					textAlign: 'center',
					lineHeight: 1.35,
					padding: 48,
					color: '#111',
				}}
			>
				你好 · 日本語 · 한글
			</div>
		</AbsoluteFill>
	);
};
