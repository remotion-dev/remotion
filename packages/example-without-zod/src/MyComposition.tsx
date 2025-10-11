import {OffthreadVideo} from 'remotion';

export const MyComposition = () => {
	return (
		<OffthreadVideo
			src="https://www.w3schools.com/html"
			delayRenderRetries={2}
		/>
	);
};
