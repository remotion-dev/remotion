/* eslint-disable no-console */
import type {SymbolicatedStackFrame} from '@remotion/studio-shared';
import React, {
	useCallback,
	useEffect,
	useMemo,
	useReducer,
	useRef,
} from 'react';
import {Button} from '../../components/Button';
import {openInEditor} from '../../helpers/open-in-editor';
import {useKeybinding} from '../../helpers/use-keybinding';
import {ShortcutHint} from './ShortcutHint';

type State =
	| {
			type: 'idle';
	  }
	| {
			type: 'success';
	  }
	| {
			type: 'load';
	  }
	| {
			type: 'error';
	  };

const initialState: State = {type: 'idle'};

type Action =
	| {
			type: 'start';
	  }
	| {
			type: 'succeed';
	  }
	| {
			type: 'fail';
	  }
	| {
			type: 'reset';
	  };

const reducer = (state: State, action: Action): State => {
	if (action.type === 'start') {
		return {
			type: 'load',
		};
	}

	if (action.type === 'fail') {
		return {
			type: 'error',
		};
	}

	if (action.type === 'reset') {
		return {
			type: 'idle',
		};
	}

	if (action.type === 'succeed') {
		return {
			type: 'success',
		};
	}

	return state;
};

export const OpenInEditor: React.FC<{
	readonly stack: SymbolicatedStackFrame;
	readonly canHaveKeyboardShortcuts: boolean;
}> = ({stack, canHaveKeyboardShortcuts}) => {
	const isMounted = useRef(true);
	const [state, dispatch] = useReducer(reducer, initialState);
	const {registerKeybinding} = useKeybinding();
	const dispatchIfMounted: typeof dispatch = useCallback((payload) => {
		if (isMounted.current === false) return;
		dispatch(payload);
	}, []);

	const openInBrowser = useCallback(() => {
		dispatch({type: 'start'});
		openInEditor(stack)
			.then((res) => res.json())
			.then((data: {success: boolean}) => {
				if (data.success) {
					dispatchIfMounted({type: 'succeed'});
				} else {
					dispatchIfMounted({type: 'fail'});
				}
			})
			.catch((err) => {
				dispatchIfMounted({type: 'fail'});
				console.log('Could not open browser', err);
			})
			.finally(() => {
				setTimeout(() => {
					dispatchIfMounted({type: 'reset'});
				}, 2000);
			});
	}, [dispatchIfMounted, stack]);

	useEffect(() => {
		return () => {
			isMounted.current = false;
		};
	}, []);

	useEffect(() => {
		if (!canHaveKeyboardShortcuts) {
			return;
		}

		const onEditor = () => {
			openInBrowser();
		};

		const {unregister} = registerKeybinding({
			event: 'keydown',
			key: 'o',
			callback: onEditor,
			commandCtrlKey: true,
			preventDefault: true,
			triggerIfInputFieldFocused: false,
			keepRegisteredWhenNotHighestContext: false,
		});
		return () => unregister();
	}, [canHaveKeyboardShortcuts, openInBrowser, registerKeybinding]);
	const label = useMemo(() => {
		switch (state.type) {
			case 'error':
				return 'Failed to open';
			case 'idle':
				return `Open in ${window.remotion_editorName}`;
			case 'success':
				return `Opened in ${window.remotion_editorName}`;
			case 'load':
				return `Opening...`;
			default:
				throw new Error('invalid state');
		}
	}, [state.type]);

	return (
		<Button onClick={openInBrowser} disabled={state.type !== 'idle'}>
			{label}
			{canHaveKeyboardShortcuts ? (
				<ShortcutHint keyToPress="o" cmdOrCtrl />
			) : null}
		</Button>
	);
};
