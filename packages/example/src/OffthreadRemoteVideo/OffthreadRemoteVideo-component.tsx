import {OffthreadVideo, staticFile} from 'remotion';

const src = staticFile('bigbuckbunny.mp4') + '#t=lol';

export const OffthreadRemoteVideoComponent = () => {
	return (
		<>
			<OffthreadVideo src={src} />
		</>
	);
};
