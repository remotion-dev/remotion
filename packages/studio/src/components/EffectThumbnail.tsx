import {
	getEffectPreviewAlt,
	getEffectPreviewSource,
	type EffectCatalogItem,
} from '@remotion/studio-shared';
import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {WHITE_ALPHA_06} from '../helpers/colors';
import {renderEffectThumbnail} from './render-effect-thumbnail';

const frame: React.CSSProperties = {
	width: '100%',
	aspectRatio: '3 / 2',
	position: 'relative',
	backgroundColor: WHITE_ALPHA_06,
	borderRadius: 3,
	overflow: 'hidden',
	pointerEvents: 'none',
};

export const EffectThumbnail: React.FC<{
	readonly item: EffectCatalogItem;
	readonly snapshot: HTMLCanvasElement | null;
}> = ({item, snapshot}) => {
	const frameRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [visible, setVisible] = useState(false);
	const [preview, setPreview] = useState<{
		snapshot: HTMLCanvasElement;
		image: HTMLCanvasElement | null;
	} | null>(null);
	const [loaded, setLoaded] = useState(false);
	const currentPreview = preview?.snapshot === snapshot ? preview : null;
	const showCapturedElement =
		snapshot !== null && (!currentPreview || currentPreview.image !== null);

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
		if (!snapshot || !visible) {
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
	}, [item, snapshot, visible]);

	const image = currentPreview?.image ?? snapshot;
	useLayoutEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas || !image || !visible || !showCapturedElement) {
			return;
		}

		const scale = Math.min(1, 320 / Math.max(image.width, image.height));
		canvas.width = Math.max(1, Math.round(image.width * scale));
		canvas.height = Math.max(1, Math.round(image.height * scale));
		canvas
			.getContext('2d')
			?.drawImage(image, 0, 0, canvas.width, canvas.height);
	}, [image, showCapturedElement, visible]);

	return (
		<div ref={frameRef} style={frame}>
			{showCapturedElement ? (
				<canvas
					ref={canvasRef}
					role="img"
					aria-label={`${item.label} on the selected element`}
					style={{
						position: 'absolute',
						inset: 0,
						width: '100%',
						height: '100%',
						objectFit: 'contain',
					}}
				/>
			) : (
				<img
					src={getEffectPreviewSource(item)}
					alt={getEffectPreviewAlt(item)}
					style={{
						position: 'absolute',
						inset: 0,
						width: '100%',
						height: '100%',
						objectFit: 'cover',
						visibility: loaded ? 'visible' : 'hidden',
					}}
					loading="lazy"
					onLoad={() => setLoaded(true)}
				/>
			)}
		</div>
	);
};
