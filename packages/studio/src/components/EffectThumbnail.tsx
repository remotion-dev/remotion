import {
	getEffectPreviewAlt,
	getEffectPreviewSource,
	type EffectCatalogItem,
} from '@remotion/studio-shared';
import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {TRANSPARENT, WHITE_ALPHA_06} from '../helpers/colors';
import {
	getCachedEffectThumbnail,
	renderEffectThumbnail,
} from './render-effect-thumbnail';

const MIN_PREVIEW_ASPECT_RATIO = 3 / 2;

const frame: React.CSSProperties = {
	width: '100%',
	position: 'relative',
	borderRadius: 3,
	overflow: 'hidden',
	pointerEvents: 'none',
};

export const EffectThumbnail: React.FC<{
	readonly item: EffectCatalogItem;
	readonly snapshot: HTMLCanvasElement | null;
	readonly isScrolling: boolean;
}> = ({item, snapshot, isScrolling}) => {
	const frameRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [visible, setVisible] = useState(false);
	const [preview, setPreview] = useState<{
		snapshot: HTMLCanvasElement;
		image: HTMLCanvasElement | null;
	} | null>(null);
	const [loaded, setLoaded] = useState(false);
	const currentPreview = preview?.snapshot === snapshot ? preview : null;
	const image =
		getCachedEffectThumbnail(snapshot, item.id) ??
		currentPreview?.image ??
		null;
	const showFallback = snapshot === null || currentPreview?.image === null;

	useEffect(() => {
		if (typeof IntersectionObserver === 'undefined') {
			setVisible(true);
			return;
		}

		const observer = new IntersectionObserver((entries) => {
			setVisible(entries.some((entry) => entry.isIntersecting));
		});
		observer.observe(frameRef.current!);
		return () => observer.disconnect();
	}, []);

	useEffect(() => {
		if (
			!snapshot ||
			!visible ||
			isScrolling ||
			image !== null ||
			currentPreview
		) {
			return;
		}

		const controller = new AbortController();
		renderEffectThumbnail({snapshot, item, signal: controller.signal}).then(
			(renderedImage) => {
				if (!controller.signal.aborted) {
					setPreview({snapshot, image: renderedImage});
				}
			},
		);
		return () => controller.abort();
	}, [currentPreview, image, isScrolling, item, snapshot, visible]);

	const imageAspectRatio =
		snapshot === null
			? MIN_PREVIEW_ASPECT_RATIO
			: snapshot.width / snapshot.height;
	const widerThanFrame = imageAspectRatio >= MIN_PREVIEW_ASPECT_RATIO;
	useLayoutEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas || !image || !visible) {
			return;
		}

		canvas.width = image.width;
		canvas.height = image.height;
		canvas
			.getContext('2d')
			?.drawImage(image, 0, 0, canvas.width, canvas.height);
	}, [image, visible]);

	return (
		<div
			ref={frameRef}
			style={{
				...frame,
				aspectRatio: Math.max(MIN_PREVIEW_ASPECT_RATIO, imageAspectRatio),
				backgroundColor:
					image === null && (!showFallback || !loaded)
						? WHITE_ALPHA_06
						: TRANSPARENT,
			}}
		>
			{image !== null ? (
				<canvas
					ref={canvasRef}
					role="img"
					aria-label={`${item.label} on the selected element`}
					style={{
						position: 'absolute',
						top: 0,
						left: '50%',
						transform: 'translateX(-50%)',
						width: widerThanFrame ? '100%' : 'auto',
						height: widerThanFrame ? 'auto' : '100%',
						borderRadius: 3,
					}}
				/>
			) : showFallback && (!isScrolling || loaded) ? (
				<img
					src={getEffectPreviewSource(item)}
					alt={getEffectPreviewAlt(item)}
					style={{
						position: 'absolute',
						inset: 0,
						width: '100%',
						height: '100%',
						objectFit: 'cover',
						borderRadius: 3,
						visibility: loaded ? 'visible' : 'hidden',
					}}
					loading="lazy"
					onLoad={() => setLoaded(true)}
				/>
			) : null}
		</div>
	);
};
