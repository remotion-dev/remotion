import React, {
	createRef,
	useCallback,
	useImperativeHandle,
	useLayoutEffect,
	useState,
} from 'react';
import {AbsoluteFill} from 'remotion';
import {MENU_TOOLBAR_HEIGHT} from '../../components/MenuToolbar';
import {KeybindingContextProvider} from '../../state/keybindings';
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

const addErrorToState = (state: State, err: Error): State => {
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
};

let queuedErrorsBeforeOverlayMounted: Error[] = [];

const queueErrorBeforeOverlayMounted = (err: Error) => {
	if (queuedErrorsBeforeOverlayMounted.some((e) => errorsAreTheSame(e, err))) {
		return;
	}

	queuedErrorsBeforeOverlayMounted.push(err);
};

const takeQueuedErrorsBeforeOverlayMounted = () => {
	const queued = queuedErrorsBeforeOverlayMounted;
	queuedErrorsBeforeOverlayMounted = [];
	return queued;
};

export const addErrorToOverlay = (err: Error) => {
	if (setErrorsRef.current) {
		setErrorsRef.current.addError(err);
		return;
	}

	queueErrorBeforeOverlayMounted(err);
};

const BACKGROUND_COLOR = '#1f2428';
export const Overlay: React.FC = () => {
	const [errors, setErrorsState] = useState<State>(() => {
		return takeQueuedErrorsBeforeOverlayMounted().reduce(addErrorToState, {
			type: 'clear',
		});
	});

	const addError = useCallback((err: Error) => {
		setErrorsState((state) => addErrorToState(state, err));
	}, []);

	const setErrors = useCallback((errs: State) => {
		queuedErrorsBeforeOverlayMounted = [];
		setErrorsState(errs);
	}, []);

	useImperativeHandle(setErrorsRef, () => {
		return {setErrors, addError};
	}, [addError, setErrors]);

	useLayoutEffect(() => {
		const queued = takeQueuedErrorsBeforeOverlayMounted();
		if (queued.length === 0) {
			return;
		}

		setErrorsState((state) => queued.reduce(addErrorToState, state));
	});

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
					top: MENU_TOOLBAR_HEIGHT,
					height: `calc(100% - ${MENU_TOOLBAR_HEIGHT}px)`,
				}}
			>
				{errors.errors.map((err, i) => {
					return (
						<ErrorLoader
							// eslint-disable-next-line react/no-array-index-key
							key={(err.stack ?? '') + i}
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
