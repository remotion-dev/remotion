import React, {useMemo} from 'react';
import {Internals} from 'remotion';
import {VERY_LIGHT_TEXT} from '../../helpers/colors';
import {formatMediaDuration} from '../../helpers/format-media-duration';
import {useMediaMetadata} from '../../helpers/use-media-metadata';

const containerStyle: React.CSSProperties = {
	fontFamily: 'Arial, Helvetica, sans-serif',
	color: VERY_LIGHT_TEXT,
	fontSize: 12,
	lineHeight: 1,
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
	color: VERY_LIGHT_TEXT,
	paddingTop: 3,
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
			<div style={lineStyle} title={fileName}>
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
