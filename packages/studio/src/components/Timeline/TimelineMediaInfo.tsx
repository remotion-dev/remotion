import React, {useMemo} from 'react';
import {Internals} from 'remotion';
import {WHITE_ALPHA_30} from '../../helpers/colors';
import {getTimelineAssetLinkInfo} from './timeline-asset-link';

const lineStyle: React.CSSProperties = {
	whiteSpace: 'nowrap',
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	minWidth: 0,
	fontSize: 12,
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
			textOverflow: 'ellipsis',
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
		<div style={fileNameStyle} title={linkInfo ? linkInfo.title : fileName}>
			{fileName}
		</div>
	);
};
