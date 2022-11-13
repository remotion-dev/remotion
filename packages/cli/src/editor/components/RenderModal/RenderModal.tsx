import React, {
	useCallback,
	useContext,
	useEffect,
	useReducer,
	useRef,
	useState,
} from 'react';
import type {TCompMetadata} from 'remotion';
import {getDefaultOutLocation} from '../../../get-default-out-name';
import {Button} from '../../../preview-server/error-overlay/remotion-overlay/Button';
import type {AddRenderRequest} from '../../../preview-server/render-queue/job';
import {ModalsContext} from '../../state/modals';
import {Spacing} from '../layout';
import {ModalContainer} from '../ModalContainer';
import {NewCompHeader} from '../ModalHeader';
import {RemotionInput} from '../NewComposition/RemInput';

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

	if (action.type === 'succeed') {
		return {
			type: 'success',
		};
	}

	return state;
};

const container: React.CSSProperties = {
	padding: 20,
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

	// TODO: Allow to change out name
	const [outName] = useState(() =>
		getDefaultOutLocation({
			compositionName: composition.id,
			// TODO: Set default extension
			defaultExtension: 'png',
		})
	);

	const dispatchIfMounted: typeof dispatch = useCallback((payload) => {
		if (isMounted.current === false) return;
		dispatch(payload);
	}, []);

	const onClick = useCallback(() => {
		const body: AddRenderRequest = {
			compositionId: composition.id,
			type: 'still',
			outName,
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
			});
	}, [composition.id, dispatchIfMounted, outName, setSelectedModal]);

	useEffect(() => {
		return () => {
			isMounted.current = false;
		};
	}, []);

	return (
		<ModalContainer onOutsideClick={onQuit} onEscape={onQuit}>
			<NewCompHeader title={`Render ${composition.id}`} />
			<div style={container}>
				<div>
					<RemotionInput type="text" value={outName} />
				</div>
				<Spacing block y={0.5} />
				<div>
					<Button onClick={onClick} disabled={state.type === 'load'}>
						{state.type === 'idle' ? 'Render' : 'Rendering...'}
					</Button>
				</div>
			</div>
		</ModalContainer>
	);
};
