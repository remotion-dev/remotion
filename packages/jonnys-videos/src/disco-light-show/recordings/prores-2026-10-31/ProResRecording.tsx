import {Video} from '@remotion/media';
import {Interactive, useVideoConfig} from 'remotion';

const ProResRecordingInner = ({src}: {readonly src: string}) => {
	const {durationInFrames} = useVideoConfig();

	return (
		<>
			<Video
				name="Original ProRes recording"
				src={src}
				durationInFrames={durationInFrames}
				style={{width: '100%', height: '100%'}}
			/>
		</>
	);
};

export const ProResRecording = Interactive.create({
	Component: ProResRecordingInner,
	layout: 'absolute-fill',
	schema: {
		src: {
			type: 'asset',
			assetType: 'video',
			default: '',
			description: 'ProRes recording',
		},
	},
});
