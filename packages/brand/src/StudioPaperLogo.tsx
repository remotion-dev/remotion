import {paper} from '@remotion/effects/paper';
import {useId} from 'react';
import {Interactive, Solid} from 'remotion';
import {compactLogoPaths} from './SvgLogos/compact-logo-paths';

const PaperSurface = ({
	color,
	seed,
}: {
	readonly color: string;
	readonly seed: number;
}) => {
	return (
		<Solid
			name="Printed paper surface"
			color={color}
			width={410}
			height={425}
			style={{position: 'absolute'}}
			effects={[
				// Match disco-light-show/RansomClipping's printed-paper treatment.
				paper({
					amount: 0.85,
					colorFront: '#b9b2a4',
					colorBack: '#ffffff',
					contrast: 0.3,
					roughness: 0.45,
					fiber: 0.45,
					fiberSize: 0.2,
					crumples: 0.5,
					crumpleSize: 0.3,
					folds: 0.3,
					foldCount: 3,
					drops: 0.05,
					seed,
				}),
			]}
		/>
	);
};

export const StudioPaperLogo = () => {
	const clipId = useId();

	return (
		<div style={{position: 'relative', width: 410, height: 425}}>
			<Interactive.Svg
				name="Outer Remotion triangle"
				width={410}
				height={425}
				viewBox="0 0 410 425"
				xmlns="http://www.w3.org/2000/svg"
				style={{
					position: 'absolute',
					inset: 0,
					filter: 'drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.45))',
				}}
			>
				<defs>
					<clipPath id={`${clipId}-outer`}>
						<path d={compactLogoPaths.outer} />
					</clipPath>
				</defs>
				<foreignObject
					width={410}
					height={425}
					clipPath={`url(#${clipId}-outer)`}
				>
					<PaperSurface color="#5b5c5b" seed={31} />
				</foreignObject>
			</Interactive.Svg>
			<Interactive.Svg
				name="Middle Remotion triangle"
				width={410}
				height={425}
				viewBox="0 0 410 425"
				xmlns="http://www.w3.org/2000/svg"
				style={{
					position: 'absolute',
					inset: 0,
					filter: 'drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.45))',
				}}
			>
				<defs>
					<clipPath id={`${clipId}-middle`}>
						<path d={compactLogoPaths.middle} />
					</clipPath>
				</defs>
				<foreignObject
					width={410}
					height={425}
					clipPath={`url(#${clipId}-middle)`}
				>
					<PaperSurface color="#9b9c97" seed={57} />
				</foreignObject>
			</Interactive.Svg>
			<Interactive.Svg
				name="Inner Remotion triangle"
				width={410}
				height={425}
				viewBox="0 0 410 425"
				xmlns="http://www.w3.org/2000/svg"
				style={{
					position: 'absolute',
					inset: 0,
					filter: 'drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.45))',
				}}
			>
				<defs>
					<clipPath id={`${clipId}-inner`}>
						<path d={compactLogoPaths.inner} />
					</clipPath>
				</defs>
				<foreignObject
					width={410}
					height={425}
					clipPath={`url(#${clipId}-inner)`}
				>
					<PaperSurface color="#ffffff" seed={83} />
				</foreignObject>
			</Interactive.Svg>
		</div>
	);
};
