import React, {Suspense, useCallback, useContext, useState} from 'react';
import {installPackages} from '../../api/install-package';
import {LIGHT_TEXT, WARNING_COLOR, WHITE} from '../../helpers/colors';
import type {TranscriptionModalState} from '../../state/modals';
import {SetSelectedModalContext} from '../../state/modals';
import {Button} from '../Button';
import {Flex, Row, Spacing} from '../layout';
import {ModalButton} from '../ModalButton';
import {ModalContainer} from '../ModalContainer';
import {ModalFooterContainer} from '../ModalFooter';
import {ModalHeader} from '../ModalHeader';
import {Spinner} from '../Spinner';
import {
	isWhisperWebGpuInstalled,
	WHISPER_WEBGPU_PACKAGE,
} from './whisper-webgpu-capability';

const LazyTranscriptionModal = React.lazy(async () => {
	const {TranscriptionModal} = await import('./TranscriptionModal');
	return {default: TranscriptionModal};
});

type InstallState =
	| {type: 'idle'}
	| {type: 'installing'}
	| {type: 'error'; error: Error};

const panelStyle: React.CSSProperties = {
	width: 'min(520px, calc(100vw - 40px))',
};

const contentStyle: React.CSSProperties = {
	color: WHITE,
	fontFamily: 'sans-serif',
	fontSize: 14,
	lineHeight: 1.5,
	padding: 16,
};

const codeStyle: React.CSSProperties = {
	color: 'inherit',
	fontFamily: 'monospace',
	fontSize: 'inherit',
};

const statusStyle: React.CSSProperties = {
	alignItems: 'center',
	color: LIGHT_TEXT,
	display: 'flex',
	gap: 10,
};

const errorStyle: React.CSSProperties = {
	color: WARNING_COLOR,
	marginTop: 12,
	whiteSpace: 'pre-wrap',
};

const cancelStyle: React.CSSProperties = {
	minWidth: 90,
};

export const TranscriptionModalWithOptionalWhisper: React.FC<{
	readonly state: TranscriptionModalState;
}> = ({state}) => {
	const {setSelectedModal} = useContext(SetSelectedModalContext);
	const [installed, setInstalled] = useState(isWhisperWebGpuInstalled);
	const [installState, setInstallState] = useState<InstallState>({
		type: 'idle',
	});

	const busy = installState.type === 'installing';
	const dismiss = useCallback(() => {
		if (!busy) {
			setSelectedModal(null);
		}
	}, [busy, setSelectedModal]);

	const install = useCallback(async () => {
		setInstallState({type: 'installing'});
		try {
			await installPackages([{name: WHISPER_WEBGPU_PACKAGE, version: null}]);
			window.remotion_installedPackages = Array.from(
				new Set([
					...(window.remotion_installedPackages ?? []),
					WHISPER_WEBGPU_PACKAGE,
				]),
			);

			setInstalled(true);
		} catch (error) {
			setInstallState({type: 'error', error: error as Error});
		}
	}, []);

	if (installed) {
		return (
			<Suspense fallback={null}>
				<LazyTranscriptionModal {...state} />
			</Suspense>
		);
	}

	return (
		<ModalContainer
			ariaLabel="Install transcription package"
			onEscape={dismiss}
			onOutsideClick={dismiss}
			panelStyle={panelStyle}
		>
			<ModalHeader title="Transcribe" onClose={dismiss} />
			<div style={contentStyle}>
				{busy ? (
					<div style={statusStyle}>
						<Spinner duration={0.5} size={18} />
						{`Installing ${WHISPER_WEBGPU_PACKAGE}…`}
					</div>
				) : (
					<>
						This requires installing{' '}
						<code style={codeStyle}>{WHISPER_WEBGPU_PACKAGE}</code>. Continue?
						{installState.type === 'error' ? (
							<div style={errorStyle}>{installState.error.message}</div>
						) : null}
					</>
				)}
			</div>
			<ModalFooterContainer>
				<Row align="center">
					<Flex />
					<Button disabled={busy} onClick={dismiss} style={cancelStyle}>
						Cancel
					</Button>
					<Spacing x={1} />
					<ModalButton disabled={busy} onClick={install} autoFocus>
						{installState.type === 'error' ? 'Retry' : 'Continue'}
					</ModalButton>
				</Row>
			</ModalFooterContainer>
		</ModalContainer>
	);
};
