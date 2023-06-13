import React, {
	createRef,
	useCallback,
	useImperativeHandle,
	useState,
} from 'react';
import {AbsoluteFill} from 'remotion';
import {KeybindingContextProvider} from '../../../editor/state/keybindings';
import {ErrorLoader} from './ErrorLoader';

type SetErrors = {
	setErrors: (errs: State) => void;
	addError: (err: Error) => void;
};

export const setErrorsRef = createRef<SetErrors>();

type State =
	| {
			type: 'clear';
	  }
	| {
			type: 'errors';
			errors: Error[];
	  };

const errorsAreTheSame = (first: Error, second: Error) => {
	return first.stack === second.stack && first.message === second.message;
};

const BACKGROUND_COLOR = '#1f2428';
export const Overlay: React.FC = () => {
	const [errors, setErrors] = useState<State>({type: 'clear'});

	const addError = useCallback((err: Error) => {
		setErrors((state) => {
			if (state.type === 'errors') {
				if (state.errors.some((e) => errorsAreTheSame(e, err))) {
					return state;
				}

				return {
					...state,
					errors: [...state.errors, err],
				};
			}

			return {
				type: 'errors',
				errors: [err],
			};
		});
	}, []);

	useImperativeHandle(
		setErrorsRef,
		() => {
			return {setErrors, addError};
		},
		[addError]
	);

	if (errors.type === 'clear') {
		return null;
	}

	if (errors.errors.length === 0) {
		return null;
	}

	return (
		<KeybindingContextProvider>
			<AbsoluteFill
				style={{
					backgroundColor: BACKGROUND_COLOR,
					overflow: 'auto',
					color: 'white',
				}}
			>
				{errors.errors.map((err, i) => {
					return (
						<ErrorLoader
							key={err.stack}
							keyboardShortcuts={i === 0}
							error={err}
							onRetry={null}
							canHaveDismissButton
							calculateMetadata={false}
						/>
					);
				})}
			</AbsoluteFill>
		</KeybindingContextProvider>
	);
};
