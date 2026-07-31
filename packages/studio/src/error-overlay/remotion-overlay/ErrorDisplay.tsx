import {getLocationFromBuildError} from '@remotion/studio-shared';
import React, {useMemo} from 'react';
import {MediaPlaybackError} from 'remotion';
import {Spacing} from '../../components/layout';
import {HORIZONTAL_SCROLLBAR_CLASSNAME} from '../../components/Menu/is-menu-item';
import {
	ERROR_CODE_FRAME_BACKGROUND,
	WHITE,
	WHITE_ALPHA_60,
} from '../../helpers/colors';
import type {ErrorRecord} from '../react-overlay/listen-to-runtime-errors';
import {AskOnDiscord} from './AskOnDiscord';
import {CalculateMetadataErrorExplainer} from './CalculateMetadataErrorExplainer';
import {CopyStackTrace} from './CopyStackTrace';
import {ErrorTitle} from './ErrorTitle';
import {getHelpLink} from './get-help-link';
import {HelpLink} from './HelpLink';
import {MediaPlaybackErrorExplainer} from './MediaPlaybackErrorExplainer';
import {OpenInEditor} from './OpenInEditor';
import {RetryButton} from './Retry';
import {SearchGithubIssues} from './SearchGitHubIssues';
import {StackElement} from './StackFrame';

const stack: React.CSSProperties = {
	marginTop: 17,
	overflowX: 'scroll',
	marginBottom: '10vh',
};

const rawStack: React.CSSProperties = {
	backgroundColor: ERROR_CODE_FRAME_BACKGROUND,
	boxSizing: 'border-box',
	color: WHITE,
	fontFamily: 'monospace',
	fontSize: 14,
	lineHeight: 1.7,
	marginBottom: 0,
	marginTop: 17,
	maxWidth: '100%',
	overflowX: 'auto',
	padding: 12,
	whiteSpace: 'pre',
};

const symbolicationFailureStyle: React.CSSProperties = {
	color: WHITE_ALPHA_60,
	fontFamily: 'SF Pro Text, sans-serif',
	fontSize: 14,
	lineHeight: 1.5,
	marginBottom: '10vh',
	marginTop: 24,
};

const spacer: React.CSSProperties = {
	width: 5,
	display: 'inline-block',
};

export type OnRetry = null | (() => void);

export const ErrorDisplay: React.FC<{
	readonly display: ErrorRecord;
	readonly keyboardShortcuts: boolean;
	readonly onRetry: OnRetry;
	readonly canHaveDismissButton: boolean;
	readonly calculateMetadata: boolean;
	readonly symbolicationFailure: string | null;
}> = ({
	display,
	keyboardShortcuts,
	onRetry,
	canHaveDismissButton,
	calculateMetadata,
	symbolicationFailure,
}) => {
	const highestLineNumber = Math.max(
		0,
		...display.stackFrames
			.map((s) => s.originalScriptCode)
			.flat(1)
			.map((s) => s?.lineNumber ?? 0),
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

	const errorTextForCopy = useMemo(() => {
		const header = `${display.error.name}: ${message}`;

		if (display.stackFrames.length > 0) {
			const stackLines = display.stackFrames
				.map(
					(frame) =>
						`at ${frame.originalFunctionName || '<anonymous>'} (${frame.originalFileName || 'unknown'}:${frame.originalLineNumber || '?'}:${frame.originalColumnNumber || '?'})`,
				)
				.join('\n');
			return `${header}\n${stackLines}`;
		}

		return display.error.stack || header;
	}, [display.stackFrames, display.error, message]);

	return (
		<div>
			<ErrorTitle
				symbolicating={false}
				name={display.error.name}
				message={message}
				canHaveDismissButton={canHaveDismissButton}
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
			<CopyStackTrace errorText={errorTextForCopy} />
			<div style={spacer} />
			<SearchGithubIssues
				canHaveKeyboardShortcuts={keyboardShortcuts}
				message={display.error.message}
			/>
			<div style={spacer} />
			<AskOnDiscord canHaveKeyboardShortcuts={keyboardShortcuts} />
			{onRetry ? (
				<>
					<div style={spacer} />
					<RetryButton
						onClick={onRetry}
						label={calculateMetadata ? 'Retry calculateMetadata()' : 'Retry'}
					/>
				</>
			) : null}
			{calculateMetadata ? (
				<>
					<br />
					<Spacing y={0.5} />
					<CalculateMetadataErrorExplainer />
				</>
			) : null}
			{display.error instanceof MediaPlaybackError ? (
				<>
					<br />
					<Spacing y={0.5} />
					<MediaPlaybackErrorExplainer src={display.error.src} />
				</>
			) : null}
			{display.stackFrames.length > 0 ? (
				<div style={stack} className={HORIZONTAL_SCROLLBAR_CLASSNAME}>
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
			) : (
				<>
					<pre
						aria-label="Unsymbolicated stack trace"
						className={HORIZONTAL_SCROLLBAR_CLASSNAME}
						style={rawStack}
					>
						{display.error.stack ??
							'Check the Terminal and browser console for error messages.'}
					</pre>
					{symbolicationFailure ? (
						<div style={symbolicationFailureStyle}>{symbolicationFailure}</div>
					) : null}
				</>
			)}
		</div>
	);
};
