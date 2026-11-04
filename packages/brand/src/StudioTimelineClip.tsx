import {Img, Interactive, useVideoConfig} from 'remotion';

const StudioTimelineClipContent = ({
	focusX,
	focusY,
	zoom,
}: {
	readonly focusX: number;
	readonly focusY: number;
	readonly zoom: number;
}) => {
	const {width, height} = useVideoConfig();

	return (
		<Img
			name="Centered timeline clip - original Studio screenshot"
			src="https://remotion.media/timeline-reveal/after-2026-11-02-filmstrip-fixed-9548b256cf19.png"
			style={{
				position: 'absolute',
				width: 6400,
				height: 4000,
				maxWidth: 'none',
				left: '50%',
				top: '50%',
				translate: `${-focusX}px ${-focusY}px`,
				transformOrigin: `${focusX}px ${focusY}px`,
				scale: zoom * Math.min(width / 2560, height / 1600),
			}}
		/>
	);
};

export const StudioTimelineClip = Interactive.create({
	Component: StudioTimelineClipContent,
	layout: 'absolute-fill',
	schema: {
		focusX: {
			type: 'number',
			hiddenFromList: false,
			default: 1590,
			description: 'Clip center X',
		},
		focusY: {
			type: 'number',
			hiddenFromList: false,
			default: 2585,
			description: 'Clip center Y',
		},
		zoom: {
			type: 'number',
			hiddenFromList: false,
			default: 2.7,
			min: 0.1,
			description: 'Clip zoom',
		},
	},
});
