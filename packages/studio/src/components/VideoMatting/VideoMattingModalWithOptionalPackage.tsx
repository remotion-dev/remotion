import React, {Suspense} from 'react';
import type {VideoMattingModalState} from '../../state/modals';
import {OptionalPackageModal} from '../OptionalPackageModal';
import {VIDEO_MATTING_PACKAGE} from './video-matting-capability';

const LazyVideoMattingModal = React.lazy(async () => {
	const {VideoMattingModal} = await import('./VideoMattingModal');
	return {default: VideoMattingModal};
});

export const VideoMattingModalWithOptionalPackage: React.FC<{
	readonly state: VideoMattingModalState;
}> = ({state}) => (
	<OptionalPackageModal
		ariaLabel={
			state.target === null
				? 'Install video matting package'
				: 'Install video matting package to separate foreground'
		}
		packageName={VIDEO_MATTING_PACKAGE}
		title={state.target === null ? 'Track matting' : 'Separate foreground'}
	>
		<Suspense fallback={null}>
			<LazyVideoMattingModal {...state} />
		</Suspense>
	</OptionalPackageModal>
);
