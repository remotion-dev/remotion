import type {InteractivitySchema} from 'remotion';
import {Interactive, useCurrentFrame, useVideoConfig} from 'remotion';
import {MESSAGES} from './messages';

const SPINNER_CHARS = ['·', '✻', '✽', '✶', '✳', '✢'];
const BASE_COLOR = '#D47556';
const HIGHLIGHT_COLOR = '#E08468';

export type ThinkingProps = {
	readonly style?: React.CSSProperties;
	index: number;
};

const ThinkingInner: React.FC<ThinkingProps> = ({index, style}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const text = MESSAGES[index % MESSAGES.length] + '…';
	const characters = text
		.split('')
		.map((char, charIndex) => ({char, id: `${char}-${charIndex}`}));

	const framesPerChar = Math.round((150 / 1000) * fps);
	const spinnerIndex = Math.floor(frame / framesPerChar) % SPINNER_CHARS.length;
	const spinnerChar = SPINNER_CHARS[spinnerIndex];

	const framesPerHighlight = Math.round((100 / 1000) * fps);
	const highlightIndex = Math.floor(frame / framesPerHighlight) % text.length;

	return (
		<Interactive.Div
			name="Agent thinking indicator"
			style={{
				color: '#D47556',
				fontSize: 38,
				fontFamily: 'monospace',
				fontWeight: 500,
				marginTop: 24,
				...style,
			}}
		>
			{spinnerChar}{' '}
			{characters.map(({char, id}, i) => (
				<span
					key={id}
					style={{
						color: i === highlightIndex ? HIGHLIGHT_COLOR : BASE_COLOR,
					}}
				>
					{char}
				</span>
			))}
		</Interactive.Div>
	);
};

const thinkingSchema = {
	index: {
		type: 'number',
		default: 0,
		min: 0,
		step: 1,
		integer: true,
		hiddenFromList: false,
		keyframable: false,
		description: 'Message index',
	},
} as const satisfies InteractivitySchema;

export const Thinking = Interactive.withSchema({
	Component: ThinkingInner,
	componentName: '<Thinking>',
	schema: thinkingSchema,
	wrapInSequence: true,
});
