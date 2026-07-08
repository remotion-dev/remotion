import type {CSSProperties} from 'react';
import {useCurrentFrame} from 'remotion';

const activeBlue = 'rgb(59, 130, 235)';

const baseStyle: CSSProperties = {
	display: 'inline',
	fontFamily: 'Arial, Helvetica, sans-serif',
	fontSize: 56,
	fontWeight: 600,
	lineHeight: 1.2,
};

const monoStyle: CSSProperties = {
	fontFamily: '"Roboto Mono", monospace',
	fontWeight: 500,
	fontFeatureSettings: '"ss03"',
	whiteSpace: 'nowrap',
	borderRadius: 10,
};

const CaptionLine: React.FC<{
	top: number;
	withScale: boolean;
}> = ({top, withScale}) => {
	const frame = useCurrentFrame();
	const active = frame === 1;

	return (
		<div
			style={{
				position: 'absolute',
				left: 30,
				top,
				width: 1020,
				height: 160,
				backgroundColor: '#eef2f7',
				border: '3px solid #ebebeb',
				borderRadius: 20,
				display: 'flex',
				alignItems: 'center',
			}}
		>
			<span
				style={{
					display: 'inline-block',
					paddingLeft: 30,
					paddingRight: 30,
					width: '100%',
					wordBreak: 'break-word',
				}}
			>
				<span style={{...baseStyle, color: 'black'}}>
					In the left sidebar, Just{' '}
				</span>
				<span
					style={{
						...baseStyle,
						...monoStyle,
						color: active ? 'white' : activeBlue,
						backgroundColor: active ? activeBlue : 'transparent',
						outline: active ? `5px solid ${activeBlue}` : 'none',
						boxShadow: active ? `0 0 0 1px ${activeBlue}` : 'none',
						scale: withScale ? (frame === 0 ? '1' : '0.95') : '1',
					}}
				>
					click
				</span>
				<span style={{...baseStyle, color: 'rgba(0, 0, 0, 0.3)'}}>
					{' '}
					on one to start
				</span>
			</span>
		</div>
	);
};

const Component: React.FC = () => {
	return (
		<div
			style={{
				width: 1080,
				height: 400,
				backgroundColor: '#dce3ec',
			}}
		>
			<CaptionLine top={30} withScale={false} />
			<CaptionLine top={210} withScale />
		</div>
	);
};

export const inlineScaleAfterOutline = {
	component: Component,
	id: 'inline-scale-after-outline',
	width: 1080,
	height: 400,
	fps: 30,
	durationInFrames: 3,
} as const;
