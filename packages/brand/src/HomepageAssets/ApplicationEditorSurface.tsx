import {
	AbsoluteFill,
	Easing,
	Freeze,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {ApplicationThinkingPanel} from './ApplicationThinkingPanel';
import {MapCanvas} from './Map';

// The previous Applications editor layout, with a map canvas and chat sidebar.
const ApplicationEditorContent = () => {
	const frame = useCurrentFrame();
	const sidebarWidth = 420;
	const mapWidth = 1080 - sidebarWidth - 28 * 2;
	const mapTop = 72;
	const playheadExtension = 724 - 144 - mapTop - (mapWidth * 9) / 16 - 14;
	const playheadHeight = 144 + playheadExtension;
	// Match the map's 5px outline after its 1.45x zoom and viewport scaling.
	const borderWidth = (5 * 1.45 * mapWidth) / 1920;
	return (
		<div
			style={{
				width: '100%',
				height: '100%',
				backgroundColor: '#1b1e23',
				borderRadius: 42,
				color: '#e5e7eb',
				display: 'flex',
				fontFamily: 'GT Planar',
				fontFeatureSettings: "'ss03'",
				overflow: 'hidden',
			}}
		>
			<div
				style={{display: 'flex', flex: 1, minWidth: 0, flexDirection: 'column'}}
			>
				<div
					style={{
						alignItems: 'flex-start',
						display: 'flex',
						flex: 1,
						justifyContent: 'center',
						minHeight: 0,
						padding: `${mapTop}px 28px 28px`,
					}}
				>
					<div
						style={{
							aspectRatio: '16 / 9',
							width: '100%',
							overflow: 'hidden',
							borderRadius: 16,
						}}
					>
						<MapCanvas lineStartFrame={32} />
					</div>
				</div>
				<div
					style={{
						backgroundColor: '#1b1e23',
						height: 144,
						position: 'relative',
						flexShrink: 0,
					}}
				>
					<svg
						viewBox={`0 0 56 ${playheadHeight}`}
						preserveAspectRatio="none"
						style={{
							position: 'absolute',
							top: -playheadExtension,
							height: `calc(100% + ${playheadExtension}px)`,
							left: `calc(36px + (100% - 72px) * ${interpolate(frame, [0, 90], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})})`,
							width: 56,
							translate: '-50% 0',
						}}
					>
						<path
							d={`M ${borderWidth} ${borderWidth} H ${56 - borderWidth} V 26 L 32 42 V ${playheadHeight - borderWidth} H 24 V 42 L ${borderWidth} 26 Z`}
							fill="#f02c00"
							stroke="black"
							strokeWidth={borderWidth * 2}
							strokeLinejoin="round"
							paintOrder="stroke fill"
						/>
					</svg>
				</div>
			</div>
			<div style={{width: sidebarWidth, flexShrink: 0}}>
				<ApplicationThinkingPanel contentTop={mapTop} />
			</div>
		</div>
	);
};

export const ApplicationEditorSurface = () => {
	const frame = useCurrentFrame();
	const {durationInFrames, fps} = useVideoConfig();

	return (
		<div style={{width: '100%', height: '100%', position: 'relative'}}>
			{/* Keep an opaque opening state underneath so the crossfade never dims. */}
			<Freeze frame={0}>
				<ApplicationEditorContent />
			</Freeze>
			<AbsoluteFill
				style={{
					opacity: interpolate(
						frame,
						[durationInFrames - 0.5 * fps, durationInFrames - 1],
						[1, 0],
						{
							easing: Easing.inOut(Easing.cubic),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
				}}
			>
				<ApplicationEditorContent />
			</AbsoluteFill>
		</div>
	);
};
