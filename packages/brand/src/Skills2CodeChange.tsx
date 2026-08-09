import {burlap} from '@remotion/effects/burlap';
import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {
	AbsoluteFill,
	Easing,
	Interactive,
	interpolate,
	interpolateColors,
	Solid,
	useCurrentFrame,
	useCurrentScale,
	useDelayRender,
	useVideoConfig,
} from 'remotion';

const codeBefore = `const progress =
  spring({fps, frame, durationInFrames: 20, config: {damping: 200}}) -
  spring({
    fps,
    frame,
    delay: durationInFrames - 20,
    durationInFrames: 20,
    config: {damping: 200},
  });

return (
  <div style={{
    translate: interpolate(progress, [0, 1], [0, 200]),
  }} />
);`;

const codeAfter = `return (
  <div style={{
    translate: interpolate(
      frame,
      [0, 20, durationInFrames - 20, durationInFrames],
      [0, 200, 200, 0],
      {
        easing: Easing.spring({damping: 200}),
      },
    ),
  }} />
);`;

type TokenKind =
	| 'whitespace'
	| 'keyword'
	| 'function'
	| 'number'
	| 'string'
	| 'tag'
	| 'attribute'
	| 'variable'
	| 'identifier'
	| 'operator'
	| 'punctuation'
	| 'comment';

type CodeToken = {
	readonly id: string;
	readonly value: string;
	readonly kind: TokenKind;
	readonly color: string;
	readonly visibleIndex: number | null;
};

type VisibleToken = CodeToken & {
	readonly visibleIndex: number;
};

type TokenizedCode = {
	readonly stream: CodeToken[];
	readonly visible: VisibleToken[];
};

type TokenPosition = {
	readonly x: number;
	readonly y: number;
};

type CodeLayouts = {
	readonly before: TokenPosition[];
	readonly after: TokenPosition[];
};

const getTokenColor = (kind: TokenKind) => {
	if (kind === 'keyword' || kind === 'operator') {
		return '#cf222e';
	}

	if (kind === 'function') {
		return '#8250df';
	}

	if (kind === 'number' || kind === 'variable' || kind === 'attribute') {
		return '#0550ae';
	}

	if (kind === 'string') {
		return '#0a3069';
	}

	if (kind === 'tag') {
		return '#116329';
	}

	if (kind === 'comment') {
		return '#6e7781';
	}

	if (kind === 'identifier') {
		return '#57606a';
	}

	return '#24292f';
};

