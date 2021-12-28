import React from 'react';
import {ErrorRecord} from '../react-overlay/listen-to-runtime-errors';
import {StackElement} from './StackFrame';

const container: React.CSSProperties = {
	width: '100%',
	maxWidth: 1000,
	marginLeft: 'auto',
	marginRight: 'auto',
	fontFamily: 'SF Pro Text, sans-serif',
	paddingTop: '5vh',
};

const title: React.CSSProperties = {
	fontSize: '1.5em',
	fontWeight: 'bold',
	lineHeight: 1.5,
};

const errName: React.CSSProperties = {
	fontSize: '0.8em',
	background: 'linear-gradient(90deg,#4290f5,#42e9f5)',
	WebkitBackgroundClip: 'text',
	WebkitTextFillColor: 'transparent',
	display: 'inline-block',
};

const stack: React.CSSProperties = {
	marginTop: 17,
	overflowX: 'scroll',
	marginBottom: '10vh',
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
				<span style={errName}>{display.error.name}</span>
				<br />
				{display.error.message}
			</div>
			<div style={stack}>
				{display.stackFrames.map((s, i) => {
					return (
						<StackElement
							// eslint-disable-next-line react/no-array-index-key
							key={i}
							isFirst={i === 0}
							s={s}
							lineNumberWidth={lineNumberWidth}
						/>
					);
				})}
			</div>
		</div>
	);
};
