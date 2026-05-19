import {Video} from '@remotion/media';
import {Html5Video} from 'remotion';

const src = 'https://remotion.media/video-1m.mp4';

export const LoopDisplayTestComponent = () => {
	return (
		<>
			<Html5Video
				src={src}
				trimBefore={90}
				trimAfter={60 * 30}
				playbackRate={0.5}
				loop
				name="Html5Video"
				style={{width: '50%'}}
			/>
			<Video
				src={src}
				trimBefore={90}
				trimAfter={60 * 30}
				playbackRate={0.5}
				loop
				name="MediaVideo"
				style={{width: '50%'}}
			/>
		</>
	);
};
