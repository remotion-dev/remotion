import {Player} from '@remotion/player';
import React, {useState, type ComponentType} from 'react';

type ElementPreviewProps = {
	readonly component: ComponentType<Record<string, never>>;
	readonly durationInFrames: number;
	readonly fps: number;
	readonly width: number;
	readonly height: number;
};

const maxPreviewHeight = 560;

export const ElementPreview: React.FC<ElementPreviewProps> = ({
	component,
	durationInFrames,
	fps,
	width,
	height,
}) => {
	const [checkerboard, setCheckerboard] = useState(true);
	const transparencyLabel = checkerboard
		? 'Use light preview background'
		: 'Show transparency as checkerboard';

	return (
		<div
			style={{
				backgroundColor: '#f5f6f7',
				overflow: 'hidden',
			}}
		>
			<div
				style={{
					aspectRatio: `${width} / ${height}`,
					maxHeight: maxPreviewHeight,
					width: '100%',
				}}
			>
				<Player
					acknowledgeRemotionLicense
					autoPlay
					component={component}
					durationInFrames={durationInFrames}
					fps={fps}
					compositionWidth={width}
					compositionHeight={height}
					controls
					initiallyMuted
					loop
					renderCustomControls={() => (
						<button
							aria-label={transparencyLabel}
							aria-pressed={checkerboard}
							onClick={() => setCheckerboard((current) => !current)}
							style={{
								alignItems: 'center',
								appearance: 'none',
								backgroundColor: 'transparent',
								border: 'none',
								color: checkerboard ? '#0b84f3' : 'white',
								cursor: 'pointer',
								display: 'inline-flex',
								height: 37,
								marginRight: 12,
								padding: '6px 0',
							}}
							title={transparencyLabel}
							type="button"
						>
							<svg
								aria-hidden="true"
								fill="none"
								focusable="false"
								height={18}
								viewBox="0 0 512 512"
								width={18}
							>
								<path
									d="M256 48h184c13.3 0 24 10.7 24 24v184H256V48zM48 256h208v208H72c-13.3 0-24-10.7-24-24V256z"
									fill="currentColor"
								/>
								<rect
									height="416"
									rx="24"
									stroke="currentColor"
									strokeWidth="32"
									width="416"
									x="48"
									y="48"
								/>
								<path
									d="M256 48v416M48 256h416"
									stroke="currentColor"
									strokeWidth="32"
								/>
							</svg>
						</button>
					)}
					style={{
						backgroundColor: checkerboard ? 'white' : '#f5f6f7',
						backgroundImage: checkerboard
							? 'conic-gradient(rgba(0, 0, 0, 0.1) 25%, transparent 0 50%, rgba(0, 0, 0, 0.1) 0 75%, transparent 0)'
							: undefined,
						backgroundSize: checkerboard ? '32px 32px' : undefined,
						height: '100%',
						width: '100%',
					}}
				/>
			</div>
		</div>
	);
};
