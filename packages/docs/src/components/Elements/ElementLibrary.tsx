import Link from '@docusaurus/Link';
import {
	isInsideStudio,
	setStudioDragData,
	subscribeToCaptionStyleSelection,
} from '@remotion/studio-protocol';
import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {BlueButton} from '../../../components/layout/Button';
import type {ElementDefinition} from './element-definitions';
import {
	createElementPayloadFromDefinition,
	installElementInStudio,
	setElementDragImage,
} from './element-drag-data';
import {
	getElementDocumentationUrl,
	getElementLibrarySections,
	type ElementCategory,
} from './element-library-data';
import {ElementInstallFallbackModal} from './ElementInstallFallbackModal';
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
	readonly isCaptionPicker: boolean;
	readonly isSelected: boolean;
	readonly prefersReducedMotion: boolean;
	readonly sourceCode: string;
}> = ({
	definition,
	isCaptionPicker,
	isSelected,
	prefersReducedMotion,
	sourceCode,
}) => {
	const [isFocused, setIsFocused] = useState(false);
	const [isPointerOver, setIsPointerOver] = useState(false);
	const [playbackFailed, setPlaybackFailed] = useState(false);
	const [isInstalling, setIsInstalling] = useState(false);
	const [isInstallFallbackOpen, setIsInstallFallbackOpen] = useState(false);
	const [installFailureCount, setInstallFailureCount] = useState(0);
	const posterRef = useRef<HTMLImageElement>(null);
	const videoRef = useRef<HTMLVideoElement>(null);
	const shouldPlay =
		!prefersReducedMotion && !playbackFailed && (isFocused || isPointerOver);

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

	const activateFromPointer = (event: React.PointerEvent<HTMLLIElement>) => {
		if (event.pointerType === 'touch') {
			return;
		}

		setPlaybackFailed(false);
		setIsPointerOver(true);
	};

	const installElement = async () => {
		setIsInstalling(true);
		try {
			const result = await installElementInStudio({definition, sourceCode});
			if (!result.success) {
				setInstallFailureCount((count) => count + 1);
				setIsInstallFallbackOpen(true);
				return;
			}

			setIsInstallFallbackOpen(false);
			setInstallFailureCount(0);
			if (window.location.origin === 'https://www.remotion.dev') {
				navigator.sendBeacon(
					`https://www.remotion.pro/api/track/element-install-request?slug=${encodeURIComponent(definition.slug)}`,
				);
			}
		} catch {
			setInstallFailureCount((count) => count + 1);
			setIsInstallFallbackOpen(true);
		} finally {
			setIsInstalling(false);
		}
	};

	const Card = isCaptionPicker ? 'button' : Link;

	return (
		<li
			className={styles.cardItem}
			onPointerEnter={activateFromPointer}
			onPointerLeave={() => setIsPointerOver(false)}
		>
			<Card
				className={styles.card}
				draggable
				{...(isCaptionPicker
					? {
							type: 'button' as const,
							onClick: installElement,
							disabled: isInstalling,
							'aria-label': `Select ${definition.displayName}`,
							'aria-pressed': isSelected,
						}
					: {to: getElementDocumentationUrl(definition)})}
				onBlur={() => setIsFocused(false)}
				onFocus={() => {
					setPlaybackFailed(false);
					setIsFocused(true);
				}}
				onDragStart={(event) => {
					setStudioDragData({
						dataTransfer: event.dataTransfer,
						payload: createElementPayloadFromDefinition({
							definition,
							sourceCode,
							installAssets: false,
						}),
					});
					setElementDragImage(event.dataTransfer, posterRef.current);
				}}
			>
				<div
					aria-hidden="true"
					className={styles.preview}
					style={{backgroundColor: ELEMENT_PREVIEW_BACKGROUND}}
				>
					<img
						ref={posterRef}
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
					<span className={styles.title}>{definition.displayName}</span>
				</div>
			</Card>
			<div aria-live="polite" className={styles.installAction}>
				<BlueButton
					aria-label={`Use – ${definition.displayName}`}
					fullWidth={false}
					loading={isInstalling}
					onClick={installElement}
					size="sm"
					style={{padding: '5px 8px'}}
					title="Install in the most recently focused Remotion Studio"
				>
					Use
				</BlueButton>
			</div>
			<ElementInstallFallbackModal
				definition={definition}
				installFailureCount={installFailureCount}
				isInstalling={isInstalling}
				isOpen={isInstallFallbackOpen}
				onClose={() => {
					setIsInstallFallbackOpen(false);
					setInstallFailureCount(0);
				}}
				onInstall={installElement}
				posterRef={posterRef}
				sourceCode={sourceCode}
			/>
		</li>
	);
};

const ElementGrid: React.FC<{
	readonly definitions: readonly ElementDefinition[];
	readonly isCaptionPicker: boolean;
	readonly selectedSlug: string | null;
	readonly prefersReducedMotion: boolean;
	readonly sourceCodeBySlug: Readonly<Record<string, string>>;
}> = ({
	definitions,
	isCaptionPicker,
	selectedSlug,
	prefersReducedMotion,
	sourceCodeBySlug,
}) => {
	return (
		// The Algolia recordExtractor must remove this subtree before extracting records.
		// This marker requires explicit crawler configuration; it is not built in.
		<ul
			className={styles.grid}
			role="list"
			data-algolia-exclude="element-cards"
		>
			{definitions.map((definition) => {
				const sourceCode = sourceCodeBySlug[definition.slug];
				if (!sourceCode) {
					throw new Error(
						`Missing generated source code for Element "${definition.slug}".`,
					);
				}

				return (
					<ElementCard
						key={definition.slug}
						definition={definition}
						isCaptionPicker={isCaptionPicker}
						isSelected={isCaptionPicker && definition.slug === selectedSlug}
						prefersReducedMotion={prefersReducedMotion}
						sourceCode={sourceCode}
					/>
				);
			})}
		</ul>
	);
};

export const ElementLibrary: React.FC<{
	readonly category: ElementCategory | null;
	readonly sourceCodeBySlug: Readonly<Record<string, string>>;
}> = ({category, sourceCodeBySlug}) => {
	const sections = getElementLibrarySections(category);
	const prefersReducedMotion = usePrefersReducedMotion();
	const [isCaptionPicker, setIsCaptionPicker] = useState(false);
	const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

	useLayoutEffect(() => {
		setIsCaptionPicker(
			isInsideStudio() &&
				new URLSearchParams(window.location.search).get(
					'remotion-studio-context',
				) === 'captions',
		);
	}, []);

	useEffect(() => subscribeToCaptionStyleSelection(setSelectedSlug), []);

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
								isCaptionPicker={isCaptionPicker}
								selectedSlug={selectedSlug}
								prefersReducedMotion={prefersReducedMotion}
								sourceCodeBySlug={sourceCodeBySlug}
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
							isCaptionPicker={isCaptionPicker}
							selectedSlug={selectedSlug}
							prefersReducedMotion={prefersReducedMotion}
							sourceCodeBySlug={sourceCodeBySlug}
						/>
					</section>
				);
			})}
		</div>
	);
};
