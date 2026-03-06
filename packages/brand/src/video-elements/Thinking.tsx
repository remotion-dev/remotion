import {useCurrentFrame, useVideoConfig} from 'remotion';
import {MESSAGES} from './messages';

const SPINNER_CHARS = ['·', '✻', '✽', '✶', '✳', '✢'];
const BASE_COLOR = '#D47556';
const HIGHLIGHT_COLOR = '#E08468';

export type ThinkingProps = {
	index: number;
};

export const Thinking: React.FC<ThinkingProps> = ({index}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const text = MESSAGES[index % MESSAGES.length] + '…';

	const framesPerChar = Math.round((150 / 1000) * fps);
	const spinnerIndex = Math.floor(frame / framesPerChar) % SPINNER_CHARS.length;
	const spinnerChar = SPINNER_CHARS[spinnerIndex];

	const framesPerHighlight = Math.round((100 / 1000) * fps);
	const highlightIndex = Math.floor(frame / framesPerHighlight) % text.length;

	return (
		<div
			style={{
				color: BASE_COLOR,
				fontSize: 38,
				fontFamily: 'monospace',
				fontWeight: 500,
				marginTop: 24,
			}}
		>
			{spinnerChar}{' '}
			{text.split('').map((char, i) => (
				<span
					// eslint-disable-next-line react/no-array-index-key
					key={`${char}-${i}`}
					style={{
						color: i === highlightIndex ? HIGHLIGHT_COLOR : BASE_COLOR,
					}}
				>
					{char}
				</span>
			))}
		</div>
	);
};
