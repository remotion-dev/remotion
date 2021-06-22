import namer from 'color-namer';
import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {getReadableColor} from '../readable-color';

export const Shade: React.FC<{
	color: string;
}> = ({color}) => {
	const names = namer(color);
	const {fps} = useVideoConfig();
	const frame = useCurrentFrame();
	const progress = spring({
		fps,
		frame,
		config: {
			damping: 200,
		},
	});
	return (
		<div
			style={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				fontFamily:
					"--apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
				fontWeight: 'bold',
				fontSize: 100,
				lineHeight: 1.1,
				backgroundColor: getReadableColor(color),
				flex: 1,
				color,
			}}
		>
			<div
				style={{
					maxWidth: 1200,
					textAlign: 'center',
					transform: `scale(${progress})`,
				}}
			>
				It&apos;s a beautiful shade of <br />
				{names.pantone[0].name.toLowerCase()}!
			</div>
		</div>
	);
};
