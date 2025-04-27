import React, {
	createRef,
	useCallback,
	useImperativeHandle,
	useState,
} from 'react';
import {AbsoluteFill} from 'remotion';
import {ModalContainer} from './ModalContainer';
import {ModalHeader} from './ModalHeader';

const container: React.CSSProperties = {
	height: 'calc(100vh - 100px)',
	width: 'calc(100vw - 160px)',
	maxWidth: 800,
	maxHeight: 900,
	display: 'block',
};

type State = 'never-opened' | 'hidden' | 'visible';

type AskAiModalRef = {
	toggle: () => void;
};

export const askAiModalRef = createRef<AskAiModalRef>();

export const AskAiModal: React.FC = () => {
	const [state, setState] = useState<State>('never-opened');

	useImperativeHandle(
		askAiModalRef,
		() => ({
			toggle: () => {
				setState(state === 'visible' ? 'hidden' : 'visible');
			},
		}),
		[state],
	);

	const onQuit = useCallback(() => {
		setState('hidden');
	}, [setState]);

	if (state === 'never-opened') {
		return null;
	}

	return (
		<AbsoluteFill style={{display: state === 'visible' ? 'block' : 'none'}}>
			<ModalContainer
				noZIndex={state === 'hidden'}
				onOutsideClick={onQuit}
				onEscape={onQuit}
			>
				<ModalHeader title="Ask AI" onClose={onQuit} />
				<iframe
					frameBorder={0}
					style={container}
					src="https://remotion.dev/ai-embed"
				/>
			</ModalContainer>
		</AbsoluteFill>
	);
};
