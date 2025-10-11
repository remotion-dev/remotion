import React, {
	createRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useRef,
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
	const iframe = useRef<HTMLIFrameElement>(null);

	useImperativeHandle(
		askAiModalRef,
		() => ({
			toggle: () => {
				setState((s) => {
					if (s === 'visible') {
						iframe.current?.blur();
						iframe.current?.contentWindow?.blur();
					}

					return s === 'visible' ? 'hidden' : 'visible';
				});
			},
		}),
		[],
	);

	useEffect(() => {
		const onMessage = (event: MessageEvent) => {
			try {
				const json =
					typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
				if (json.type === 'cmd-i') {
					askAiModalRef.current?.toggle();
				}
			} catch {}
		};

		window.addEventListener('message', onMessage);

		return () => {
			window.removeEventListener('message', onMessage);
		};
	}, []);

	const onQuit = useCallback(() => {
		setState('hidden');
	}, [setState]);

	// When re-toggling the modal, focus the text box
	useEffect(() => {
		if (!iframe.current) {
			return;
		}

		if (state === 'visible') {
			iframe.current.contentWindow?.postMessage(
				{
					type: 'focus',
				},
				'*',
			);
		}
	}, [state]);

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
					ref={iframe}
					frameBorder={0}
					style={container}
					src="https://www.remotion.dev/ai-embed"
					allow="clipboard-read; clipboard-write"
				/>
			</ModalContainer>
		</AbsoluteFill>
	);
};
