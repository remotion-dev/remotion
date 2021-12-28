import React from 'react';
import {ErrorRecord} from '../react-overlay/listen-to-runtime-errors';

const container: React.CSSProperties = {
	width: '100%',
	maxWidth: 1000,
	marginLeft: 'auto',
	marginRight: 'auto',
	fontFamily: 'sans-serif',
	paddingTop: '5vh',
};

const title: React.CSSProperties = {
	fontSize: '1.5em',
	fontWeight: 'bold',
};

const stack: React.CSSProperties = {
	backgroundColor: 'black',
	marginTop: 17,
};

const stackLine: React.CSSProperties = {
	paddingTop: 8,
	paddingBottom: 8,
	paddingLeft: 14,
	paddingRight: 14,
};

export const ErrorDisplay: React.FC<{
	display: ErrorRecord;
}> = ({display}) => {
	return (
		<div style={container}>
			<div style={title}>
				{display.error.name}: {display.error.message}
			</div>
			<div style={stack}>
				{display.stackFrames.map((s, i) => {
					return (
						// eslint-disable-next-line react/no-array-index-key
						<div key={i} style={stackLine}>
							<div>{s.functionName}</div>
							<div>
								{s._originalFileName}:{s.columnNumber}
							</div>
							<div>
								{s._originalScriptCode?.map((s, j) => {
									return (
										<div
											// eslint-disable-next-line react/no-array-index-key
											key={j}
											style={{
												fontFamily: 'monospace',
												whiteSpace: 'pre',
												tabSize: 2,
												color: s.highlight ? 'red' : 'inherit',
											}}
										>
											{s.content}
										</div>
									);
								})}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};
