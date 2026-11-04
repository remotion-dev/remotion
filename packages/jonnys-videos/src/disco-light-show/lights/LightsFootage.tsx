import {Video} from '@remotion/media';
import {Interactive} from 'remotion';

const LightsFootageInner = ({
	src,
	footageRate,
}: {
	readonly src: string;
	readonly footageRate: number;
}) => (
	<Video
		name="Light-show footage"
		src={src}
		muted
		loop
		playbackRate={footageRate}
		style={{
			position: 'absolute',
			left: 54,
			top: 416,
			width: 972,
			height: 546.75,
			outline: '2px solid #2684ff',
		}}
	/>
);

export const LightsFootage = Interactive.create({
	Component: LightsFootageInner,
	layout: 'absolute-fill',
	schema: {
		src: {type: 'string', default: '', description: 'Footage URL'},
		footageRate: {
			type: 'number',
			hiddenFromList: false,
			default: 1,
			description: 'Footage speed',
		},
	},
});
