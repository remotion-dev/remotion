import React from 'react';
import {
	Interactive,
	interpolate,
	useCurrentFrame,
	type InteractivitySchema,
} from 'remotion';

type Props = {
	readonly text: string;
	readonly start: number;
	readonly charsPerFrame?: number;
	readonly cursorColor?: string;
	readonly style?: React.CSSProperties;
};

const TypewriterInner: React.FC<Props> = ({
	text,
	start,
	charsPerFrame = 1,
	cursorColor = '#F3EFE6',
	style,
}) => {
	const frame = useCurrentFrame();
	const typed = Math.floor(
		interpolate(
			frame,
			[start, start + text.length / charsPerFrame],
			[0, text.length],
			{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
		),
	);
	const isTyping = typed > 0 && typed < text.length;
	const cursorVisible = isTyping || Math.floor(frame / 8) % 2 === 0;

	return (
		<Interactive.Span style={{whiteSpace: 'pre', ...style}}>
			{text.slice(0, typed)}
			<span
				style={{
					display: 'inline-block',
					width: '0.6em',
					height: '1em',
					marginLeft: '0.1em',
					verticalAlign: '-0.12em',
					backgroundColor: cursorColor,
					opacity: frame >= start && cursorVisible ? 1 : 0,
				}}
			/>
		</Interactive.Span>
	);
};

const typewriterSchema = {
	text: {type: 'string', default: '', description: 'Text'},
	start: {
		type: 'number',
		default: 0,
		hiddenFromList: false,
		description: 'Start frame',
	},
	charsPerFrame: {
		type: 'number',
		default: 1,
		min: 0.1,
		hiddenFromList: false,
		description: 'Characters per frame',
	},
	cursorColor: {type: 'color', default: '#F3EFE6', description: 'Cursor color'},
} as const satisfies InteractivitySchema;

export const Typewriter = Interactive.withSchema({
	Component: TypewriterInner,
	componentName: '<Typewriter>',
	schema: typewriterSchema,
	wrapInSequence: true,
});
