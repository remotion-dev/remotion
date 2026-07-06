import type {ScriptLine} from '@remotion/studio-shared';
import React from 'react';
import {HORIZONTAL_SCROLLBAR_CLASSNAME} from '../../components/Menu/is-menu-item';
import {
	BLACK,
	BLUE,
	ERROR_CODE_FRAME_BACKGROUND,
	ERROR_CODE_FRAME_LINE_BACKGROUND,
	TRANSPARENT,
	WHITE,
	WHITE_ALPHA_60,
} from '../../helpers/colors';

const container: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	width: '100%',
};

const frame: React.CSSProperties = {
	backgroundColor: ERROR_CODE_FRAME_BACKGROUND,
	marginBottom: 20,
	overflowY: 'auto',
};

const lineNumber: React.CSSProperties = {
	whiteSpace: 'pre',
	paddingRight: 12,
	color: 'inherit',
	fontSize: 14,
	lineHeight: 1.7,
	width: 60,
	flexShrink: 0,
	display: 'inline-flex',
	alignItems: 'center',
	justifyContent: 'flex-end',
	fontFamily: 'monospace',
};

export const CodeFrame: React.FC<{
	readonly source: ScriptLine[];
	readonly lineNumberWidth: number;
}> = ({source, lineNumberWidth}) => {
	return (
		<div style={frame} className={HORIZONTAL_SCROLLBAR_CLASSNAME}>
			{source.map((s, j) => {
				return (
					<div
						// eslint-disable-next-line react/no-array-index-key
						key={j}
						style={container}
					>
						<div
							style={{
								...lineNumber,
								backgroundColor: s.highlight
									? WHITE
									: ERROR_CODE_FRAME_LINE_BACKGROUND,
								color: s.highlight ? BLACK : WHITE_ALPHA_60,
							}}
						>
							{String(s.lineNumber).padStart(lineNumberWidth, ' ')}
						</div>
						<div
							style={{
								fontFamily: 'monospace',
								whiteSpace: 'pre',
								tabSize: 2,
								color: s.highlight ? WHITE : WHITE_ALPHA_60,
								backgroundColor: s.highlight ? BLUE : TRANSPARENT,
								lineHeight: 1.7,
								paddingRight: 12,
								paddingLeft: 12,
							}}
						>
							{s.content}
						</div>
					</div>
				);
			})}
		</div>
	);
};
