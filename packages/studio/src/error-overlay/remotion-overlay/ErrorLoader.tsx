import {getLocationFromBuildError} from '@remotion/studio-shared';
import React, {useEffect, useState} from 'react';
import {WHITE} from '../../helpers/colors';
import {wasErrorLoggedByServer} from '../error-origin';
import type {ErrorRecord} from '../react-overlay/listen-to-runtime-errors';
import {getErrorRecord} from '../react-overlay/listen-to-runtime-errors';
import type {OnRetry} from './ErrorDisplay';
import {ErrorDisplay} from './ErrorDisplay';
import {ErrorTitle} from './ErrorTitle';
import {logStudioError, logStudioErrorData} from './log-studio-error';

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

const errorWhileErrorStyle: React.CSSProperties = {
	color: WHITE,
	lineHeight: 1.5,
	whiteSpace: 'pre',
};

const errorWhileSymbolicatingStyle: React.CSSProperties = {
	color: WHITE,
	lineHeight: 1.5,
	marginTop: 24,
	opacity: 0.7,
};

type State =
	| {
			type: 'loading';
	  }
	| {
			type: 'symbolicated';
			record: ErrorRecord;
	  }
	| {
			type: 'no-record';
	  }
	| {
			type: 'error';
			err: Error;
	  };

const shouldLogError = (error: Error) => {
	return (
		!wasErrorLoggedByServer(error) && getLocationFromBuildError(error) === null
	);
};

const shouldIncludeFrameInServerLog = (
	frame: ErrorRecord['stackFrames'][number],
) => {
	return !(
		frame.originalFileName?.includes('node_modules') ||
		frame.originalFileName?.startsWith('webpack/') ||
		frame.originalFileName?.includes('/bundler/dist/fast-refresh/') ||
		frame.originalFileName?.includes('bundler/dist/fast-refresh/')
	);
};

const logSymbolicatedStudioError = (record: ErrorRecord) => {
	const name = typeof record.error.name === 'string' ? record.error.name : null;
	const message =
		typeof record.error.message === 'string' ? record.error.message : '';
	const filteredStackFrames = record.stackFrames.filter(
		shouldIncludeFrameInServerLog,
	);
	const stackFrames =
		filteredStackFrames.length > 0
			? filteredStackFrames
			: record.stackFrames[0]
				? [record.stackFrames[0]]
				: [];

	logStudioErrorData({
		name,
		message,
		stack: typeof record.error.stack === 'string' ? record.error.stack : null,
		symbolicatedStackFrames: stackFrames.length > 0 ? stackFrames : null,
	});
};

export const ErrorLoader: React.FC<{
	readonly error: Error;
	readonly keyboardShortcuts: boolean;
	readonly onRetry: OnRetry;
	readonly canHaveDismissButton: boolean;
	readonly calculateMetadata: boolean;
}> = ({
	error,
	keyboardShortcuts,
	onRetry,
	canHaveDismissButton,
	calculateMetadata,
}) => {
	const [state, setState] = useState<State>({
		type: 'loading',
	});

	useEffect(() => {
		getErrorRecord(error)
			.then((record) => {
				if (record) {
					if (shouldLogError(error)) {
						logSymbolicatedStudioError(record);
					}

					setState({
						type: 'symbolicated',
						record,
					});
				} else {
					if (shouldLogError(error)) {
						logStudioError(error);
					}

					setState({
						type: 'no-record',
					});
				}
			})
			.catch((err) => {
				if (shouldLogError(error)) {
					logStudioError(error);
				}

				setState({
					err,
					type: 'error',
				});
			});
	}, [error]);

	if (state.type === 'loading') {
		return (
			<div style={container}>
				<ErrorTitle
					symbolicating
					name={error.name}
					message={error.message}
					canHaveDismissButton={canHaveDismissButton}
				/>
			</div>
		);
	}

	if (state.type === 'error') {
		return (
			<div style={container}>
				<ErrorTitle
					symbolicating={false}
					name={error.name}
					message={error.message}
					canHaveDismissButton={canHaveDismissButton}
				/>
				<div style={errorWhileErrorStyle}>
					{error.stack ??
						'Check the Terminal and browser console for error messages.'}
				</div>
				<div style={errorWhileSymbolicatingStyle}>
					Could not symbolicate the stack trace: {state.err.message}
				</div>
			</div>
		);
	}

	if (state.type === 'no-record') {
		return (
			<div style={container}>
				<ErrorTitle
					symbolicating={false}
					name={error.name}
					message={error.message}
					canHaveDismissButton={canHaveDismissButton}
				/>
				<div style={errorWhileErrorStyle}>
					Check the Terminal and browser console for error messages.
				</div>
			</div>
		);
	}

	return (
		<div style={container}>
			<ErrorDisplay
				keyboardShortcuts={keyboardShortcuts}
				display={state.record}
				onRetry={onRetry}
				canHaveDismissButton={canHaveDismissButton}
				calculateMetadata={calculateMetadata}
			/>
		</div>
	);
};
