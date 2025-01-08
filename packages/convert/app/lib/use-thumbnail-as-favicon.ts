import {useCallback, useEffect, useState} from 'react';
import type {VideoThumbnailRef} from '~/components/VideoThumbnail';

const blobToDataURL = (blob: Blob) => {
	return new Promise<string>((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result as string);
		reader.onerror = reject;
		reader.readAsDataURL(blob);
	});
};

export const useThumbnailAsFavicon = ({
	sourceRef,
	targetRef,
}: {
	sourceRef: React.RefObject<VideoThumbnailRef | null>;
	targetRef: OffscreenCanvas | null;
}) => {
	const [thumbnail, setThumbnail] = useState<string | null>(null);
	const [mounted, setMounted] = useState(false);

	const draw = useCallback(() => {
		if (!targetRef) {
			return;
		}

		if (!sourceRef.current) {
			return;
		}

		if (!sourceRef.current.hasBitmap) {
			return;
		}

		sourceRef.current.copy().then((map) => {
			const ctx = targetRef.getContext('2d');
			if (!ctx) {
				return;
			}

			const scale = Math.min(32 / map.width, 32 / map.height);
			const x = (32 - map.width * scale) / 2;
			const y = (32 - map.height * scale) / 2;

			ctx.clearRect(0, 0, 32, 32);
			ctx.drawImage(map, x, y, map.width * scale, map.height * scale);

			targetRef
				.convertToBlob()
				.then((blob) => blobToDataURL(blob))
				.then((url) => setThumbnail(url));
		});
	}, [sourceRef, targetRef]);

	useEffect(() => {
		const {current} = sourceRef;
		if (!current) {
			return;
		}

		current.addOnChangeListener(draw);
		return () => {
			current.removeOnChangeListener(draw);
		};
	}, [draw, sourceRef]);

	useEffect(() => {
		setMounted(true);
		return () => {
			setMounted(false);
		};
	}, []);

	useEffect(() => {
		draw();
	}, [draw]);

	return mounted ? thumbnail : null;
};
