import React, {useMemo} from 'react';
import {getLocationFromBuildError} from '../react-overlay/effects/map-error-to-react-stack';
import type {ErrorRecord} from '../react-overlay/listen-to-runtime-errors';
import {AskOnDiscord} from './AskOnDiscord';
import {ErrorTitle} from './ErrorTitle';
import {getHelpLink} from './get-help-link';
import {HelpLink} from './HelpLink';
import {OpenInEditor} from './OpenInEditor';
import {SearchGithubIssues} from './SearchGitHubIssues';
import {StackElement} from './StackFrame';

const stack: React.CSSProperties = {
	marginTop: 17,
	overflowX: 'scroll',
	marginBottom: '10vh',
};

const spacer: React.CSSProperties = {
	width: 5,
	display: 'inline-block',
};

export const ErrorDisplay: React.FC<{
	display: ErrorRecord;
	keyboardShortcuts: boolean;
}> = ({display, keyboardShortcuts}) => {
	const highestLineNumber = Math.max(
		...display.stackFrames
			.map((s) => s.originalScriptCode)
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

	const helpLink = getHelpLink(message);

	return (
		<div>
			<ErrorTitle
				symbolicating={false}
				name={display.error.name}
				message={message}
			/>

			{helpLink ? (
				<>
					<HelpLink
						link={helpLink}
						canHaveKeyboardShortcuts={keyboardShortcuts}
					/>
					<div style={spacer} />
				</>
			) : null}
			{display.stackFrames.length > 0 && window.remotion_editorName ? (
				<>
					<OpenInEditor
						canHaveKeyboardShortcuts={keyboardShortcuts}
						stack={display.stackFrames[0]}
					/>
					<div style={spacer} />
				</>
			) : null}
			<SearchGithubIssues
				canHaveKeyboardShortcuts={keyboardShortcuts}
				message={display.error.message}
			/>
			<div style={spacer} />
			<AskOnDiscord canHaveKeyboardShortcuts={keyboardShortcuts} />
			<div style={stack}>
				{display.stackFrames.map((s, i) => {
					return (
						<StackElement
							// eslint-disable-next-line react/no-array-index-key
							key={i}
							isFirst={i === 0}
							s={s}
							lineNumberWidth={lineNumberWidth}
							defaultFunctionName={'(anonymous function)'}
						/>
					);
				})}
			</div>
		</div>
	);
};
