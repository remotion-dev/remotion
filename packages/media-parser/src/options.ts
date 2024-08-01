import type {Dimensions} from './get-dimensions';
import type {AnySegment} from './parse-result';
import type {ReaderInterface} from './reader';

export type Options<
	EnableDimensions extends boolean,
	EnableDuration extends boolean,
	EnableBoxes extends boolean,
	EnableFps extends boolean,
> = {
	dimensions?: EnableDimensions;
	durationInSeconds?: EnableDuration;
	boxes?: EnableBoxes;
	fps?: EnableFps;
};

export type Metadata<
	EnableDimensions extends boolean,
	EnableDuration extends boolean,
	EnableBoxes extends boolean,
	EnableFps extends boolean,
> = (EnableDimensions extends true ? {dimensions: Dimensions} : {}) &
	(EnableDuration extends true ? {durationInSeconds: number | null} : {}) &
	(EnableBoxes extends true ? {boxes: AnySegment[]} : {}) &
	(EnableFps extends true ? {fps: number | null} : {});

export type ParseMedia = <
	EnableDimensions extends boolean,
	EnableDuration extends boolean,
	EnableBoxes extends boolean,
	EnableFps extends boolean,
>(
	src: string,
	options: Options<EnableDimensions, EnableDuration, EnableBoxes, EnableFps>,
	readerInterface?: ReaderInterface,
) => Promise<
	Metadata<EnableDimensions, EnableDuration, EnableBoxes, EnableFps>
>;
