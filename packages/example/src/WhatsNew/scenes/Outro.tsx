import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {pop, rise} from '../anim';
import {Backdrop} from '../components/Background';
import {RemotionLogo} from '../components/Logo';
import {display, mono} from '../fonts';
import {colors} from '../theme';

export const OutroScene: React.FC = () => {
	const frame = useCurrentFrame();
	const logo = pop(frame, 0, 10);
	const word = rise(frame, 8, 18);
	const url = rise(frame, 18, 18);
	const tagline = rise(frame, 28, 18);
	const fade = interpolate(frame, [128, 160], [1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<AbsoluteFill style={{backgroundColor: '#000'}}>
			<AbsoluteFill style={{opacity: fade}}>
				<Backdrop accent={colors.blue} dark />
				<AbsoluteFill
					style={{
						justifyContent: 'center',
						alignItems: 'center',
						flexDirection: 'column',
						gap: 26,
					}}
				>
					<RemotionLogo
						size={210}
						style={{
							scale: 0.3 + 0.7 * logo,
							opacity: Math.min(1, logo * 2),
							rotate: `${(1 - logo) * -90}deg`,
							filter: 'drop-shadow(0 20px 60px rgba(11,132,243,0.55))',
						}}
					/>
					<div
						style={{
							fontFamily: display,
							fontWeight: 700,
							fontSize: 150,
							letterSpacing: '-0.045em',
							lineHeight: 1,
							color: colors.paper,
							opacity: word,
							translate: `0px ${(1 - word) * 40}px`,
						}}
					>
						Remotion
					</div>
					<div
						style={{
							fontFamily: mono,
							fontWeight: 600,
							fontSize: 46,
							color: colors.blue,
							opacity: url,
							translate: `0px ${(1 - url) * 30}px`,
						}}
					>
						remotion.dev
					</div>
					<div
						style={{
							marginTop: 18,
							fontFamily: display,
							fontWeight: 500,
							fontSize: 36,
							color: '#9AA4B8',
							opacity: tagline,
						}}
					>
						Make videos programmatically.
					</div>
				</AbsoluteFill>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
