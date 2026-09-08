import React, {Suspense} from 'react';
import type {TranscriptionModalState} from '../../state/modals';
import {OptionalPackageModal} from '../OptionalPackageModal';
import {WHISPER_WEBGPU_PACKAGE} from './whisper-webgpu-capability';

const LazyTranscriptionModal = React.lazy(async () => {
	const {TranscriptionModal} = await import('./TranscriptionModal');
	return {default: TranscriptionModal};
});

export const TranscriptionModalWithOptionalWhisper: React.FC<{
	readonly state: TranscriptionModalState;
}> = ({state}) => {
	return (
		<OptionalPackageModal
			ariaLabel="Install transcription package"
			packageName={WHISPER_WEBGPU_PACKAGE}
			title="Transcribe"
		>
			<Suspense fallback={null}>
				<LazyTranscriptionModal {...state} />
			</Suspense>
		</OptionalPackageModal>
	);
};
