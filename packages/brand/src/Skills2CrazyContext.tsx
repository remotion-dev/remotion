import {burlap} from '@remotion/effects/burlap';
import {loadFont} from '@remotion/fonts';
import React, {useLayoutEffect, useRef, useState} from 'react';
import {
	AbsoluteFill,
	Easing,
	Interactive,
	interpolate,
	Solid,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

loadFont({
	family: 'GT Planar',
	url: staticFile('GT Planar/GT-Planar-Medium.woff2'),
	weight: '500',
});

const body = `Follow the routing to the matching rules, adapters, blueprints, or transition references. Reads are mandatory when their condition matches: Any motion, animation, or scene transition, a companion capability offer, capture, beat grid, generative video, map, publishing, the nearest genre lens and the full capability menu - the ceiling treatment is designed from these. State the viewer arc, structure, rhythm, and duration driver. Merge motion sidecars. Collect the workers motion.json files and carry their durations and exit/entry vectors into assembly where the doctrine chain is installed, translate them into the project ledger before stamping seams. Mount scenes, media, transitions, captions, and audio using the production loop. Real voice duration overrides estimates. Ground the visual identity in house-style and video-composition. Density examples are guidance for produced frames, not permission to invent claims, scenes, or a fixed number of elements. Use design adherence file for post-authoring spec verification. Three eyeball tests gate every frame before any structural check. one content container per frame surrounded by an ornament wreath; the info-card grid is the one dense exception. Empty corners read as broken. rotate saturated pastels (turquoise / soft-pink / butter / mint / lavender / peach / sky) for tonal mood. Borders + shadows are always {colors.text-dark} charcoal. Two typography ramps: Two ramps. The reading ramp (Quicksand 500 body 0.95cqw, 600 emphasis, meta) carries copy; the display ramp. omposes badge-pill, display, body sub, 3–7 ornaments, counter. Focal a 1–2 line Fredoka display in white with the 3px charcoal text-shadow, centered, under a butter badge-pill. Outline every shape 3px charcoal + a hard offset shadow (6/4px, no blur); white card fills on any surface. No square corners; no blurred or rgba shadows (save the soft text-shadow). No third font; no Quicksand headline or Fredoka body; no italic/underline Fredoka; no uppercase Quicksand body. pad-slide holds on the short edge; re-step display above the 1.4cqw floor. On tighter ratios keep the ornament count toward the upper end (5–7) so corners never read empty. Pre-Render Self-Audit: Squint — one Fredoka headline or content card dominates per frame. • Silence — one container per frame surrounded by an ornament wreath; only the info-card grid runs dense. • Ornaments (daisy/star/sun/cloud/rainbow), markers, and framed headers are CSS/SVG-only; recoloring SVG ornaments requires editing their stroke values. Never invent figures, KPIs, dates, or counts at frame scale. Render slots as — figure —, {metric}, — %. KPI blocks, bars, and meta values especially carry placeholders until the script supplies them. Issue numbers / counters are decorative chrome.`;

type TextToken = {
	readonly text: string;
	readonly start: number;
	readonly index: number;
};

const tokenize = (
	text: string,
	characterOffset: number,
	tokenOffset: number,
): TextToken[] => {
	let characterIndex = characterOffset;
	return (text.match(/\S+\s*/g) ?? []).map((token, index) => {
		const result = {
			text: token,
			start: characterIndex,
			index: tokenOffset + index,
		};
		characterIndex += token.length;
		return result;
	});
};

const bodyTokens = tokenize(body, 0, 0);
const characterCount = body.length;

const ExplodingTokens: React.FC<{
	readonly tokens: TextToken[];
	readonly visibleCharacters: number;
	readonly frame: number;
}> = ({tokens, visibleCharacters, frame}) => {
	const posterizedFrame = Math.floor(frame / 3) * 3;

	return tokens.map((token) => {
		const visibleLength = Math.max(
			0,
			Math.min(token.text.length, visibleCharacters - token.start),
		);
		const exitAngle = token.index * Math.PI * (3 - Math.sqrt(5));
		const exitDistance = 2400 + (token.index % 8) * 90;

		return (
			<span
				key={`${token.index}-${token.start}`}
				style={{
					display: 'inline-block',
					whiteSpace: 'pre-wrap',
					rotate: `${interpolate(
						posterizedFrame,
						[90, 111],
						[0, token.index % 2 === 0 ? 720 : -720],
						{
							easing: Easing.bezier(0.4, 0, 1, 1),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					)}deg`,
					translate: `${interpolate(
						posterizedFrame,
						[90, 111],
						[0, Math.cos(exitAngle) * exitDistance],
						{
							easing: Easing.bezier(0.4, 0, 1, 1),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					)}px ${interpolate(
						posterizedFrame,
						[90, 111],
						[0, Math.sin(exitAngle) * exitDistance],
						{
							easing: Easing.bezier(0.4, 0, 1, 1),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					)}px`,
				}}
			>
				{token.text.slice(0, visibleLength)}
			</span>
		);
	});
};

export const Skills2CrazyContext: React.FC = () => {
	const frame = useCurrentFrame();
	const {width, height} = useVideoConfig();
	const viewportRef = useRef<HTMLDivElement>(null);
	const contentRef = useRef<HTMLDivElement>(null);
	const [scrollOffset, setScrollOffset] = useState(0);
	const visibleCharacters = Math.floor(
		interpolate(frame, [0, 89], [0, characterCount], {
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		}),
	);

	useLayoutEffect(() => {
		if (!viewportRef.current || !contentRef.current) {
			return;
		}

		const nextScrollOffset = Math.max(
			0,
			contentRef.current.scrollHeight - viewportRef.current.clientHeight,
		);
		setScrollOffset(nextScrollOffset);
	}, [visibleCharacters]);

	return (
		<AbsoluteFill style={{backgroundColor: '#f5fafb', overflow: 'hidden'}}>
			<Solid
				width={width}
				height={height}
				color="#f5fafb"
				style={{position: 'absolute'}}
				effects={[
					burlap({
						size: 10,
						roughness: 0,
						color: '#e9e9e9',
					}),
				]}
			/>
			<Interactive.Div
				ref={viewportRef}
				name="Crazy context viewport"
				style={{
					position: 'absolute',
					left: 150,
					top: 90,
					right: 150,
					bottom: 90,
					overflow: frame < 90 ? 'hidden' : 'visible',
				}}
			>
				<div
					ref={contentRef}
					style={{
						translate: `0px -${scrollOffset}px`,
					}}
				>
					<Interactive.Div
						name="Crazy context body"
						style={{
							color: '#182a34',
							fontFamily: 'GT Planar, sans-serif',
							fontSize: 42,
							fontWeight: 500,
							letterSpacing: -0.25,
							lineHeight: 1.32,
						}}
					>
						<ExplodingTokens
							tokens={bodyTokens}
							visibleCharacters={visibleCharacters}
							frame={frame}
						/>
					</Interactive.Div>
				</div>
			</Interactive.Div>
		</AbsoluteFill>
	);
};
