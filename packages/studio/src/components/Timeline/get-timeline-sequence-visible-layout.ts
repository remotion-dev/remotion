type TimelineSequenceVisibleLayout = {
	readonly marginLeft: number;
	readonly width: number;
	readonly cropLeft: number;
	readonly leftEdgeVisible: boolean;
	readonly rightEdgeVisible: boolean;
	readonly premount: {readonly left: number; readonly width: number} | null;
	readonly postmount: {readonly left: number; readonly width: number} | null;
	readonly media: {
		readonly left: number;
		readonly width: number;
		readonly offset: number;
		readonly fullWidth: number;
	} | null;
};

const getVisibleSection = ({
	sectionStart,
	sectionEnd,
	cropStart,
	cropEnd,
}: {
	readonly sectionStart: number;
	readonly sectionEnd: number;
	readonly cropStart: number;
	readonly cropEnd: number;
}) => {
	const start = Math.max(sectionStart, cropStart);
	const end = Math.min(sectionEnd, cropEnd);
	if (end <= start) {
		return null;
	}

	return {
		left: start - cropStart,
		width: end - start,
	};
};

export const getTimelineSequenceVisibleLayout = ({
	marginLeft,
	width,
	premountWidth,
	postmountWidth,
	renderWindowLeft,
	renderWindowWidth,
}: {
	readonly marginLeft: number;
	readonly width: number;
	readonly premountWidth: number;
	readonly postmountWidth: number;
	readonly renderWindowLeft: number;
	readonly renderWindowWidth: number;
}): TimelineSequenceVisibleLayout | null => {
	const itemStart = marginLeft;
	const itemEnd = marginLeft + width;
	const renderWindowEnd = renderWindowLeft + renderWindowWidth;
	const visibleStart = Math.max(itemStart, renderWindowLeft);
	const visibleEnd = Math.min(itemEnd, renderWindowEnd);
	if (visibleEnd <= visibleStart) {
		return null;
	}

	const cropStart = visibleStart - itemStart;
	const cropEnd = visibleEnd - itemStart;
	const mediaStart = premountWidth;
	const mediaEnd = Math.max(mediaStart, width - postmountWidth);
	const media = getVisibleSection({
		sectionStart: mediaStart,
		sectionEnd: mediaEnd,
		cropStart,
		cropEnd,
	});

	return {
		marginLeft: visibleStart,
		width: visibleEnd - visibleStart,
		cropLeft: cropStart,
		leftEdgeVisible: visibleStart === itemStart,
		rightEdgeVisible: visibleEnd === itemEnd,
		premount: getVisibleSection({
			sectionStart: 0,
			sectionEnd: premountWidth,
			cropStart,
			cropEnd,
		}),
		postmount: getVisibleSection({
			sectionStart: Math.max(0, width - postmountWidth),
			sectionEnd: width,
			cropStart,
			cropEnd,
		}),
		media: media
			? {
					...media,
					offset: Math.max(0, cropStart - mediaStart),
					fullWidth: Math.max(0, mediaEnd - mediaStart),
				}
			: null,
	};
};
