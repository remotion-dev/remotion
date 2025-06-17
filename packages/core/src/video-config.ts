import type {Codec} from './codec';
import type {VideoImageFormat} from './image-format';
import type {PixelFormat} from './pixel-format';

export type VideoConfig = {
	width: number;
	height: number;
	fps: number;
	durationInFrames: number;
	id: string;
	defaultProps: Record<string, unknown>;
	props: Record<string, unknown>;
	defaultCodec: Codec | null;
	defaultOutName: string | null;
	defaultVideoImageFormat: VideoImageFormat | null;
	defaultPixelFormat: PixelFormat | null;
};
