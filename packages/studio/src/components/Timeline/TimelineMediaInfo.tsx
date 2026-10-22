import React, {useMemo} from 'react';
import {Internals} from 'remotion';
import {WHITE_ALPHA_30} from '../../helpers/colors';
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
}> = ({src}) => {
	const fileName = useMemo(() => Internals.getAssetDisplayName(src), [src]);

	const {linkInfo, fileNameStyle} = useAssetLink(src);

	return (
		<div
			role="group"
			style={fileNameStyle}
			aria-label={linkInfo ? linkInfo.title : fileName}
		>
			{fileName}
		</div>
	);
};
