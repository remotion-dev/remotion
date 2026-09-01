import {AbsoluteFill, staticFile} from 'remotion';

const urlMaskStyle: React.CSSProperties = {
	maskImage: `url("${staticFile('shine.png')}")`,
	maskPosition: '0% 0%',
	maskRepeat: 'no-repeat',
	maskSize: '100% 100%',
};

const Component: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				alignItems: 'center',
				backgroundColor: '#e8edf3',
				flexDirection: 'row',
				gap: 30,
				justifyContent: 'center',
			}}
		>
			<div
				style={{
					...urlMaskStyle,
					backgroundColor: '#e5484d',
					height: 120,
					width: 180,
				}}
			/>
			<div
				style={{
					...urlMaskStyle,
					backgroundColor: '#3e63dd',
					height: 120,
					position: 'relative',
					width: 180,
				}}
			>
				<AbsoluteFill
					style={{
						backgroundImage:
							'linear-gradient(135deg, transparent 35%, rgba(255, 255, 255, 0.8) 35%, rgba(255, 255, 255, 0.8) 65%, transparent 65%)',
					}}
				/>
			</div>
		</AbsoluteFill>
	);
};

export const maskImageUrl = {
	component: Component,
	durationInFrames: 1,
	fps: 25,
	height: 180,
	id: 'mask-image-url',
	width: 500,
} as const;
