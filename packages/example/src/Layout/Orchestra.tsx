import {spring, useCurrentFrame, useVideoConfig} from '@remotion/core';
import React from 'react';
import {Phone, PhoneHeight, PhoneWidth} from './Phone';

export const Orchestra: React.FC<{
	layers: number;
	yOffset: number;
	xOffset: number;
	phoneScale: number;
}> = ({layers, xOffset, yOffset, phoneScale}) => {
	const config = useVideoConfig();
	const rows = layers * 2 + 1;
	const columns = 4;
	const frame = useCurrentFrame();
	const progress = spring({
		damping: 10,
		mass: 0.1,
		stiffness: 10,
		restSpeedThreshold: 0.00001,
		restDisplacementThreshold: 0.0001,
		fps: config.fps,
		frame,
		from: 2.2,
		to: 0.9,
	});
	return (
		<div
			style={{
				height: config.height,
				width: config.width,
				transform: `scale(${progress})`,
			}}
		>
			{new Array(rows)
				.fill(true)
				.map((_, r) => r)
				.map((r) => {
					const actualColumns = r % 2 === 1 ? columns + 1 : columns;
					return (
						<React.Fragment key={r}>
							{new Array(actualColumns)
								.fill(true)
								.map((_, c) => c)
								.map((c) => {
									const offset = r % 2 === 1 ? xOffset : 0;
									const extraLeft = r % 2 === 1 ? xOffset : 0;
									return (
										<Phone
											key={c}
											phoneScale={phoneScale}
											style={{
												left:
													config.width / 2 -
													PhoneWidth / 2 +
													c * xOffset -
													((actualColumns - 1) * xOffset) / 2 +
													offset -
													extraLeft,
												top:
													config.height / 2 -
													PhoneHeight / 2 +
													r * yOffset -
													((rows - 1) * yOffset) / 2,
											}}
										/>
									);
								})}
						</React.Fragment>
					);
				})}
		</div>
	);
};
