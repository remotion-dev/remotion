import React, {useRef, useState} from 'react';

export const TimingTimeline: React.FC<{
	readonly from: number;
	readonly durationInFrames: number;
}> = ({from, durationInFrames}) => {
	const [frame, setFrame] = useState(from);
	const scrubbingPointer = useRef<number | null>(null);
	const totalFrames = 90;
	const fps = 30;
	const seconds = Math.floor(frame / fps);
	const timecode = `00:${String(seconds).padStart(2, '0')}.${String(frame % fps).padStart(2, '0')}`;

	const seekToPointer = (event: React.PointerEvent<HTMLDivElement>) => {
		const bounds = event.currentTarget.getBoundingClientRect();
		const rulerWidth = Math.max(1, bounds.width - 32);
		const x = Math.max(
			0,
			Math.min(rulerWidth, event.clientX - bounds.left - 16),
		);
		setFrame(
			Math.min(totalFrames - 1, Math.round((x / rulerWidth) * totalFrames)),
		);
	};

	return (
		<div
			style={{
				backgroundColor: '#15181B',
				borderRadius: 4,
				overflow: 'hidden',
				marginBottom: 20,
				display: 'grid',
				gridTemplateColumns: '90px minmax(0, 1fr)',
				gridTemplateRows: '39px 45px',
			}}
		>
			<div
				style={{
					backgroundColor: 'rgb(31, 36, 40)',
					borderBottom: '1px solid #13161B',
					boxSizing: 'border-box',
					padding: '5px 7px 5px 11px',
					display: 'flex',
					flexDirection: 'column',
					fontFamily: 'monospace',
					fontVariantNumeric: 'tabular-nums',
					color: '#A6A7A9',
				}}
			>
				<span style={{fontSize: 14, lineHeight: '21px'}}>{timecode}</span>
				<span style={{fontSize: 10, lineHeight: 1, marginTop: -2}}>
					{frame}
				</span>
			</div>
			<div
				role="slider"
				tabIndex={0}
				aria-label="Timeline playhead"
				aria-valuemin={0}
				aria-valuemax={totalFrames - 1}
				aria-valuenow={frame}
				onPointerDown={(event) => {
					if (event.button !== 0) {
						return;
					}

					scrubbingPointer.current = event.pointerId;
					event.currentTarget.setPointerCapture(event.pointerId);
					seekToPointer(event);
				}}
				onPointerMove={(event) => {
					if (scrubbingPointer.current === event.pointerId) {
						seekToPointer(event);
					}
				}}
				onPointerUp={(event) => {
					if (scrubbingPointer.current === event.pointerId) {
						scrubbingPointer.current = null;
						event.currentTarget.releasePointerCapture(event.pointerId);
					}
				}}
				onLostPointerCapture={() => {
					scrubbingPointer.current = null;
				}}
				onKeyDown={(event) => {
					if (event.key === 'ArrowLeft') {
						setFrame((current) => Math.max(0, current - 1));
					} else if (event.key === 'ArrowRight') {
						setFrame((current) => Math.min(totalFrames - 1, current + 1));
					} else if (event.key === 'Home') {
						setFrame(0);
					} else if (event.key === 'End') {
						setFrame(totalFrames - 1);
					} else {
						return;
					}

					event.preventDefault();
				}}
				style={{
					gridColumn: 2,
					gridRow: '1 / 3',
					position: 'relative',
					cursor: 'ew-resize',
					touchAction: 'none',
					userSelect: 'none',
				}}
			>
				<div
					aria-hidden="true"
					style={{
						height: 39,
						backgroundColor: 'rgb(31, 36, 40)',
						borderBottom: '1px solid #13161B',
						boxSizing: 'border-box',
					}}
				>
					<div style={{position: 'relative', height: '100%', margin: '0 16px'}}>
						{Array.from({length: 7}, (_, index) => {
							const tickFrame = index * 15;
							return (
								<div
									key={tickFrame}
									style={{
										position: 'absolute',
										left: `${(tickFrame / totalFrames) * 100}%`,
									}}
								>
									<div
										style={{
											width: 1,
											height: tickFrame % fps === 0 ? 15 : 5,
											backgroundColor: 'rgba(255, 255, 255, 0.15)',
										}}
									/>
									{tickFrame > 0 &&
									tickFrame % fps === 0 &&
									tickFrame < totalFrames ? (
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
											{tickFrame}f
										</span>
									) : null}
								</div>
							);
						})}
					</div>
				</div>
				<div
					aria-hidden="true"
					style={{height: 45, boxSizing: 'border-box', padding: '12px 16px'}}
				>
					<div style={{position: 'relative', height: 21}}>
						<div
							style={{
								position: 'absolute',
								left: `${(from / totalFrames) * 100}%`,
								width: `${(durationInFrames / totalFrames) * 100}%`,
								height: 21,
								boxSizing: 'border-box',
								border: '1px solid rgba(255, 255, 255, 0.2)',
								borderRadius: 2,
								backgroundColor: '#0b84f3',
							}}
						/>
					</div>
				</div>
				<div
					aria-hidden="true"
					style={{position: 'absolute', inset: '0 16px', pointerEvents: 'none'}}
				>
					<div
						style={{
							position: 'absolute',
							left: `${(frame / totalFrames) * 100}%`,
							top: 0,
							bottom: 0,
							width: 1,
							backgroundColor: '#f02c00',
						}}
					>
						<svg
							width={17}
							viewBox="0 0 159 212"
							style={{position: 'absolute', top: 0, left: -8}}
						>
							<path
								d="M17.0234375,1.07763419 L143.355469,1.07763419 C151.63974,1.07763419 158.355469,7.79336295 158.355469,16.0776342 L158.355469,69.390507 C158.355469,73.7938677 156.420655,77.9748242 153.064021,80.8248415 L89.3980057,134.881757 C83.7986799,139.635978 75.5802263,139.635978 69.9809005,134.881757 L6.66764807,81.1243622 C3.0872392,78.0843437 1.0234375,73.6246568 1.0234375,68.9277387 L1.0234375,17.0776342 C1.0234375,8.2410782 8.1868815,1.07763419 17.0234375,1.07763419 Z"
								fill="#f02c00"
							/>
						</svg>
					</div>
				</div>
			</div>
		</div>
	);
};
