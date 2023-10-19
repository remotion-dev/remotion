import React from 'react';
import {spring, SpringConfig, useCurrentFrame, useVideoConfig} from 'remotion';
import {measureText} from '@remotion/layout-utils';

export const Title: React.FC<{
	line1: string;
	line2: string;
}> = ({line1, line2}) => {
	const {fps} = useVideoConfig();
	const frame = useCurrentFrame();
	const springConfig: SpringConfig = {
		damping: 10,
		mass: 0.1,
		stiffness: 100,
		overshootClamping: false,
	};

	const firstWord = spring({
		config: springConfig,
		from: 0,
		to: 1,
		fps,
		frame,
	});
	const secondWord = spring({
		config: springConfig,
		frame: Math.max(0, frame - 5),
		from: 0,
		to: 1,
		fps,
	});
	const fontStyle = {
		fontSize: 110,
		fontWeight: 'bold',
		fontFamily: 'SF Pro Text',
	};
	const {width, height} = measureText({
		text: line1,
		fontFamily: fontStyle.fontFamily,
		fontSize: fontStyle.fontSize
	})
	return (
		<div
			style={{
				flex: 1,
				justifyContent: 'center',
				alignItems: 'center',
				display: 'flex',
				backgroundColor: 'white',
				textAlign: 'center',
			}}
		>
			<div
				style={fontStyle}
			>
				<span
					style={{
						display: 'inline-block',
						transform: `scale(${firstWord})`,
						width,
						height,
					}}
				>
					{line1}
				</span>
				<span
					style={{transform: `scale(${secondWord})`, display: 'inline-block'}}
				>
					{' '}
					{line2}
				</span>
			</div>
		</div>
	);
};

export default Title;
