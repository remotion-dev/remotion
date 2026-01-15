import React from 'react';

const Component: React.FC = () => {
	return (
		<div
			style={{
				position: 'absolute',
				inset: 0,
				width: '100%',
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
			}}
		>
			<div
				style={{
					position: 'absolute',
					inset: 0,
					width: '100%',
					height: '100%',
					display: 'flex',
					flexDirection: 'column',
					background: 'rgb(250, 250, 250)',
				}}
			>
				<div
					style={{
						position: 'absolute',
						inset: 0,
						width: '100%',
						height: '100%',
						display: 'flex',
					}}
				>
					<div
						style={{
							position: 'absolute',
							inset: 0,
							width: '100%',
							height: '100%',
							display: 'flex',
							flexDirection: 'column',
						}}
					>
						<div
							style={{
								position: 'absolute',
								inset: '30px 0px 0px 436.375px',
								width: '613.625px',
								height: '430.143px',
								display: 'flex',
								flexDirection: 'column',
								fontSize: 56,
								lineHeight: 2,
								borderWidth: 0,
								borderStyle: 'solid',
								borderColor: 'rgb(235, 235, 235)',
								backgroundColor: 'rgb(255, 255, 255)',
								justifyContent: 'center',
								borderRadius: 20,
								opacity: 1,
							}}
						>
							<div>
								<div>
									<span
										style={{
											lineHeight: '1.2',
											display: 'inline-block',
											paddingLeft: 30,
											paddingRight: 30,
											width: '100%',
											fontWeight: 600,
											fontFamily: 'Helvetica',
										}}
									>
										<span> need</span>
										<span> FFmpeg</span>
										<span> to</span>
										<span> encode</span>
										<span> the</span>
										<span> frames</span>
										<span> and</span>
										<span> mix</span>
										<span> the</span>
										<span> audio</span>
										<span> all together</span>
										<span> into</span>
										<span> an</span>
										<span> MP4</span>
										<span> file.</span>
										<span> And</span>
										<span> if</span>
										<span> you</span>
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export const whiteSpaceCollapsing2 = {
	component: Component,
	id: 'whitespace-collapsing-2',
	width: 1080,
	height: 1080,
	fps: 30,
	durationInFrames: 1,
} as const;
