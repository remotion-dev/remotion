import type {MediaParserEmbeddedImage} from '@remotion/media-parser';
import type React from 'react';
import {useEffect, useState} from 'react';
import {THUMBNAIL_HEIGHT} from './VideoThumbnail';

export const EmbeddedImage: React.FC<{
	readonly images: MediaParserEmbeddedImage[];
}> = ({images}) => {
	const [url, setUrl] = useState<string | null>(null);

	const firstImage = images[0];

	useEffect(() => {
		if (!firstImage) {
			return;
		}

		const u = URL.createObjectURL(
			new Blob([new Uint8Array(firstImage.data)], {
				type: firstImage.mimeType ?? undefined,
			}),
		);

		setUrl(u);

		return () => {
			URL.revokeObjectURL(u);
		};
	}, [firstImage]);

	if (!firstImage) {
		return null;
	}

	if (!url) {
		return null;
	}

	return (
		<div
			style={{
				height: THUMBNAIL_HEIGHT,
			}}
			className="justify-center items-center flex border-solid border-b-2 border-black bg-slate-100"
		>
			<img src={url} className="max-h-full" />
		</div>
	);
};
