import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {elementDefinitions} from '../components/Elements/element-definitions';
import './font.css';

// Row by row; the rotated wall only shows rows 1-4 of the first three columns.
const featuredSlugs = [
	'audio/oscilloscope',
	'text/circle-marker',
	'overlays/name-lower-third',
	'text/spinning-text-wheel',
	'backgrounds/liquid-contours',
	'maps/spinning-globe',
	'layouts/slide-to-split-screen',
	'backgrounds/moving-zigzags',
	'maps/watercolor-map',
	'storytelling/polaroid-pictures',
	'maps/map-flyover',
	'storytelling/speed-lines',
	'captions/popping-word-captions',
	'backgrounds/rotating-starburst',
	'data/vertical-bar-chart',
	'commerce/shine',
	'data/pie-chart',
	'commerce/product-collection',
	'backgrounds/moving-waves',
	'youtube/youtube-comment-highlight',
	'data/line-chart',
	'audio/mirrored-spectrum',
	'text/cylinder-text',
	'captions/word-highlight-captions',
];

const columns = 4;
const cardWidth = 250;
const cardGap = 16;

export const ElementsOgImage: React.FC = () => {
	const posters = featuredSlugs.map((slug) => {
		const definition = elementDefinitions.find((d) => d.slug === slug);
		if (!definition) {
			throw new Error(`No Element with slug ${slug}`);
		}

		return definition.preview.posterUrl;
	});

	return (
		<AbsoluteFill style={{backgroundColor: 'white', overflow: 'hidden'}}>
			<div
				style={{
					position: 'absolute',
					left: 560,
					top: '50%',
					display: 'flex',
					flexDirection: 'row',
					gap: cardGap,
					transform: 'translateY(-50%) rotate(-12deg)',
					transformOrigin: 'left center',
				}}
			>
				{new Array(columns).fill(true).map((_, column) => {
					return (
						<div
							// eslint-disable-next-line react/no-array-index-key
							key={column}
							style={{
								display: 'flex',
								flexDirection: 'column',
								gap: cardGap,
								// Stagger columns so the wall doesn't read as a table
								marginTop: column % 2 === 0 ? 0 : 70,
							}}
						>
							{posters
								.filter((_p, i) => i % columns === column)
								.map((src) => {
									return (
										<Img
											key={src}
											src={src.startsWith('/') ? staticFile(src) : src}
											style={{
												width: cardWidth,
												aspectRatio: '16 / 9',
												objectFit: 'cover',
												borderRadius: 12,
												outline: '1px solid rgb(17 24 39 / 10%)',
												outlineOffset: -1,
												boxShadow: '0 12px 30px rgb(17 24 39 / 12%)',
											}}
										/>
									);
								})}
						</div>
					);
				})}
			</div>
			<AbsoluteFill
				style={{
					background:
						'linear-gradient(to right, white 0px, white 480px, rgb(255 255 255 / 0%) 620px)',
				}}
			/>
			<AbsoluteFill
				style={{
					paddingLeft: 72,
					justifyContent: 'center',
					fontFamily: 'GTPlanar',
					fontFeatureSettings: "'ss03' on",
				}}
			>
				<Img
					src={staticFile('img/new-logo.png')}
					style={{height: 48, width: 'auto', alignSelf: 'flex-start'}}
				/>
				<div
					style={{
						marginTop: 48,
						// Compensate the glyph side bearing so the "E" stem lines up with the subtitle
						marginLeft: -6,
						fontSize: 104,
						fontWeight: 900,
						lineHeight: 1,
						letterSpacing: '-0.045em',
						color: '#111',
					}}
				>
					Elements
				</div>
				<div
					style={{
						marginTop: 28,
						fontSize: 34,
						fontWeight: 400,
						lineHeight: 1.3,
						color: '#555',
						width: 420,
					}}
				>
					Drop-in video building blocks for Remotion.
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
