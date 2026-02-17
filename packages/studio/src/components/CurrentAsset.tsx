import {formatBytes} from '@remotion/studio-shared';
import {ALL_FORMATS, Input, UrlSource} from 'mediabunny';
import React, {useContext, useEffect, useMemo, useState} from 'react';
import {Internals, staticFile} from 'remotion';
import {BACKGROUND, BORDER_COLOR} from '../helpers/colors';
import {useStaticFiles} from './use-static-files';

export const CURRENT_ASSET_HEIGHT = 80;

const container: React.CSSProperties = {
	height: CURRENT_ASSET_HEIGHT,
	display: 'block',
	borderBottom: `1px solid ${BORDER_COLOR}`,
	padding: 12,
	color: 'white',
	backgroundColor: BACKGROUND,
};

const title: React.CSSProperties = {
	fontWeight: 'bold',
	fontSize: 12,
	whiteSpace: 'nowrap',
	lineHeight: '18px',
	backgroundColor: BACKGROUND,
};

const subtitle: React.CSSProperties = {
	fontSize: 12,
	opacity: 0.8,
	whiteSpace: 'nowrap',
	lineHeight: '18px',
	backgroundColor: BACKGROUND,
};

const row: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	lineHeight: '18px',
	backgroundColor: BACKGROUND,
};

const formatDuration = (seconds: number): string => {
	const h = Math.floor(seconds / 3600);
	const m = Math.floor((seconds % 3600) / 60);
	const s = seconds % 60;
	const sFixed = s.toFixed(2).padStart(5, '0');

	if (h > 0) {
		return `${h}:${String(m).padStart(2, '0')}:${sFixed}`;
	}

	return `${String(m).padStart(2, '0')}:${sFixed}`;
};

type MediaMetadata = {
	duration: number;
	format: string;
	width: number | null;
	height: number | null;
};

export const CurrentAsset: React.FC = () => {
	const {canvasContent} = useContext(Internals.CompositionManager);

	const assetName =
		canvasContent?.type === 'asset' ? canvasContent.asset : null;

	const staticFiles = useStaticFiles();

	const sizeInBytes = useMemo(() => {
		if (!assetName) {
			return null;
		}

		const file = staticFiles.find((f) => f.name === assetName);
		return file?.sizeInBytes ?? null;
	}, [assetName, staticFiles]);

	const [mediaMetadata, setMediaMetadata] = useState<MediaMetadata | null>(
		null,
	);

	useEffect(() => {
		setMediaMetadata(null);

		if (!assetName) {
			return;
		}

		const url = staticFile(assetName);
		const input = new Input({
			formats: ALL_FORMATS,
			source: new UrlSource(url),
		});

		Promise.all([
			input.computeDuration(),
			input.getFormat(),
			input.getPrimaryVideoTrack(),
		])
			.then(([duration, format, videoTrack]) => {
				setMediaMetadata({
					duration,
					format: format.name,
					width: videoTrack?.displayWidth ?? null,
					height: videoTrack?.displayHeight ?? null,
				});
			})
			.catch(() => {
				// InputDisposedError (user navigated away) and
				// non-media files (e.g. .png, .json) — ignore silently
			});

		return () => {
			input.dispose();
		};
	}, [assetName]);

	if (!assetName) {
		return <div style={container} />;
	}

	const fileName = assetName.split('/').pop() ?? assetName;

	const subtitleParts: string[] = [];
	if (sizeInBytes !== null) {
		subtitleParts.push(formatBytes(sizeInBytes));
	}

	if (mediaMetadata) {
		subtitleParts.push(mediaMetadata.format);
		if (mediaMetadata.width !== null && mediaMetadata.height !== null) {
			subtitleParts.push(`${mediaMetadata.width}x${mediaMetadata.height}`);
		}
	}

	return (
		<div style={container}>
			<div style={row}>
				<div>
					<div style={title}>{fileName}</div>
					{subtitleParts.length > 0 ? (
						<div style={subtitle}>{subtitleParts.join(' · ')}</div>
					) : null}
					{mediaMetadata ? (
						<div style={subtitle}>{formatDuration(mediaMetadata.duration)}</div>
					) : null}
				</div>
			</div>
		</div>
	);
};
