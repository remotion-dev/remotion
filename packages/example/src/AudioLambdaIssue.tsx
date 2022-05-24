import {Audio, interpolate} from 'remotion';

export const AudioLambdaIssue = () => {
	return (
		<div>
			<div>Hello World!</div>
			<Audio
				src="https://file-examples.com/storage/feddb42d8762894ad9bbbb0/2017/11/file_example_MP3_700KB.mp3"
				volume={(f) =>
					interpolate(f, [0, 120], [0, 1], {extrapolateLeft: 'clamp'})
				}
			/>
		</div>
	);
};
