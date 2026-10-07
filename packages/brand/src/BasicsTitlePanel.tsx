import {loadFont} from '@remotion/fonts';
import type React from 'react';
import {Interactive, staticFile, useVideoConfig} from 'remotion';

loadFont({
	family: 'Basics Planar',
	url: staticFile('GT Planar/GT-Planar-Medium.woff2'),
	weight: '500',
});

const BasicsTitlePanelInner = ({
	children,
	style,
}: {
	readonly children: React.ReactNode;
	readonly style: React.CSSProperties | null;
}) => {
	const {width, height} = useVideoConfig();

	return (
		<Interactive.Div
			name="Feature title"
			style={{
				position: 'absolute',
				left: (width * 2) / 3,
				top: 0,
				width: width / 3,
				height,
				boxSizing: 'border-box',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				padding: 64,
				backgroundColor: 'white',
				color: 'black',
				textAlign: 'center',
				textWrap: 'balance',
				whiteSpace: 'pre-line',
				fontFamily: 'Basics Planar, sans-serif',
				fontSize: 72,
				fontWeight: 500,
				lineHeight: 1.1,
				letterSpacing: '-1px',
				...style,
			}}
		>
			{children}
		</Interactive.Div>
	);
};

export const BasicsTitlePanel = Interactive.withSchema({
	Component: BasicsTitlePanelInner,
	componentName: '<BasicsTitlePanel>',
	schema: {
		...Interactive.childrenSchema,
		...Interactive.textSchema,
		...Interactive.backgroundSchema,
	},
	wrapInSequence: true,
});