const tokenizeCode = (code: string): TokenizedCode => {
	const stream: CodeToken[] = [];
	const visible: VisibleToken[] = [];
	let cursor = 0;

	while (cursor < code.length) {
		const remaining = code.slice(cursor);
		const whitespace = remaining.match(/^\s+/)?.[0];
		const comment = remaining.match(/^(?:\/\/[^\n]*|\/\*[\s\S]*?\*\/)/)?.[0];
		const string = remaining.match(
			/^(?:'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`)/,
		)?.[0];
		const number = remaining.match(/^\d+(?:\.\d+)?/)?.[0];
		const identifier = remaining.match(/^[A-Za-z_$][\w$]*/)?.[0];
		const operator = remaining.match(
			/^(?:=>|===|!==|==|!=|<=|>=|\+\+|--|&&|\|\||\?\?|[+\-*%=!&|?])/,
		)?.[0];
		const punctuation = remaining.match(/^[{}()[\].,;:<>/]/)?.[0];

		let value = remaining[0];
		let kind: TokenKind = 'punctuation';

		if (whitespace) {
			value = whitespace;
			kind = 'whitespace';
		} else if (comment) {
			value = comment;
			kind = 'comment';
		} else if (string) {
			value = string;
			kind = 'string';
		} else if (number) {
			value = number;
			kind = 'number';
		} else if (identifier) {
			value = identifier;
			if (['const', 'return'].includes(identifier)) {
				kind = 'keyword';
			} else if (['spring', 'interpolate'].includes(identifier)) {
				kind = 'function';
			} else if (identifier === 'div') {
				kind = 'tag';
			} else if (identifier === 'style') {
				kind = 'attribute';
			} else if (identifier === 'progress') {
				kind = 'variable';
			} else {
				kind = 'identifier';
			}
		} else if (operator) {
			value = operator;
			kind = 'operator';
		} else if (punctuation) {
			value = punctuation;
		}

		if (kind === 'whitespace') {
			stream.push({
				id: `${cursor}-${value}`,
				value,
				kind,
				color: getTokenColor(kind),
				visibleIndex: null,
			});
		} else {
			const token: VisibleToken = {
				id: `${cursor}-${value}`,
				value,
				kind,
				color: getTokenColor(kind),
				visibleIndex: visible.length,
			};
			stream.push(token);
			visible.push(token);
		}

		cursor += value.length;
	}

	return {stream, visible};
};

const matchTokens = (
	before: VisibleToken[],
	after: VisibleToken[],
): [number, number][] => {
	const lengths = Array.from({length: before.length + 1}, () =>
		Array<number>(after.length + 1).fill(0),
	);

	for (let row = before.length - 1; row >= 0; row--) {
		for (let column = after.length - 1; column >= 0; column--) {
			const tokensMatch =
				before[row].kind === after[column].kind &&
				before[row].value === after[column].value;
			lengths[row][column] = tokensMatch
				? lengths[row + 1][column + 1] + 1
				: Math.max(lengths[row + 1][column], lengths[row][column + 1]);
		}
	}

	const matches: [number, number][] = [];
	let beforeIndex = 0;
	let afterIndex = 0;
	while (beforeIndex < before.length && afterIndex < after.length) {
		const tokensMatch =
			before[beforeIndex].kind === after[afterIndex].kind &&
			before[beforeIndex].value === after[afterIndex].value;
		if (tokensMatch) {
			matches.push([beforeIndex, afterIndex]);
			beforeIndex++;
			afterIndex++;
		} else if (
			lengths[beforeIndex + 1][afterIndex] >=
			lengths[beforeIndex][afterIndex + 1]
		) {
			beforeIndex++;
		} else {
			afterIndex++;
		}
	}

	return matches;
};

const renderTokenStream = (tokens: CodeToken[], prefix: string) => {
	return tokens.map((token) => {
		if (token.visibleIndex === null) {
			return (
				<React.Fragment key={`${prefix}-${token.id}`}>
					{token.value}
				</React.Fragment>
			);
		}

		return (
			<span
				key={`${prefix}-${token.id}`}
				data-token-index={token.visibleIndex}
				style={{color: token.color}}
			>
				{token.value}
			</span>
		);
	});
};

const beforeCode = tokenizeCode(codeBefore);
const afterCode = tokenizeCode(codeAfter);
const tokenMatches = matchTokens(beforeCode.visible, afterCode.visible);
const afterIndexByBeforeIndex = new Map(tokenMatches);
const matchedAfterIndexes = new Set(
	tokenMatches.map(([, afterIndex]) => afterIndex),
);

export const Skills2CodeChange: React.FC = () => {
	const frame = useCurrentFrame();
	const scale = useCurrentScale();
	const {height} = useVideoConfig();
	const beforeMeasurementRef = useRef<HTMLPreElement>(null);
	const afterMeasurementRef = useRef<HTMLPreElement>(null);
	const [layouts, setLayouts] = useState<CodeLayouts | null>(null);
	const {delayRender, continueRender} = useDelayRender();
	const [handle] = useState(() =>
		delayRender('Measuring code token positions'),
	);
	const hasContinued = useRef(false);

	useLayoutEffect(() => {
		if (!beforeMeasurementRef.current || !afterMeasurementRef.current) {
			return;
		}

		const measure = (
			pre: HTMLPreElement,
			tokenCount: number,
		): TokenPosition[] => {
			const preBounds = pre.getBoundingClientRect();
			const verticalOffset = (height - preBounds.height / scale) / 2;
			const positions = Array.from({length: tokenCount}, () => ({x: 0, y: 0}));
			const elements = pre.querySelectorAll<HTMLElement>('[data-token-index]');

			elements.forEach((element) => {
				const index = Number(element.dataset.tokenIndex);
				const bounds = element.getBoundingClientRect();
				positions[index] = {
					x: (bounds.left - preBounds.left) / scale,
					y: verticalOffset + (bounds.top - preBounds.top) / scale,
				};
			});

			return positions;
		};

		setLayouts({
			before: measure(beforeMeasurementRef.current, beforeCode.visible.length),
			after: measure(afterMeasurementRef.current, afterCode.visible.length),
		});
	}, [height, scale]);

	useEffect(() => {
		if (layouts && !hasContinued.current) {
			hasContinued.current = true;
			continueRender(handle);
		}
	}, [continueRender, handle, layouts]);

	return (
		<AbsoluteFill style={{backgroundColor: '#f5fafb'}}>
			<Solid
				width={1920}
				height={1080}
				color="#f5fafb"
				style={{position: 'absolute'}}
				effects={[
					burlap({
						size: 10,
						roughness: 0,
						color: '#e9e9e9',
					}),
				]}
			/>
			<Interactive.Div
				name="Code"
				style={{
					position: 'absolute',
					left: 148,
					top: 0,
					right: 148,
					bottom: 0,
					fontFamily:
						'SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace',
					fontSize: 38,
					lineHeight: 1.35,
					tabSize: 2,
				}}
			>
				<pre
					ref={beforeMeasurementRef}
					aria-hidden="true"
					style={{
						position: 'absolute',
						left: 0,
						top: 0,
						width: 'max-content',
						margin: 0,
						font: 'inherit',
						lineHeight: 'inherit',
						whiteSpace: 'pre',
						visibility: 'hidden',
						pointerEvents: 'none',
					}}
				>
					{renderTokenStream(beforeCode.stream, 'before')}
				</pre>
				<pre
					ref={afterMeasurementRef}
					aria-hidden="true"
					style={{
						position: 'absolute',
						left: 0,
						top: 0,
						width: 'max-content',
						margin: 0,
						font: 'inherit',
						lineHeight: 'inherit',
						whiteSpace: 'pre',
						visibility: 'hidden',
						pointerEvents: 'none',
					}}
				>
					{renderTokenStream(afterCode.stream, 'after')}
				</pre>

				{layouts
					? beforeCode.visible.map((token, beforeIndex) => {
							const beforePosition = layouts.before[beforeIndex];
							const afterIndex = afterIndexByBeforeIndex.get(beforeIndex);

							if (afterIndex === undefined) {
								return (
									<span
										key={`removed-${token.id}`}
										style={{
											position: 'absolute',
											left: 0,
											top: 0,
											display: 'inline-block',
											whiteSpace: 'pre',
											color: token.color,
											opacity: interpolate(frame, [90, 108], [1, 0], {
												easing: Easing.bezier(0.4, 0, 1, 1),
												extrapolateLeft: 'clamp',
												extrapolateRight: 'clamp',
											}),
											translate: `${beforePosition.x}px ${beforePosition.y}px`,
										}}
									>
										{token.value}
									</span>
								);
							}

							const afterToken = afterCode.visible[afterIndex];
							const afterPosition = layouts.after[afterIndex];
							return (
								<span
									key={`matched-${token.id}-${afterToken.id}`}
									style={{
										position: 'absolute',
										left: 0,
										top: 0,
										display: 'inline-block',
										whiteSpace: 'pre',
										color:
											token.color === afterToken.color
												? token.color
												: interpolateColors(
														frame,
														[108, 126],
														[token.color, afterToken.color],
													),
										translate: `${interpolate(
											frame,
											[108, 126],
											[beforePosition.x, afterPosition.x],
											{
												easing: Easing.spring({damping: 200}),
												extrapolateLeft: 'clamp',
												extrapolateRight: 'clamp',
											},
										)}px ${interpolate(
											frame,
											[108, 126],
											[beforePosition.y, afterPosition.y],
											{
												easing: Easing.spring({damping: 200}),
												extrapolateLeft: 'clamp',
												extrapolateRight: 'clamp',
											},
										)}px`,
									}}
								>
									{token.value}
								</span>
							);
						})
					: null}

				{layouts
					? afterCode.visible.map((token, afterIndex) => {
							if (matchedAfterIndexes.has(afterIndex)) {
								return null;
							}

							const afterPosition = layouts.after[afterIndex];
							return (
								<span
									key={`added-${token.id}`}
									style={{
										position: 'absolute',
										left: 0,
										top: 0,
										display: 'inline-block',
										whiteSpace: 'pre',
										color: token.color,
										opacity: interpolate(frame, [126, 144], [0, 1], {
											easing: Easing.bezier(0, 0, 0.2, 1),
											extrapolateLeft: 'clamp',
											extrapolateRight: 'clamp',
										}),
										translate: `${afterPosition.x}px ${afterPosition.y}px`,
									}}
								>
									{token.value}
								</span>
							);
						})
					: null}
			</Interactive.Div>
		</AbsoluteFill>
	);
};
