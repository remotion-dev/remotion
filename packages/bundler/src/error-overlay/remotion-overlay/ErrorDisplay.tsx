import React, {useMemo} from 'react';
import {ErrorRecord} from '../react-overlay/listen-to-runtime-errors';
import {AskOnDiscord} from './AskOnDiscord';
import {OpenInEditor} from './OpenInEditor';
import {SearchGithubIssues} from './SearchGitHubIssues';
import {StackElement} from './StackFrame';
import {DismissButton} from './DismissButton';
import {getLocationFromBuildError} from '../react-overlay/effects/map-error-to-react-stack';

const container: React.CSSProperties = {
	width: '100%',
	maxWidth: 1000,
	paddingLeft: 14,
	paddingRight: 14,
	marginLeft: 'auto',
	marginRight: 'auto',
	fontFamily: 'SF Pro Text, sans-serif',
	paddingTop: '5vh',
};

const title: React.CSSProperties = {
	marginBottom: 8,
	display: 'flex',
	flexDirection: 'row',
	justifyContent: 'center',
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

const spacer: React.CSSProperties = {
	width: 5,
	display: 'inline-block',
};

const left: React.CSSProperties = {
	flex: 1,
	paddingRight: 14,
	lineHeight: 1.5,
	whiteSpace: 'pre',
	fontSize: '1.5em',
	fontWeight: 'bold',
	overflowX: 'auto',
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

	const message = useMemo(() => {
		// Format compilation errors
		const location = getLocationFromBuildError(display.error);
		if (!location) {
			return display.error.message;
		}

		return location.message
			.replace(/\\n/g, '\n')
			.replace(/\\t/g, '  ')
			.replace(/^error:/, '')
			.trim();
	}, [display.error]);

	const lineNumberWidth = String(highestLineNumber).length;

	return (
		<div style={container}>
			<div style={title}>
				<div style={left}>
					<span style={errName}>
						{display.type === 'syntax' ? 'Syntax error' : display.error.name}
					</span>
					<br />
					{message}
				</div>
				{display.type === 'exception' ? <DismissButton /> : null}
			</div>
			{display.stackFrames.length > 0 && window.remotion_editorName ? (
				<>
					<OpenInEditor stack={display.stackFrames[0]} />
					<div style={spacer} />
				</>
			) : null}
			<SearchGithubIssues message={display.error.message} />
			<div style={spacer} />
			<AskOnDiscord />
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
