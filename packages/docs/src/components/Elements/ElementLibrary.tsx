import {
	installInStudio,
	isInsideStudio,
	setStudioDragData,
} from '@remotion/studio-protocol';
import React, {
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import type {ElementDefinition} from './element-definitions';
import {
	createElementPayloadFromDefinition,
	setElementDragImage,
} from './element-drag-data';
import {
	getElementDocumentationUrl,
	getElementLibrarySections,
	type ElementCategory,
} from './element-library-data';
import {ELEMENT_PREVIEW_BACKGROUND} from './ElementPreviewComposition';
import {InlineStudioButton} from './InlineStudioButton';
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
	readonly isEmbeddedInStudio: boolean;
	readonly prefersReducedMotion: boolean;
	readonly sourceCode: string;
}> = ({definition, isEmbeddedInStudio, prefersReducedMotion, sourceCode}) => {
	const [isFocused, setIsFocused] = useState(false);
	const [isPointerOver, setIsPointerOver] = useState(false);
	const [playbackFailed, setPlaybackFailed] = useState(false);
	const [isInstalling, setIsInstalling] = useState(false);
	const [wasSentToStudio, setWasSentToStudio] = useState(false);
	const posterRef = useRef<HTMLImageElement>(null);
	const videoRef = useRef<HTMLVideoElement>(null);
	const shouldPlay =
		!prefersReducedMotion && !playbackFailed && (isFocused || isPointerOver);
	const elementPayload = useMemo(
		() =>
			createElementPayloadFromDefinition({
				definition,
				sourceCode,
				installAssets: false,
			}),
		[definition, sourceCode],
	);
	const assetPayload = useMemo(
		() =>
			definition.assets.length === 0
				? null
				: createElementPayloadFromDefinition({
						definition,
						sourceCode,
						installAssets: true,
					}),
		[definition, sourceCode],
	);

	useEffect(() => {
		if (!wasSentToStudio) {
			return;
		}

		const timeout = window.setTimeout(() => setWasSentToStudio(false), 3000);
		return () => window.clearTimeout(timeout);
	}, [wasSentToStudio]);

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
		setWasSentToStudio(false);
		setIsInstalling(true);
		try {
			const result = await installInStudio({
				payload: assetPayload ?? elementPayload,
				fallbackPayload: assetPayload === null ? undefined : elementPayload,
			});
			if (!result.success) {
				// eslint-disable-next-line no-alert
				window.alert(result.message);
				return;
			}

			setWasSentToStudio(!isEmbeddedInStudio);

			if (window.location.origin === 'https://www.remotion.dev') {
				navigator.sendBeacon(
					`https://www.remotion.pro/api/track/element-install-request?slug=${encodeURIComponent(definition.slug)}`,
				);
			}
		} catch (error) {
			// eslint-disable-next-line no-alert
			window.alert(
				error instanceof Error
					? error.message
					: 'Could not install this Element in Studio.',
			);
		} finally {
			setIsInstalling(false);
		}
	};

	const installButtonLabel = isInstalling
		? isEmbeddedInStudio
			? 'Using…'
			: 'Finding Studio…'
		: wasSentToStudio
			? 'Sent to Studio'
			: isEmbeddedInStudio
				? 'Use'
				: 'Install in Studio';

	return (
		<li
			className={styles.cardItem}
			onPointerEnter={activateFromPointer}
			onPointerLeave={() => setIsPointerOver(false)}
		>
			<a
				className={styles.card}
				draggable
				href={getElementDocumentationUrl(definition)}
				onBlur={() => setIsFocused(false)}
				onFocus={() => {
					setPlaybackFailed(false);
					setIsFocused(true);
				}}
				onDragStart={(event) => {
					setStudioDragData({
						dataTransfer: event.dataTransfer,
						payload: elementPayload,
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
			</a>
			<div aria-live="polite" className={styles.installAction}>
				<InlineStudioButton
					aria-label={`${installButtonLabel} – ${definition.displayName}`}
					icon={null}
					loading={isInstalling}
					onClick={installElement}
					title="Install in the most recently focused Remotion Studio"
				>
					{installButtonLabel}
				</InlineStudioButton>
			</div>
		</li>
	);
};

const ElementGrid: React.FC<{
	readonly definitions: readonly ElementDefinition[];
	readonly isEmbeddedInStudio: boolean;
	readonly prefersReducedMotion: boolean;
	readonly sourceCodeBySlug: Readonly<Record<string, string>>;
}> = ({
	definitions,
	isEmbeddedInStudio,
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
						isEmbeddedInStudio={isEmbeddedInStudio}
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
	const [isEmbeddedInStudio, setIsEmbeddedInStudio] = useState(false);

	useLayoutEffect(() => {
		setIsEmbeddedInStudio(isInsideStudio());
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
								isEmbeddedInStudio={isEmbeddedInStudio}
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
							isEmbeddedInStudio={isEmbeddedInStudio}
							prefersReducedMotion={prefersReducedMotion}
							sourceCodeBySlug={sourceCodeBySlug}
						/>
					</section>
				);
			})}
		</div>
	);
};
