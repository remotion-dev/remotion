import Link from '@docusaurus/Link';
import {Video} from '@remotion/media';
import {Player} from '@remotion/player';
import React, {useMemo, useState} from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {elementLibraries} from './element-libraries-data';
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
		label: 'Captions',
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
		label: 'Lower third',
		left: 100,
		props: {fullName: 'Jonny Burger', role: 'Remotion'},
		slug: 'overlays/name-lower-third',
		top: 880,
	},
] as const;

type ComposeSlug = (typeof composeLayers)[number]['slug'];

const ComposedElements: React.FC<{
	readonly enabled: readonly ComposeSlug[];
}> = ({enabled}) => {
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
				if (!enabled.includes(slug)) {
					return null;
				}

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
	const [enabled, setEnabled] = useState<readonly ComposeSlug[]>(
		composeLayers.map((layer) => layer.slug),
	);
	const inputProps = useMemo(() => ({enabled}), [enabled]);

	return (
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
				inputProps={inputProps}
				loop
				style={{width: '100%'}}
			/>
			<div className={styles.toggles}>
				{composeLayers.map(({label, slug}) => (
					<label key={slug} className={styles.toggle}>
						<input
							checked={enabled.includes(slug)}
							onChange={(e) =>
								setEnabled((prev) =>
									e.target.checked
										? [...prev, slug]
										: prev.filter((s) => s !== slug),
								)
							}
							type="checkbox"
						/>
						{label}
					</label>
				))}
			</div>
		</div>
	);
};

const showcase = [
	{slug: 'overlays/name-lower-third', label: 'Lower third'},
	{slug: 'captions/popping-word-captions', label: 'Captions'},
	{slug: 'data/line-chart', label: 'Chart'},
	{slug: 'text/circle-marker', label: 'Text highlight'},
	{slug: 'backgrounds/liquid-contours', label: 'Background'},
	{slug: 'storytelling/polaroid-pictures', label: 'Storytelling'},
];

export const ElementsShowcase: React.FC = () => {
	return (
		<div className={styles.showcase}>
			{showcase.map(({slug, label}) => {
				const preview = `https://remotion.media/elements/${slug.replace('/', '-')}-preview`;

				return (
					<Link key={slug} to={`/elements/${slug}`} className={styles.card}>
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
						<img alt="" className={styles.video} src={bannerUrl} />
					) : null}
					<div className={styles.label}>{displayName}</div>
				</Link>
			))}
		</div>
	);
};

const flow = [
	{
		title: 'Element Library',
		text: 'A creator publishes Elements on their own website.',
	},
	{
		title: 'Studio, CLI or agent',
		text: 'One click, one command or one prompt installs an Element.',
	},
	{
		title: 'Your project',
		text: 'The source code is copied into the project and is yours to edit.',
	},
];

export const ElementsFlow: React.FC = () => {
	return (
		<div className={styles.flow}>
			{flow.map(({title, text}, i) => (
				<React.Fragment key={title}>
					{i > 0 ? (
						<div className={styles.arrow} aria-hidden>
							→
						</div>
					) : null}
					<div className={styles.step}>
						<div className={styles.stepTitle}>{title}</div>
						<div className={styles.stepText}>{text}</div>
					</div>
				</React.Fragment>
			))}
		</div>
	);
};
