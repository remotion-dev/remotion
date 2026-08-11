import {AbsoluteFill} from 'remotion';

const Component: React.FC = () => {
	return (
		<AbsoluteFill>
			<AbsoluteFill
				style={{
					width: 1080,
					height: 1080,
					justifyContent: 'center',
					alignItems: 'center',
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
						overflow: 'hidden',
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
								transformOrigin: 'center center',
								transform:
									'scale(0.68) translateX(-525.043px) translateY(52.1668px)',
							}}
						>
							<div
								style={{
									position: 'absolute',
									inset: 0,
									width: '100%',
									height: '100%',
									display: 'flex',
									justifyContent: 'center',
									alignItems: 'center',
								}}
							>
								<svg
									width={104.4}
									height={104.4}
									viewBox="0 0 104.39999999999999 104.39999999999999"
									xmlns="http://www.w3.org/2000/svg"
									style={{
										marginLeft: -19.4897,
									}}
								>
									<path
										d="M 52.199999999999996 0 C 86.46666752667024 0 104.39999999999999 17.933332473329756 104.39999999999999 52.199999999999996 C 104.39999999999999 86.46666752667024 86.46666752667024 104.39999999999999 52.199999999999996 104.39999999999999 C 17.933332473329756 104.39999999999999 0 86.46666752667024 0 52.199999999999996 C 0 17.933332473329756 17.933332473329756 0 52.199999999999996 0 Z"
										fill="rgba(216, 68, 30, 1)"
									/>
								</svg>
							</div>
						</div>
					</div>
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

export const nestedTranslateScale = {
	component: Component,
	id: 'nested-translate-scale',
	width: 550,
	height: 700,
	fps: 30,
	durationInFrames: 100,
} as const;
