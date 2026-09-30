import {lightLeak} from '@remotion/effects/light-leak';
import React from 'react';
import {AbsoluteFill, Img, Solid} from 'remotion';
import {
	BoltIcon,
	EyeIcon,
	SparkIcon,
	SpeakerIcon,
	TriangleIcon,
} from './components/icons';
import {RemotionLogo} from './components/Logo';
import {display} from './fonts';
import {accents, colors} from './theme';

const tiles = [
	{color: accents.lightLeaks, icon: <SparkIcon size={44} color="#fff" />},
	{color: accents.soundEffects, icon: <SpeakerIcon size={44} color="#fff" />},
	{color: '#FFFFFF', icon: <TriangleIcon size={38} color="#000" />},
	{color: accents.bundling, icon: <BoltIcon size={44} color={colors.ink} />},
	{color: '#2A1F4D', icon: <EyeIcon size={44} color={accents.sneakPeek} />},
];

export const Thumbnail: React.FC = () => {
	return (
		<AbsoluteFill style={{backgroundColor: '#06080E', overflow: 'hidden'}}>
			<Img
				src={
					'https://remotion.media/announcements/whats-new-in-remotion/cursor/thumbnail/face.jpg'
				}
				style={{
					position: 'absolute',
					left: -160,
					top: -150,
					width: 2016,
					height: 1134,
					maxWidth: 'none',
					filter: 'contrast(1.1) saturate(1.15) brightness(1.02)',
				}}
			/>
			<Solid
				width={1280}
				height={720}
				style={{position: 'absolute', mixBlendMode: 'screen', opacity: 0.7}}
				effects={[lightLeak({seed: 9, hueShift: 0, progress: 0.22})]}
			/>
			<AbsoluteFill
				style={{
					background:
						'linear-gradient(90deg, rgba(6,8,14,0.94) 0%, rgba(6,8,14,0.8) 34%, rgba(6,8,14,0) 60%)',
				}}
			/>
			<div
				style={{
					position: 'absolute',
					left: 64,
					top: 70,
					display: 'flex',
					flexDirection: 'column',
					gap: 16,
				}}
			>
				<div style={{display: 'flex', alignItems: 'center', gap: 16}}>
					<RemotionLogo size={62} />
					<div
						style={{
							fontFamily: display,
							fontWeight: 700,
							fontSize: 44,
							color: colors.paper,
							letterSpacing: '-0.02em',
						}}
					>
						Remotion
					</div>
				</div>
				<div
					style={{
						fontFamily: display,
						fontWeight: 700,
						fontSize: 150,
						lineHeight: 0.88,
						letterSpacing: '-0.045em',
						color: colors.paper,
						textTransform: 'uppercase',
						textShadow: '0 8px 30px rgba(0,0,0,0.5)',
					}}
				>
					What&apos;s
					<br />
					<span style={{color: colors.blue}}>new</span>
				</div>
				<div style={{display: 'flex', gap: 14, marginTop: 26}}>
					{tiles.map((tile, i) => (
						<div
							key={i}
							style={{
								width: 86,
								height: 86,
								borderRadius: 24,
								backgroundColor: tile.color,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								boxShadow: '0 12px 30px rgba(0,0,0,0.45)',
								rotate: `${i % 2 === 0 ? -4 : 4}deg`,
							}}
						>
							{tile.icon}
						</div>
					))}
				</div>
			</div>
		</AbsoluteFill>
	);
};
