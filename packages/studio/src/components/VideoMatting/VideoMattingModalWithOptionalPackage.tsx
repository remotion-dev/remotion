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
		ariaLabel="Install video matting package"
		packageName={VIDEO_MATTING_PACKAGE}
		title="Track matting"
	>
		<Suspense fallback={null}>
			<LazyVideoMattingModal {...state} />
		</Suspense>
	</OptionalPackageModal>
);
