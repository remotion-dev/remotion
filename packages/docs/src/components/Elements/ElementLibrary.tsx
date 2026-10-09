import Link from '@docusaurus/Link';
import {isInsideStudio, setStudioDragData} from '@remotion/studio-protocol';
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
import {useStudioInstallFallback} from './use-studio-install-fallback';
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
	readonly prefersReducedMotion: boolean;
	readonly sourceCode: string;
}> = ({definition, isCaptionPicker, prefersReducedMotion, sourceCode}) => {
	const [isFocused, setIsFocused] = useState(false);
	const [isPointerOver, setIsPointerOver] = useState(false);
	const [playbackFailed, setPlaybackFailed] = useState(false);
	const [isInstalling, setIsInstalling] = useState(false);
	const {
		buttonLabel,
		closeFallback,
		failureCount,
		isFallbackOpen,
		showFallback,
	} = useStudioInstallFallback('Use');
	const installTriggerRef = useRef<HTMLElement>(null);
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
				showFallback();
				return;
			}

			closeFallback();
			if (window.location.origin === 'https://www.remotion.dev') {
				navigator.sendBeacon(
					`https://www.remotion.pro/api/track/element-install-request?slug=${encodeURIComponent(definition.slug)}`,
				);
			}
		} catch {
			showFallback();
		} finally {
			setIsInstalling(false);
		}
	};

	const onInstallClick = (event: React.MouseEvent<HTMLElement>) => {
		installTriggerRef.current = event.currentTarget;
		installElement();
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
							onClick: onInstallClick,
							disabled: isInstalling,
							'aria-label': `Select ${definition.displayName}`,
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
					onClick={onInstallClick}
					size="sm"
					style={{padding: '5px 8px'}}
					title="Install in the most recently focused Remotion Studio"
				>
					Use
				</BlueButton>
			</div>
			<ElementInstallFallbackModal
				buttonLabel={buttonLabel}
				definition={definition}
				installFailureCount={failureCount}
				isInstalling={isInstalling}
				isOpen={isFallbackOpen}
				onClose={closeFallback}
				onInstall={installElement}
				posterRef={posterRef}
				sourceCode={sourceCode}
				triggerRef={installTriggerRef}
			/>
		</li>
	);
};

const ElementGrid: React.FC<{
	readonly definitions: readonly ElementDefinition[];
	readonly isCaptionPicker: boolean;
	readonly prefersReducedMotion: boolean;
	readonly sourceCodeBySlug: Readonly<Record<string, string>>;
}> = ({
	definitions,
	isCaptionPicker,
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

	useLayoutEffect(() => {
		setIsCaptionPicker(
			isInsideStudio() &&
				new URLSearchParams(window.location.search).get(
					'remotion-studio-context',
				) === 'captions',
		);
	}, []);

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
							prefersReducedMotion={prefersReducedMotion}
							sourceCodeBySlug={sourceCodeBySlug}
						/>
					</section>
				);
			})}
		</div>
	);
};
