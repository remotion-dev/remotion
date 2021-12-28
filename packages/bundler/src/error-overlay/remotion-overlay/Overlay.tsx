import React, {createRef, useImperativeHandle, useState} from 'react';
import {AbsoluteFill} from 'remotion';
import {ErrorRecord} from '../react-overlay/listen-to-runtime-errors';
import {ErrorDisplay} from './ErrorDisplay';

type SetErrors = {
	setErrors: (errs: State) => void;
};

export const setErrorsRef = createRef<SetErrors>();

type State =
	| {
			type: 'clear';
	  }
	| {
			type: 'symbolicating';
	  }
	| {
			type: 'errors';
			errors: ErrorRecord[];
	  };

const BACKGROUND_COLOR = '#1f2428';
export const Overlay: React.FC = () => {
	const [errors, setErrors] = useState<State>({type: 'clear'});

	useImperativeHandle(
		setErrorsRef,
		() => {
			return {setErrors};
		},
		[]
	);

	if (errors.type === 'clear') {
		return null;
	}

	if (errors.type === 'symbolicating') {
		return (
			<AbsoluteFill
				style={{
					backgroundColor: BACKGROUND_COLOR,
				}}
			/>
		);
	}

	if (errors.errors.length === 0) {
		return null;
	}

	return (
		<AbsoluteFill
			style={{
				backgroundColor: BACKGROUND_COLOR,
				overflow: 'auto',
				color: 'white',
			}}
		>
			{errors.errors.map((err) => {
				return <ErrorDisplay key={err.error.stack} display={err} />;
			})}
		</AbsoluteFill>
	);
};
