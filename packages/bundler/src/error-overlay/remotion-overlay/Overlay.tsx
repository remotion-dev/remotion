import React, {
	createRef,
	useCallback,
	useImperativeHandle,
	useState,
} from 'react';
import {AbsoluteFill} from 'remotion';
import {ErrorRecord} from '../react-overlay/listen-to-runtime-errors';
import {Button} from './Button';
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
const ICON_SIZE = 40;
const rotate: React.CSSProperties = {
	transform: `rotate(90deg)`,
};
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
					overflow: 'auto',
					justifyContent: 'center',
					alignItems: 'center',
				}}
			>
				<svg
					width={ICON_SIZE}
					height={ICON_SIZE}
					viewBox="-100 -100 400 400"
					style={rotate}
				>
					<path
						fill="#555"
						stroke="#555"
						strokeWidth="100"
						strokeLinejoin="round"
						d="M 2 172 a 196 100 0 0 0 195 5 A 196 240 0 0 0 100 2.259 A 196 240 0 0 0 2 172 z"
					/>
				</svg>{' '}
			</AbsoluteFill>
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
