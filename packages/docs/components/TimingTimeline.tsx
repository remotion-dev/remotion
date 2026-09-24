import React from 'react';

export const TimingTimeline: React.FC<{
	readonly from: number;
	readonly durationInFrames: number;
}> = ({from, durationInFrames}) => {
	return (
		<div
			role="img"
			aria-label={`A sequence on the timeline from frame ${from} through frame ${from + durationInFrames - 1}`}
			style={{
				backgroundColor: '#15181B',
				borderRadius: 4,
				overflow: 'hidden',
				marginBottom: 20,
			}}
		>
			<div
				style={{
					height: 39,
					backgroundColor: 'rgb(31, 36, 40)',
					borderBottom: '1px solid #13161B',
				}}
			>
				<div style={{position: 'relative', height: '100%', margin: '0 16px'}}>
					{Array.from({length: 7}, (_, index) => {
						const frame = index * 15;
						return (
							<div
								key={frame}
								style={{position: 'absolute', left: `${(frame / 90) * 100}%`}}
							>
								<div
									style={{
										width: 1,
										height: frame % 30 === 0 ? 15 : 5,
										backgroundColor: 'rgba(255, 255, 255, 0.15)',
									}}
								/>
								{frame % 30 === 0 && frame < 90 ? (
									<span
										style={{
											position: 'absolute',
											top: 7,
											left: 8,
											color: '#A6A7A9',
											fontSize: 12,
											whiteSpace: 'nowrap',
										}}
									>
										{frame}f
									</span>
								) : null}
							</div>
						);
					})}
				</div>
			</div>
			<div style={{height: 45, boxSizing: 'border-box', padding: '12px 16px'}}>
				<div style={{position: 'relative', height: 21}}>
					<div
						style={{
							position: 'absolute',
							left: `${(from / 90) * 100}%`,
							width: `${(durationInFrames / 90) * 100}%`,
							height: 21,
							boxSizing: 'border-box',
							border: '1px solid rgba(255, 255, 255, 0.2)',
							borderRadius: 2,
							backgroundColor: '#0b84f3',
							color: 'white',
							fontSize: 11,
							lineHeight: '19px',
							paddingLeft: 6,
						}}
					>
						Sequence
					</div>
				</div>
			</div>
		</div>
	);
};
