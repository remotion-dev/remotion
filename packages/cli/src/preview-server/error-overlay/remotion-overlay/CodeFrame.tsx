import React from 'react';
import type {ScriptLine} from '../react-overlay/utils/stack-frame';

const frame: React.CSSProperties = {
	backgroundColor: '#070707',
	marginBottom: 20,
};

const lineNumber: React.CSSProperties = {
	display: 'inline-block',
	whiteSpace: 'pre',
	backgroundColor: '#121212',
	paddingLeft: 10,
	paddingRight: 12,
	marginRight: 12,
	color: 'inherit',
	fontSize: 14,
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
							fontFamily: 'monospace',
							whiteSpace: 'pre',
							tabSize: 2,
							color: s.highlight ? 'white' : 'rgba(255, 255, 255, 0.6)',
							lineHeight: 1.7,
						}}
					>
						<div style={lineNumber}>
							{String(s.lineNumber).padStart(lineNumberWidth, ' ')}
						</div>
						{s.content}
					</div>
				);
			})}
		</div>
	);
};
