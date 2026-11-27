import Link from '@docusaurus/Link';
import {Video} from '@remotion/media';
import {Player} from '@remotion/player';
import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {elementLibraries} from './element-libraries-data';
import {
	getElementCategoryHeadingId,
	getElementCategoryLabel,
} from './element-library-data';
import {getElementDefinition} from './element-utils';
import styles from './ElementsOverview.module.css';

const CAPTIONS = [
	{text: 'Here', startMs: 158, endMs: 340, timestampMs: 249, confidence: null},
	{text: ' are', startMs: 340, endMs: 523, timestampMs: 431, confidence: null},
	{text: ' some', startMs: 523, endMs: 650, timestampMs: 586, confidence: null},
	{text: ' of', startMs: 650, endMs: 778, timestampMs: 714, confidence: null},
	{text: ' the', startMs: 778, endMs: 960, timestampMs: 869, confidence: null},
	{
		text: ' things',
		startMs: 960,
		endMs: 1142,
		timestampMs: 1051,
		confidence: null,
	},
	{
		text: ' that',
		startMs: 1142,
		endMs: 1288,
		timestampMs: 1215,
		confidence: null,
	},
	{
		text: ' we',
		startMs: 1288,
		endMs: 1707,
		timestampMs: 1497,
		confidence: null,
	},
	{
		text: ' recently',
		startMs: 1707,
		endMs: 2181,
		timestampMs: 1944,
		confidence: null,
	},
	{
		text: ' improved',
		startMs: 2181,
		endMs: 2418,
		timestampMs: 2299,
		confidence: null,
	},
	{
		text: ' in',
		startMs: 2418,
		endMs: 2637,
		timestampMs: 2527,
		confidence: null,
	},
	{
		text: ' Remotion.',
		startMs: 2637,
		endMs: 3402,
		timestampMs: 3019,
		confidence: null,
	},
];

const composeLayers = [
	{
		durationInFrames: 108,
		from: 0,
		left: 619,
		props: {
			...getElementDefinition('captions/popping-word-captions').initialProps,
			captions: CAPTIONS,
		},
		slug: 'captions/popping-word-captions',
		top: 700,
	},
	{
		durationInFrames: 94,
		from: 8,
		left: 100,
		props: {fullName: 'Jonny Burger', role: 'Remotion'},
		slug: 'overlays/name-lower-third',
		top: 880,
	},
] as const;

const ComposedElements: React.FC = () => {
	return (
		<AbsoluteFill>
			<Video
				muted
				objectFit="cover"
				src="https://remotion.media/announcements/whats-new-in-remotion/cursor/footage/whats1.mp4"
				style={{height: '100%', width: '100%'}}
				trimBefore={35}
			/>
			{composeLayers.map(({durationInFrames, from, left, props, slug, top}) => {
				const definition = getElementDefinition(slug);
				const width = definition.elementWidth ?? definition.width;
				const height = definition.elementHeight ?? definition.height;

				return (
					<Sequence
						key={slug}
						durationInFrames={durationInFrames}
						from={from}
						height={height}
						layout="none"
						width={width}
					>
						<div style={{height, left, position: 'absolute', top, width}}>
							{React.createElement(
								definition.component as React.ComponentType<
									Record<string, unknown>
								>,
								props,
							)}
						</div>
					</Sequence>
				);
			})}
		</AbsoluteFill>
	);
};

export const ElementsComposeDemo: React.FC = () => {
	return (
		<div className={styles.composeRow}>
			<div className={styles.compose}>
				<Player
					acknowledgeRemotionLicense
					autoPlay
					component={ComposedElements}
					compositionHeight={1080}
					compositionWidth={1920}
					controls
					durationInFrames={108}
					fps={30}
					initiallyMuted
					loop
					style={{width: '100%'}}
				/>
			</div>
			<div className={styles.used}>
				{composeLayers.map(({slug}) => {
					const {displayName} = getElementDefinition(slug);
					const preview = `https://remotion.media/elements/${slug.replace('/', '-')}-preview`;

					return (
						<Link
							key={slug}
							to={`/elements/${slug}`}
							className={styles.card}
							target="_blank"
						>
							<video
								className={styles.video}
								src={`${preview}.mp4`}
								poster={`${preview}.png`}
								autoPlay
								loop
								muted
								playsInline
								aria-label={displayName}
							/>
							<div className={styles.label}>{displayName}</div>
						</Link>
					);
				})}
			</div>
		</div>
	);
};

const showcase = [
	{category: 'overlays', slug: 'overlays/name-lower-third'},
	{category: 'captions', slug: 'captions/popping-word-captions'},
	{category: 'data', slug: 'data/line-chart'},
	{category: 'text', slug: 'text/circle-marker'},
	{category: 'backgrounds', slug: 'backgrounds/liquid-contours'},
	{category: 'storytelling', slug: 'storytelling/polaroid-pictures'},
] as const;

export const ElementsShowcase: React.FC = () => {
	return (
		<div className={styles.showcase}>
			{showcase.map(({category, slug}) => {
				const label = getElementCategoryLabel(category);
				const preview = `https://remotion.media/elements/${slug.replace('/', '-')}-preview`;

				return (
					<Link
						key={slug}
						to={`/elements#${getElementCategoryHeadingId(category)}`}
						className={styles.card}
					>
						<video
							className={styles.video}
							src={`${preview}.mp4`}
							poster={`${preview}.png`}
							autoPlay
							loop
							muted
							playsInline
							aria-label={label}
						/>
						<div className={styles.label}>{label}</div>
					</Link>
				);
			})}
		</div>
	);
};

export const ElementLibraryStrip: React.FC = () => {
	return (
		<div className={styles.strip}>
			{elementLibraries.map(({bannerUrl, browseUrl, displayName}) => (
				<Link key={displayName} to={browseUrl} className={styles.card}>
					{bannerUrl ? (
						<img alt="" className={styles.banner} src={bannerUrl} />
					) : null}
					<div className={styles.label}>{displayName}</div>
				</Link>
			))}
		</div>
	);
};
