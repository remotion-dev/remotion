import React, {useMemo} from 'react';
import {Internals} from 'remotion';
import {LIGHT_TEXT} from '../../helpers/colors';
import {formatMediaDuration} from '../../helpers/format-media-duration';
import {useMediaMetadata} from '../../helpers/use-media-metadata';

const containerStyle: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	fontFamily: 'Arial, Helvetica, sans-serif',
	color: LIGHT_TEXT,
	fontSize: 11,
	lineHeight: '14px',
	overflow: 'hidden',
	whiteSpace: 'nowrap',
	textOverflow: 'ellipsis',
	minWidth: 0,
	flex: 1,
};

const lineStyle: React.CSSProperties = {
	whiteSpace: 'nowrap',
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	minWidth: 0,
};

const fileNameStyle: React.CSSProperties = {
	...lineStyle,
	fontWeight: 'bold',
	color: 'white',
};

export const TimelineMediaInfo: React.FC<{
	readonly src: string;
	readonly type: 'audio' | 'video' | 'image';
}> = ({src, type}) => {
	const metadata = useMediaMetadata(src);
	const fileName = useMemo(() => Internals.getAssetDisplayName(src), [src]);

	const subtitleLine = useMemo(() => {
		if (!metadata) {
			return null;
		}

		const parts: string[] = [];

		if (type === 'image') {
			parts.push(metadata.format);
			if (metadata.width !== null && metadata.height !== null) {
				parts.push(`${metadata.width}x${metadata.height}`);
			}
		} else if (type === 'video') {
			parts.push(metadata.format);
			if (metadata.videoCodec) {
				parts.push(metadata.videoCodec);
			}

			if (metadata.audioCodec) {
				parts.push(metadata.audioCodec);
			}
		} else {
			parts.push(metadata.format);
			if (metadata.audioCodec) {
				parts.push(metadata.audioCodec);
			}
		}

		return parts.join(' · ');
	}, [metadata, type]);

	const detailsLine = useMemo(() => {
		if (!metadata) {
			return null;
		}

		if (type === 'image') {
			return null;
		}

		const parts: string[] = [];
		if (
			type === 'video' &&
			metadata.width !== null &&
			metadata.height !== null
		) {
			parts.push(`${metadata.width}x${metadata.height}`);
		}

		parts.push(formatMediaDuration(metadata.duration));

		return parts.join(' · ');
	}, [metadata, type]);

	return (
		<div style={containerStyle}>
			<div style={fileNameStyle} title={fileName}>
				{fileName}
			</div>
			{subtitleLine ? (
				<div style={lineStyle} title={subtitleLine}>
					{subtitleLine}
				</div>
			) : null}
			{detailsLine ? (
				<div style={lineStyle} title={detailsLine}>
					{detailsLine}
				</div>
			) : null}
		</div>
	);
};
