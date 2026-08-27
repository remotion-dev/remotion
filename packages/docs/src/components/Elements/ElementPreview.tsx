import {Player} from '@remotion/player';
import React, {useState, type ComponentType} from 'react';
import type {ElementPreviewLayout} from './element-definitions';

type ElementPreviewProps = {
	readonly component: ComponentType<Record<string, never>>;
	readonly durationInFrames: number;
	readonly elementHeight: number | null;
	readonly elementWidth: number | null;
	readonly fps: number;
	readonly previewLayout: ElementPreviewLayout;
	readonly safeArea: number;
};

const previewHeight = 1080;
const previewWidth = 1920;
const checkerboardBackground =
	'conic-gradient(rgba(0, 0, 0, 0.1) 25%, transparent 0 50%, rgba(0, 0, 0, 0.1) 0 75%, transparent 0)';

export const ElementPreview: React.FC<ElementPreviewProps> = ({
	component,
	durationInFrames,
	elementHeight,
	elementWidth,
	fps,
	previewLayout,
	safeArea,
}) => {
	const [checkerboard, setCheckerboard] = useState(true);
	let centeredElementBackground: React.CSSProperties | null = null;
	if (previewLayout === 'vertical') {
		if (elementHeight === null || elementWidth === null) {
			throw new Error(
				'A vertical Element preview requires fixed Element dimensions.',
			);
		}

		const scale = Math.min(
			1,
			(previewWidth - safeArea * 2) / elementWidth,
			(previewHeight - safeArea * 2) / elementHeight,
		);
		centeredElementBackground = {
			backgroundColor: checkerboard ? 'white' : '#f5f6f7',
			backgroundImage: checkerboard ? checkerboardBackground : undefined,
			backgroundSize: checkerboard ? '32px 32px' : undefined,
			height: `${(elementHeight * scale * 100) / previewHeight}%`,
			left: '50%',
			position: 'absolute',
			top: '50%',
			transform: 'translate(-50%, -50%)',
			width: `${(elementWidth * scale * 100) / previewWidth}%`,
		};
	}

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
					aspectRatio: `${previewWidth} / ${previewHeight}`,
					backgroundColor:
						centeredElementBackground === null
							? checkerboard
								? 'white'
								: '#f5f6f7'
							: 'var(--ifm-background-surface-color)',
					backgroundImage:
						centeredElementBackground === null && checkerboard
							? checkerboardBackground
							: undefined,
					backgroundSize:
						centeredElementBackground === null && checkerboard
							? '32px 32px'
							: undefined,
					position: 'relative',
					width: '100%',
				}}
			>
				{centeredElementBackground === null ? null : (
					<div style={centeredElementBackground} />
				)}
				<Player
					acknowledgeRemotionLicense
					autoPlay
					component={component}
					durationInFrames={durationInFrames}
					fps={fps}
					compositionWidth={previewWidth}
					compositionHeight={previewHeight}
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
						backgroundColor: 'transparent',
						height: '100%',
						width: '100%',
					}}
				/>
			</div>
		</div>
	);
};
