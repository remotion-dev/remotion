import React, {
	useCallback,
	useContext,
	useEffect,
	useReducer,
	useRef,
} from 'react';
import type {TCompMetadata} from 'remotion';
import {Button} from '../../../preview-server/error-overlay/remotion-overlay/Button';
import type {AddRenderRequest} from '../../../preview-server/render-queue/job';
import {ModalsContext} from '../../state/modals';
import {ModalContainer} from '../ModalContainer';
import {NewCompHeader} from '../ModalHeader';

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

export const RenderModal: React.FC<{composition: TCompMetadata}> = ({
	composition,
}) => {
	const {setSelectedModal} = useContext(ModalsContext);

	const onQuit = useCallback(() => {
		setSelectedModal(null);
	}, [setSelectedModal]);

	const isMounted = useRef(true);

	const [state, dispatch] = useReducer(reducer, initialState);

	const dispatchIfMounted: typeof dispatch = useCallback((payload) => {
		if (isMounted.current === false) return;
		dispatch(payload);
	}, []);

	const onClick = useCallback(() => {
		const body: AddRenderRequest = {
			compositionId: composition.id,
			type: 'still',
		};
		fetch(`/api/render`, {
			method: 'post',
			headers: {
				'content-type': 'application/json',
			},
			body: JSON.stringify(body),
		})
			.then((res) => res.json())
			.then((data: {success: boolean}) => {
				if (data.success) {
					dispatchIfMounted({type: 'succeed'});
					setSelectedModal(null);
				} else {
					dispatchIfMounted({type: 'fail'});
				}
			})
			.catch(() => {
				dispatchIfMounted({type: 'fail'});
			})
			.finally(() => {
				setTimeout(() => {
					dispatchIfMounted({type: 'reset'});
				}, 2000);
			});
	}, [composition.id, dispatchIfMounted, setSelectedModal]);

	useEffect(() => {
		return () => {
			isMounted.current = false;
		};
	}, []);

	return (
		<ModalContainer onOutsideClick={onQuit} onEscape={onQuit}>
			<NewCompHeader title={`Render ${composition.id}`} />
			<Button onClick={onClick} disabled={state.type === 'load'}>
				{state.type === 'idle' ? 'Render' : 'Rendering...'}
			</Button>
		</ModalContainer>
	);
};
