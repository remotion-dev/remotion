import {lensBlur} from '@remotion/effects/lens-blur';
import {scale} from '@remotion/effects/scale';
import React, {useMemo} from 'react';
import {
	Easing,
	HtmlInCanvas,
	Interactive,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {BALLPEN_INK} from '../paper-disco/textures';
import {asset} from './assets';
import {BEN2_PATH, BEN2_VIEWBOX} from './ben2-glyphs';
import {DiscoBallBg} from './DiscoBallBg';
import {type ClippingArt, RansomClipping, useDataUrl} from './RansomClipping';

// Paper moves "on threes" (10 poses per second), like the paper disco ball
const P = 3;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const TURN_FRAMES = 12;
// Stickers are drawn big and are allowed to bleed off the edges a bit
const K = 1.45;
const TURN_RADIUS = 70 * K;

type Tech = {
	readonly name: string;
	/**
	 * What's printed on the clipping: a logo (fetched and embedded into the
	 * clipping's own canvas) or, for BEN2 which has no logo, a vector label
	 */
	readonly logo:
		| {
				readonly type: 'image';
				readonly src: string;
				readonly scale: number;
				readonly keyWhite: boolean;
		  }
		| {readonly type: 'label'; readonly scale: number};
	/** Clipping colour (ransom note: every scrap from a different magazine) */
	readonly color: string;
	readonly width: number;
	readonly height: number;
	/** Center of the clipping on screen */
	readonly x: number;
	readonly y: number;
	readonly rotate: number;
	/** Fold angle of the page turn, the clipping unrolls from the opposite corner */
	readonly turnDirection: number;
	/** Frame (relative to this slide) at which the clipping starts turning in */
	readonly drop: number;
};

// Ransom-note clippings with just the logos, overlapping like stickers
// (later ones land on top). Drops are timed to
// "leveraging all the cool technology" in the voiceover.
const STACK: Tech[] = [
	{
		name: 'WebGPU',
		logo: {
			type: 'image',
			src: asset('WebGPU_logo.svg.webp'),
			scale: 0.72,
			keyWhite: false,
		},
		color: '#ebe4d2',
		width: 580 * K,
		height: 420 * K,
		x: 300,
		y: 600,
		rotate: -8,
		turnDirection: 315,
		drop: 34,
	},
	{
		name: 'ONNX Runtime',
		logo: {type: 'image', src: asset('image.png'), scale: 0.7, keyWhite: false},
		color: '#ffffff',
		width: 560 * K,
		height: 410 * K,
		x: 780,
		y: 540,
		rotate: 7,
		turnDirection: 45,
		drop: 45,
	},
	{
		name: 'Mediabunny',
		logo: {
			type: 'image',
			src: asset('mediabunny-logo (1).svg'),
			scale: 0.7,
			keyWhite: false,
		},
		color: '#ffcf2e',
		width: 580 * K,
		height: 420 * K,
		x: 330,
		y: 1010,
		rotate: 5,
		turnDirection: 315,
		drop: 56,
	},
	{
		name: 'Hugging Face',
		logo: {
			type: 'image',
			src: asset('images.png'),
			scale: 0.95,
			keyWhite: true,
		},
		color: '#3160ff',
		width: 560 * K,
		height: 420 * K,
		x: 765,
		y: 1050,
		rotate: -6,
		turnDirection: 45,
		drop: 67,
	},
	{
		name: 'BEN2',
		logo: {type: 'label', scale: 0.6},
		color: '#ff8fbf',
		width: 520 * K,
		height: 340 * K,
		x: 560,
		y: 1400,
		rotate: -4,
		turnDirection: 315,
		drop: 78,
	},
];

const TechClipping: React.FC<{readonly tech: Tech}> = ({tech}) => {
	const frame = useCurrentFrame();
	const turn = interpolate(
		frame,
		[tech.drop, tech.drop + TURN_FRAMES],
		[0, 1],
		{
			...clamp,
			posterize: P,
			easing: Easing.out(Easing.cubic),
		},
	);
	const logoDataUrl = useDataUrl(
		tech.logo.type === 'image' ? tech.logo.src : null,
	);
	const art = useMemo((): ClippingArt | null => {
		if (tech.logo.type === 'label') {
			return {
				type: 'path',
				d: BEN2_PATH,
				viewBox: BEN2_VIEWBOX,
				fill: BALLPEN_INK,
				scale: tech.logo.scale,
			};
		}

		return logoDataUrl === null
			? null
			: {
					type: 'image',
					href: logoDataUrl,
					scale: tech.logo.scale,
					keyWhite: tech.logo.keyWhite,
				};
	}, [logoDataUrl, tech.logo]);

	if (art === null) {
		return null;
	}

	return (
		<Interactive.Div
			name={`${tech.name} clipping`}
			style={{
				position: 'absolute',
				left: tech.x - tech.width / 2,
				top: tech.y - tech.height / 2,
				width: tech.width,
				height: tech.height,
				rotate: `${tech.rotate}deg`,
			}}
			from={tech.drop}
		>
			<RansomClipping
				name={`${tech.name} sticker`}
				seed={`tech-${tech.name}`}
				color={tech.color}
				width={tech.width}
				height={tech.height}
				art={art}
				turn={turn}
				turnDirection={tech.turnDirection}
				turnRadius={TURN_RADIUS}
				unit={K}
			/>
		</Interactive.Div>
	);
};

const ClientSideChadInner: React.FC = () => {
	const frame = useCurrentFrame();
	const {width, height} = useVideoConfig();

	// The "camera" starts pushing in while the stickers are still landing:
	// a slow ease-in that builds through the drops, then a long settle.
	// Right at the fastest point of the push it briefly racks out of focus.
	const zoom = interpolate(frame, [40, 132], [1, 1.22], {
		...clamp,
		easing: Easing.bezier(0.55, 0, 0.15, 1),
		output: 'perceptual-scale',
	});
	const blur = interpolate(frame, [80, 94, 112], [0, 22, 0], {
		...clamp,
		easing: Easing.inOut(Easing.quad),
	});

	return (
		<HtmlInCanvas
			name="Scene camera"
			width={width}
			height={height}
			effects={[scale({scale: zoom}), lensBlur({radius: blur, samples: 128})]}
		>
			<DiscoBallBg name="Paper background" />
			{STACK.map((tech) => (
				<TechClipping key={tech.name} tech={tech} />
			))}
		</HtmlInCanvas>
	);
};

export const ClientSideChad = Interactive.create({
	Component: ClientSideChadInner,
	layout: 'absolute-fill',
});
