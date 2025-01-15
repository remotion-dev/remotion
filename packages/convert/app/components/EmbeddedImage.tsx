import type {MediaParserEmbeddedImage} from '@remotion/media-parser';
import type React from 'react';
import {useEffect, useState} from 'react';

export const EmbeddedImage: React.FC<{
	images: MediaParserEmbeddedImage[];
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
	}, []);

	if (!firstImage) {
		return null;
	}

	if (!url) {
		return null;
	}

	return (
		<div>
			<div>
				<img src={url} />
			</div>
		</div>
	);
};
