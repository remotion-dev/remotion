import {isOptionalPackageInstalled} from '../OptionalPackageModal';

export const VIDEO_MATTING_PACKAGE = '@remotion/video-matting';

export const isVideoMattingInstalled = () =>
	isOptionalPackageInstalled(VIDEO_MATTING_PACKAGE);
