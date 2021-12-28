import React from 'react';
import {ErrorRecord} from '../react-overlay/listen-to-runtime-errors';
import {CodeFrame} from './CodeFrame';
import {formatLocation} from './format-location';

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
	overflowX: 'scroll',
};

const location: React.CSSProperties = {
	color: 'rgba(255, 255, 255, 0.6)',
	fontFamily: 'monospace',
};

const stackLine: React.CSSProperties = {};

const header: React.CSSProperties = {
	paddingLeft: 14,
	paddingTop: 8,
	paddingBottom: 8,
	paddingRight: 14,
};

export const ErrorDisplay: React.FC<{
	display: ErrorRecord;
}> = ({display}) => {
	const highestLineNumber = Math.max(
		...display.stackFrames
			.map((s) => s._originalScriptCode)
			.flat(1)
			.map((s) => s?.lineNumber ?? 0)
	);
	const lineNumberWidth = String(highestLineNumber).length;

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
							<div style={header}>
								<div>{s.functionName}</div>
								<div style={location}>
									{formatLocation(s._originalFileName as string)}:
									{s.columnNumber}
								</div>
							</div>
							<div>
								{s._originalScriptCode ? (
									<CodeFrame
										lineNumberWidth={lineNumberWidth}
										source={s._originalScriptCode}
									/>
								) : null}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};
