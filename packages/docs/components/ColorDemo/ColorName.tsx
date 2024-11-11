import namer from 'color-namer';
import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {getReadableColor} from './readable-color';
import {defaultStyles} from './styles';

export const Shade: React.FC<{
	readonly color: string;
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
				...defaultStyles,
				backgroundColor: getReadableColor(color),
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
