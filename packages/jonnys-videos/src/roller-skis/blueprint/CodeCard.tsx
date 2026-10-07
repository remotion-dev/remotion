import {loadFont} from '@remotion/google-fonts/JetBrainsMono';
import type React from 'react';
import {
	Interactive,
	type InteractivitySchema,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

const {fontFamily} = loadFont('normal', {
	weights: ['700'],
	subsets: ['latin'],
});

// JetBrains Mono advances every glyph by 0.6 em.
const ADVANCE = 0.6;

type CodeCardProps = {
	readonly header: string;
	readonly line1: string;
	readonly line2: string;
	readonly line3: string;
	readonly line4: string;
	readonly typeSeconds: number;
	readonly color: string;
	readonly tint: string;
	readonly fontSize: number;
	readonly lineSpacing: number;
	readonly style?: React.CSSProperties;
};

/** A code-comment info block that types on with a block cursor. */
const CodeCardInner: React.FC<CodeCardProps> = ({
	header,
	line1,
	line2,
	line3,
	line4,
	typeSeconds,
	color,
	tint,
	fontSize,
	lineSpacing,
	style,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const t = frame / fps;
	const lines = [header, line1, line2, line3, line4];
	const total = lines.reduce((sum, line) => sum + line.length, 0);
	const typed = Math.floor(Math.max(0, Math.min(1, t / typeSeconds)) * total);

	let remaining = typed;
	let active = lines.length - 1;
	let activeChars = lines[active].length;
	for (let i = 0; i < lines.length; i++) {
		if (remaining < lines[i].length) {
			active = i;
			activeChars = remaining;
			break;
		}
		remaining -= lines[i].length;
	}
	const done = typed >= total;
	const cursorVisible = !done || Math.floor((t - typeSeconds) * 2) % 2 === 0;
	const cursorHeight = fontSize * 1.09;

	let before = 0;
	return (
		<div
			style={{
				position: 'absolute',
				fontFamily,
				fontWeight: 700,
				fontSize,
				lineHeight: `${lineSpacing}px`,
				color,
				whiteSpace: 'pre',
				fontVariantLigatures: 'none',
				...style,
			}}
		>
			{lines.map((line, i) => {
				const shown = Math.max(0, Math.min(line.length, typed - before));
				before += line.length;
				const text = line.slice(0, shown);
				const numbered = i > 0 && /^\d\d/.test(line);
				return (
					<div key={i} style={{height: lineSpacing}}>
						{numbered ? (
							<>
								<span style={{color: tint}}>{text.slice(0, 2)}</span>
								{text.slice(2)}
							</>
						) : (
							text
						)}
					</div>
				);
			})}
			<div
				style={{
					position: 'absolute',
					left: activeChars * fontSize * ADVANCE + 2,
					top: active * lineSpacing + (lineSpacing - cursorHeight) / 2,
					width: fontSize * 0.565,
					height: cursorHeight,
					backgroundColor: color,
					opacity: cursorVisible ? 1 : 0,
				}}
			/>
		</div>
	);
};

const codeCardSchema = {
	header: {
		type: 'string',
		default: '// ski.system',
		description: 'Header',
	},
	line1: {type: 'string', default: '', description: 'Line 01'},
	line2: {type: 'string', default: '', description: 'Line 02'},
	line3: {type: 'string', default: '', description: 'Line 03'},
	line4: {type: 'string', default: '', description: 'Line 04'},
	typeSeconds: {
		type: 'number',
		default: 1.5,
		min: 0.1,
		step: 0.05,
		description: 'Typing duration (s)',
		hiddenFromList: false,
	},
	color: {type: 'color', default: '#1F4FD8', description: 'Text color'},
	tint: {type: 'color', default: '#91A9EC', description: 'Line number tint'},
	fontSize: {
		type: 'number',
		default: 23,
		min: 8,
		step: 1,
		description: 'Font size',
		hiddenFromList: false,
	},
	lineSpacing: {
		type: 'number',
		default: 42,
		min: 10,
		step: 1,
		description: 'Line spacing',
		hiddenFromList: false,
	},
} as const satisfies InteractivitySchema;

export const CodeCard = Interactive.withSchema({
	Component: CodeCardInner,
	componentName: '<CodeCard>',
	schema: codeCardSchema,
	wrapInSequence: true,
});
