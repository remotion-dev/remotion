import React, {createRef, useImperativeHandle, useState} from 'react';
import {AbsoluteFill} from 'remotion';
import {ErrorRecord} from '../react-overlay/listen-to-runtime-errors';
import {ErrorDisplay} from './ErrorDisplay';

type SetErrors = {
	setErrors: (errs: ErrorRecord[]) => void;
};

export const setErrorsRef = createRef<SetErrors>();

export const Overlay: React.FC = () => {
	const [errors, setErrors] = useState<ErrorRecord[]>([]);

	useImperativeHandle(
		setErrorsRef,
		() => {
			return {setErrors};
		},
		[]
	);

	if (errors.length === 0) {
		return null;
	}

	return (
		<AbsoluteFill
			style={{backgroundColor: '#1f2428', overflow: 'auto', color: 'white'}}
		>
			{errors.map((err) => {
				return <ErrorDisplay key={err.error.stack} display={err} />;
			})}
		</AbsoluteFill>
	);
};
