import React, {useEffect, useState} from 'react';
import type {ErrorRecord} from '../react-overlay/listen-to-runtime-errors';
import {getErrorRecord} from '../react-overlay/listen-to-runtime-errors';
import type {OnRetry} from './ErrorDisplay';
import {ErrorDisplay} from './ErrorDisplay';
import {ErrorTitle} from './ErrorTitle';

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
	color: 'white',
	lineHeight: 1.5,
	whiteSpace: 'pre',
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

export const ErrorLoader: React.FC<{
	error: Error;
	keyboardShortcuts: boolean;
	onRetry: OnRetry;
	canHaveDismissButton: boolean;
	calculateMetadata: boolean;
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
					setState({
						type: 'symbolicated',
						record,
					});
				} else {
					setState({
						type: 'no-record',
					});
				}
			})
			.catch((err) => {
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
				<div style={errorWhileErrorStyle}>Error while getting stack trace:</div>
				<div style={errorWhileErrorStyle}>{state.err.stack}</div>
				<div style={errorWhileErrorStyle}>
					Report this in the Remotion repo.
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
