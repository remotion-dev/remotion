import React, {useCallback, useMemo, useState} from 'react';
import {Internals} from 'remotion';
import {WHITE_ALPHA_30} from '../../helpers/colors';
import {formatMediaDuration} from '../../helpers/format-media-duration';
import {useImageMetadata} from '../../helpers/use-image-metadata';
import {useMediaMetadata} from '../../helpers/use-media-metadata';
import {ActionTooltip} from '../ActionTooltip';
import {getTimelineAssetLinkInfo} from './timeline-asset-link';

const lineStyle: React.CSSProperties = {
	whiteSpace: 'nowrap',
	overflow: 'hidden',
	paddingRight: 10,
	maskImage: 'linear-gradient(to right, black calc(100% - 10px), transparent)',
	WebkitMaskImage:
		'linear-gradient(to right, black calc(100% - 10px), transparent)',
	minWidth: 0,
	fontSize: 12,
	lineHeight: '14px',
	color: WHITE_ALPHA_30,
	display: 'inline-block',
};

const useAssetLink = (src: string) => {
	const linkInfo = useMemo(() => getTimelineAssetLinkInfo(src), [src]);

	const fileNameStyle: React.CSSProperties = useMemo(
		() => ({
			...lineStyle,
			color: WHITE_ALPHA_30,
			textDecoration: 'none',
			display: 'inline-block',
			overflow: 'hidden',
			whiteSpace: 'pre',
			userSelect: 'none',
			WebkitUserSelect: 'none',
		}),
		[],
	);

	return {
		linkInfo,
		fileNameStyle,
	};
};

export const TimelineMediaInfo: React.FC<{
	readonly src: string;
	readonly isImage: boolean;
}> = ({src, isImage}) => {
	const fileName = useMemo(() => Internals.getAssetDisplayName(src), [src]);

	const {linkInfo, fileNameStyle} = useAssetLink(src);
	// Share the asset inspector's caches, but only load metadata after hovering.
	const [requestedSrc, setRequestedSrc] = useState<string | null>(null);
	const metadataSrc = requestedSrc === src ? src : null;
	const mediaMetadata = useMediaMetadata(isImage ? null : metadataSrc);
	const imageMetadata = useImageMetadata(isImage ? metadataSrc : null);
	const onPointerEnter = useCallback(() => setRequestedSrc(src), [src]);
	const visualDetails: string[] = [];
	const fileDetails: string[] = [];
	if (mediaMetadata && Number.isFinite(mediaMetadata.duration)) {
		fileDetails.push(formatMediaDuration(mediaMetadata.duration));
	}

	const dimensions = isImage ? imageMetadata : mediaMetadata;
	if (dimensions?.width && dimensions.height) {
		visualDetails.push(`${dimensions.width} × ${dimensions.height}`);
	}

	if (mediaMetadata?.fps && Number.isFinite(mediaMetadata.fps)) {
		visualDetails.push(`${Number(mediaMetadata.fps.toFixed(2))} fps`);
	}

	const format = isImage ? imageMetadata?.format : mediaMetadata?.format;
	if (format) {
		(isImage ? visualDetails : fileDetails).push(format);
	}

	const metadataLines = [visualDetails, fileDetails]
		.filter((details) => details.length > 0)
		.map((details) => details.join(' · '));

	const source =
		linkInfo?.kind === 'local'
			? linkInfo.assetPath
			: linkInfo?.kind === 'remote'
				? linkInfo.href
				: null;

	return (
		<ActionTooltip
			label={
				<span
					style={{
						display: 'inline-block',
						font: 'inherit',
						color: 'inherit',
						maxWidth: 360,
					}}
				>
					<strong style={{font: 'inherit', fontWeight: 600, color: 'inherit'}}>
						{fileName}
					</strong>
					{source !== null && source !== fileName ? `\n${source}` : null}
					{metadataLines.length > 0 ? `\n${metadataLines.join('\n')}` : null}
				</span>
			}
			shortcut={null}
			delay={800}
			dismissOnClick
			triggerStyle={{minWidth: 0, maxWidth: '100%'}}
		>
			<div
				role="group"
				style={fileNameStyle}
				aria-label={linkInfo ? linkInfo.title : fileName}
				onPointerEnter={onPointerEnter}
			>
				{fileName}
			</div>
		</ActionTooltip>
	);
};
