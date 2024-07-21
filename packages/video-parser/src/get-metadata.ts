export type Options<Dimensions extends boolean, Format extends boolean> = {
	dimensions?: Dimensions;
	format?: Format;
};

type Metadata<
	Dimensions extends boolean,
	Format extends boolean,
> = (Dimensions extends true ? {dimensions: number} : {}) &
	(Format extends true ? {format: string} : {});

export function getMetadata<Dimensions extends boolean, Format extends boolean>(
	src: string,
	options: Options<Dimensions, Format>,
): Metadata<Dimensions, Format> {
	const result: any = {};

	return result;
}

const res = getMetadata('https://example.com/video.mp4', {
	dimensions: true,
	format: true,
});

console.log(res.dimensions);
console.log(res.format);
