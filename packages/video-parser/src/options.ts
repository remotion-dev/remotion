import type {Dimensions} from './get-dimensions';
import type {AnySegment} from './parse-result';
import type {ReaderInterface} from './reader';

export type Options<
	EnableDimensions extends boolean,
	EnableDuration extends boolean,
	EnableBoxes extends boolean,
> = {
	dimensions?: EnableDimensions;
	durationInSeconds?: EnableDuration;
	boxes?: EnableBoxes;
};

export type Metadata<
	EnableDimensions extends boolean,
	EnableDuration extends boolean,
	EnableBoxes extends boolean,
> = (EnableDimensions extends true ? {dimensions: Dimensions} : {}) &
	(EnableDuration extends true ? {durationInSeconds: number | null} : {}) &
	(EnableBoxes extends true ? {boxes: AnySegment[]} : {});

export type GetVideoMetadata = <
	EnableDimensions extends boolean,
	EnableDuration extends boolean,
	EnableBoxes extends boolean,
>(
	src: string,
	options: Options<EnableDimensions, EnableDuration, EnableBoxes>,
	readerInterface?: ReaderInterface,
) => Promise<Metadata<EnableDimensions, EnableDuration, EnableBoxes>>;
