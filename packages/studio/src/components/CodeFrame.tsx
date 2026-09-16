import type {ScriptLine} from '@remotion/studio-shared';
import React from 'react';
import {
	ERROR_CODE_FRAME_BACKGROUND,
	ERROR_CODE_FRAME_LINE_BACKGROUND,
	SELECTED_BACKGROUND,
	TRANSPARENT,
	WHITE,
	WHITE_ALPHA_40,
} from '../helpers/colors';
import {LazySyntaxHighlightedSource} from './LazySyntaxHighlightedSource';
import {HORIZONTAL_SCROLLBAR_CLASSNAME} from './Menu/is-menu-item';

const frame: React.CSSProperties = {
	backgroundColor: ERROR_CODE_FRAME_BACKGROUND,
	borderRadius: 6,
	display: 'flex',
	marginBottom: 20,
	overflow: 'hidden',
};

const sourceContainer: React.CSSProperties = {
	flex: 1,
	minWidth: 0,
	overflowX: 'auto',
	overscrollBehaviorX: 'none',
};

const lineNumberColumn: React.CSSProperties = {
	flexShrink: 0,
	width: 60,
};

const lineNumber: React.CSSProperties = {
	whiteSpace: 'pre',
	paddingRight: 12,
	color: 'inherit',
	lineHeight: 1.7,
	width: 60,
	flexShrink: 0,
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'flex-end',
	fontFamily: 'monospace',
};

export const CodeFrame: React.FC<{
	readonly source: ScriptLine[];
	readonly lineNumberWidth: number;
	readonly fontSize: number;
	readonly horizontalMargin: number;
}> = ({source, lineNumberWidth, fontSize, horizontalMargin}) => {
	return (
		<div
			style={{
				...frame,
				marginLeft: horizontalMargin,
				marginRight: horizontalMargin,
			}}
		>
			<div style={lineNumberColumn}>
				{source.map((s, j) => {
					return (
						<div
							// eslint-disable-next-line react/no-array-index-key
							key={j}
							style={{
								...lineNumber,
								fontSize,
								backgroundColor: s.highlight
									? ERROR_CODE_FRAME_BACKGROUND
									: ERROR_CODE_FRAME_LINE_BACKGROUND,
								backgroundImage: s.highlight
									? `linear-gradient(${SELECTED_BACKGROUND}, ${SELECTED_BACKGROUND})`
									: undefined,
								color: s.highlight ? WHITE : WHITE_ALPHA_40,
							}}
						>
							{String(s.lineNumber).padStart(lineNumberWidth, ' ')}
						</div>
					);
				})}
			</div>
			<div style={sourceContainer} className={HORIZONTAL_SCROLLBAR_CLASSNAME}>
				{/* Keep every row as wide as the longest line when scrolling. */}
				<div style={{minWidth: '100%', width: 'max-content'}}>
					{source.map((s, j) => {
						return (
							<div
								// eslint-disable-next-line react/no-array-index-key
								key={j}
								style={{
									backgroundColor: s.highlight
										? SELECTED_BACKGROUND
										: TRANSPARENT,
								}}
							>
								<code
									className="language-tsx"
									style={{
										display: 'block',
										fontFamily: 'monospace',
										fontSize,
										color: '#9cdcfe',
										whiteSpace: 'pre',
										tabSize: 2,
										backgroundColor: TRANSPARENT,
										lineHeight: 1.7,
										paddingRight: 12,
										paddingLeft: 12,
										paddingTop: 0,
										paddingBottom: 0,
									}}
								>
									<LazySyntaxHighlightedSource source={s.content} />
								</code>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
};
