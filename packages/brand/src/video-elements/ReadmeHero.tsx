import {AbsoluteFill, Img} from 'remotion';
import {StudioCodeHandoff} from './StudioCodeHandoff';

export const ReadmeHero: React.FC<{theme: 'light' | 'dark'}> = ({theme}) => {
	const shade = theme === 'dark' ? '255, 255, 255' : '0, 0, 0';

	return (
		<AbsoluteFill>
			<Img
				src={`https://remotion.media/remotion-wordmark${theme === 'dark' ? '-dark' : ''}.png`}
				style={{position: 'absolute', width: 180, left: 404, top: 4}}
			/>
			{(['left', 'right'] as const).map((side) => (
				<div
					key={side}
					style={{
						position: 'absolute',
						[side]: 8,
						bottom: 1,
						width: 58,
						height: 170,
						background: `radial-gradient(ellipse 29px 170px at 50% 100%, rgba(${shade}, 0.18) 0%, rgba(${shade}, 0.09) 45%, transparent 100%)`,
					}}
				/>
			))}
			<div
				style={{
					position: 'absolute',
					left: 37.5,
					top: 72,
					width: 937,
					height: 510,
				}}
			>
				<StudioCodeHandoff />
			</div>
			<div
				style={{
					position: 'absolute',
					bottom: 0,
					width: '100%',
					borderBottom: `1px solid rgba(${shade}, 0.125)`,
				}}
			/>
		</AbsoluteFill>
	);
};
