import {interpolate, useCurrentFrame} from 'remotion';
import {ApplicationThinkingPanel} from './ApplicationThinkingPanel';
import {MapCanvas} from './Map';

// The previous Applications editor layout, with a map canvas and chat sidebar.
export const ApplicationEditorSurface = ({
	borderWidth,
}: {
	borderWidth: number;
}) => {
	const frame = useCurrentFrame();
	return (
		<div
			style={{
				width: '100%',
				height: '100%',
				backgroundColor: '#16181d',
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
						alignItems: 'center',
						backgroundColor: '#101216',
						display: 'flex',
						flex: 1,
						justifyContent: 'center',
						minHeight: 0,
						padding: 28,
					}}
				>
					<div
						style={{aspectRatio: '16 / 9', width: '100%', overflow: 'hidden'}}
					>
						<MapCanvas lineStartFrame={32} />
					</div>
				</div>
				<div
					style={{
						backgroundColor: '#1b1e23',
						borderTop: '2px solid #2b2f36',
						height: 144,
						position: 'relative',
						flexShrink: 0,
					}}
				>
					<div
						style={{
							backgroundColor: '#0b84f3',
							border: `${borderWidth}px solid black`,
							borderRadius: 8,
							boxSizing: 'border-box',
							height: 64,
							left: '5%',
							position: 'absolute',
							top: 40,
							width: '72%',
						}}
					/>
					<svg
						viewBox="0 0 56 144"
						preserveAspectRatio="none"
						style={{
							position: 'absolute',
							top: 0,
							height: '100%',
							left: `${interpolate(frame, [0, 90], [5, 82], {extrapolateRight: 'clamp'})}%`,
							width: 56,
							translate: '-50% 0',
						}}
					>
						<path
							d={`M ${borderWidth} ${borderWidth} H ${56 - borderWidth} V 26 L 32 42 V ${144 - borderWidth} H 24 V 42 L ${borderWidth} 26 Z`}
							fill="#f02c00"
							stroke="black"
							strokeWidth={borderWidth * 2}
							strokeLinejoin="round"
							paintOrder="stroke fill"
						/>
					</svg>
				</div>
			</div>
			<div style={{width: 340, flexShrink: 0, borderLeft: '2px solid #2b2f36'}}>
				<ApplicationThinkingPanel />
			</div>
		</div>
	);
};
