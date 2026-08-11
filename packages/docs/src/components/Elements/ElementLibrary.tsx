import React, {useEffect, useRef, useState} from 'react';
import type {ElementDefinition} from './element-definitions';
import {
	getElementDocumentationUrl,
	getElementLibrarySections,
	type ElementCategory,
} from './element-library-data';
import {ELEMENT_PREVIEW_BACKGROUND} from './ElementPreviewComposition';
import styles from './ElementLibrary.module.css';

const reducedMotionQuery = '(prefers-reduced-motion: reduce)';

const usePrefersReducedMotion = () => {
	const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

	useEffect(() => {
		const mediaQuery = window.matchMedia(reducedMotionQuery);
		const updatePreference = () => {
			setPrefersReducedMotion(mediaQuery.matches);
		};

		updatePreference();
		mediaQuery.addEventListener('change', updatePreference);

		return () => {
			mediaQuery.removeEventListener('change', updatePreference);
		};
	}, []);

	return prefersReducedMotion;
};

const ElementCard: React.FC<{
	readonly definition: ElementDefinition;
	readonly headingLevel: 2 | 3;
	readonly prefersReducedMotion: boolean;
}> = ({definition, headingLevel, prefersReducedMotion}) => {
	const [isFocused, setIsFocused] = useState(false);
	const [isPointerOver, setIsPointerOver] = useState(false);
	const [playbackFailed, setPlaybackFailed] = useState(false);
	const videoRef = useRef<HTMLVideoElement>(null);
	const shouldPlay =
		!prefersReducedMotion && !playbackFailed && (isFocused || isPointerOver);
	const Heading = headingLevel === 2 ? 'h2' : 'h3';

	useEffect(() => {
		const video = videoRef.current;
		if (!video) {
			return;
		}

		let canceled = false;
		video.currentTime = 0;
		video.play().catch(() => {
			if (!canceled) {
				setPlaybackFailed(true);
			}
		});

		return () => {
			canceled = true;
			video.pause();
			video.currentTime = 0;
		};
	}, [shouldPlay]);

	const activateFromPointer = (
		event: React.PointerEvent<HTMLAnchorElement>,
	) => {
		if (event.pointerType === 'touch') {
			return;
		}

		setPlaybackFailed(false);
		setIsPointerOver(true);
	};

	return (
		<li className={styles.cardItem}>
			<a
				className={styles.card}
				href={getElementDocumentationUrl(definition)}
				onBlur={() => setIsFocused(false)}
				onFocus={() => {
					setPlaybackFailed(false);
					setIsFocused(true);
				}}
				onPointerEnter={activateFromPointer}
				onPointerLeave={() => setIsPointerOver(false)}
			>
				<div
					aria-hidden="true"
					className={styles.preview}
					style={{backgroundColor: ELEMENT_PREVIEW_BACKGROUND}}
				>
					<img
						alt=""
						className={styles.previewMedia}
						decoding="async"
						loading="lazy"
						src={definition.preview.posterUrl}
					/>
					{shouldPlay ? (
						<video
							ref={videoRef}
							aria-hidden="true"
							className={styles.previewMedia}
							loop
							muted
							onError={() => setPlaybackFailed(true)}
							playsInline
							poster={definition.preview.posterUrl}
							preload="metadata"
							src={definition.preview.videoUrl}
						/>
					) : null}
				</div>
				<div className={styles.content}>
					<Heading className={styles.title}>{definition.displayName}</Heading>
					<p className={styles.description}>{definition.description}</p>
				</div>
			</a>
		</li>
	);
};

const ElementGrid: React.FC<{
	readonly definitions: readonly ElementDefinition[];
	readonly headingLevel: 2 | 3;
	readonly prefersReducedMotion: boolean;
}> = ({definitions, headingLevel, prefersReducedMotion}) => {
	return (
		<ul className={styles.grid} role="list">
			{definitions.map((definition) => (
				<ElementCard
					key={definition.slug}
					definition={definition}
					headingLevel={headingLevel}
					prefersReducedMotion={prefersReducedMotion}
				/>
			))}
		</ul>
	);
};

export const ElementLibrary: React.FC<{
	readonly category: ElementCategory | null;
}> = ({category}) => {
	const sections = getElementLibrarySections(category);
	const prefersReducedMotion = usePrefersReducedMotion();

	return (
		<div className={styles.library}>
			{sections.map((section) => {
				if (category !== null) {
					return (
						<section
							key={section.category}
							aria-label={`${section.label} Elements`}
							className={styles.section}
						>
							<ElementGrid
								definitions={section.definitions}
								headingLevel={2}
								prefersReducedMotion={prefersReducedMotion}
							/>
						</section>
					);
				}

				const categoryHeadingId = `element-category-${section.category}`;

				return (
					<section
						key={section.category}
						aria-labelledby={categoryHeadingId}
						className={styles.section}
					>
						<h2 className={styles.categoryTitle} id={categoryHeadingId}>
							{section.label}
						</h2>
						<ElementGrid
							definitions={section.definitions}
							headingLevel={3}
							prefersReducedMotion={prefersReducedMotion}
						/>
					</section>
				);
			})}
		</div>
	);
};
