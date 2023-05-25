import React from 'react';
import type {ScriptLine} from '../react-overlay/utils/stack-frame';

const container: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
};

const frame: React.CSSProperties = {
	backgroundColor: '#070707',
	marginBottom: 20,
	overflowY: 'auto',
};

const lineNumber: React.CSSProperties = {
	whiteSpace: 'pre',
	marginRight: 6,
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
	source: ScriptLine[];
	lineNumberWidth: number;
}> = ({source, lineNumberWidth}) => {
	return (
		<div style={frame}>
			{source.map((s, j) => {
				return (
					<div
						// eslint-disable-next-line react/no-array-index-key
						key={j}
						style={{
							...container,
							fontFamily: 'monospace',
							whiteSpace: 'pre',
							tabSize: 2,
							color: s.highlight ? 'white' : 'rgba(255, 255, 255, 0.6)',
							backgroundColor: s.highlight ? 'var(--blue)' : 'transparent',
							lineHeight: 1.7,
						}}
					>
						<div
							style={{
								...lineNumber,
								backgroundColor: s.highlight ? 'white' : '#121212',
								color: s.highlight ? 'black' : 'rgba(255, 255, 255, 0.6)',
							}}
						>
							{String(s.lineNumber).padStart(lineNumberWidth, ' ')}
						</div>
						{s.content}
					</div>
				);
			})}
		</div>
	);
};
