import React, {useMemo} from 'react';
import {Internals} from 'remotion';
import {LIGHT_TEXT} from '../../helpers/colors';
import {formatMediaDuration} from '../../helpers/format-media-duration';
import {useMediaMetadata} from '../../helpers/use-media-metadata';

const containerStyle: React.CSSProperties = {
	fontFamily: 'Arial, Helvetica, sans-serif',
	color: LIGHT_TEXT,
	fontSize: 12,
	lineHeight: 1.1,
	overflow: 'hidden',
	whiteSpace: 'nowrap',
	textOverflow: 'ellipsis',
	minWidth: 0,
};

const lineStyle: React.CSSProperties = {
	whiteSpace: 'nowrap',
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	minWidth: 0,
	fontSize: 12,
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

	const detailsLine = useMemo(() => {
		if (!metadata) {
			return null;
		}

		const parts: string[] = [];
		parts.push(metadata.format);

		if (type === 'video' && metadata.videoCodec) {
			parts.push(metadata.videoCodec);
		}

		if (type !== 'image' && metadata.audioCodec) {
			parts.push(metadata.audioCodec);
		}

		if (metadata.width !== null && metadata.height !== null) {
			parts.push(`${metadata.width}x${metadata.height}`);
		}

		if (type !== 'image') {
			parts.push(formatMediaDuration(metadata.duration));
		}

		return parts.join(' · ');
	}, [metadata, type]);

	return (
		<div style={containerStyle}>
			<div style={fileNameStyle} title={fileName}>
				{fileName}
			</div>
			{detailsLine ? (
				<div style={lineStyle} title={detailsLine}>
					{detailsLine}
				</div>
			) : null}
		</div>
	);
};
