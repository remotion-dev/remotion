import {fillTextBox, measureText} from '@remotion/layout-utils';
import React from 'react';
import {SpringConfig, spring, useCurrentFrame, useVideoConfig} from 'remotion';

export const Title: React.FC<{
	readonly line1: string;
	readonly line2: string;
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
		frame: Math.max(0, frame - 4),
		from: 0,
		to: 1,
		fps,
	});
	const backGroundWord = spring({
		config: springConfig,
		frame: Math.max(0, frame - 8),
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
		text: `${line1} ${line2}`,
		fontFamily: 'does not compute',
		fontSize: fontStyle.fontSize,
	});
	const box = fillTextBox({maxBoxWidth: 270, maxLines: 1});
	const fillTextResult = box.add({
		text: `${line1} ${line2}`,
		...fontStyle,
	});

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
			<div style={{...fontStyle, position: 'relative'}}>
				<div style={{zIndex: 1, position: 'relative'}}>
					<span
						style={{
							display: 'inline-block',
							transform: `scale(${firstWord})`,
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
				<div
					style={{
						transform: `scale(${backGroundWord})`,
						display: fillTextResult.newLine ? 'none' : 'block',
					}}
				>
					<span
						style={{
							display: 'inline-block',
							color: '#eee',
							opacity: 0.7,
							fontSize: 100,
							fontStyle: 'oblique',
							position: 'absolute',
							transform: 'translateX(2px)',
							top: -100,
							left: 0,
							right: 0,
							width,
							height,
							zIndex: -1,
						}}
					>
						{line1} {line2}
					</span>
				</div>
			</div>
		</div>
	);
};

export default Title;
