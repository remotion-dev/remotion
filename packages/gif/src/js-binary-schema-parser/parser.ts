import type {ParsedGif} from '../gifuct/types';
import type {Stream} from './uint8-parser';

export const parse = <T extends Record<string, T>>(
	stream: Stream,
	schema: GifSchema,
	result: T = {} as T,
	parent: T = result,
): GifSchema => {
	if (Array.isArray(schema)) {
		schema.forEach((partSchema) => {
			return parse(stream, partSchema, result, parent);
		});
	} else if (typeof schema === 'function') {
		schema(stream, result, parent, parse);
	} else {
		// @ts-expect-error
		const key = Object.keys(schema)[0];

		// @ts-expect-error
		if (Array.isArray(schema[key])) {
			// @ts-expect-error
			parent[key] = {} as T;
			// @ts-expect-error
			parse(stream, schema[key], result, parent[key]);
		} else {
			// @ts-expect-error
			parent[key] = schema[key](stream, result, parent, parse) as T;
		}
	}

	return result as unknown as ParsedGif;
};

export const loop = <R>(
	schema: GifSchema,
	continueFunc: (st: Stream, r: R, p: R) => boolean,
) => {
	return function (stream: Stream, result: R, parent: R, _parse: ParseFn<R>) {
		const arr = [];
		let lastStreamPos = stream.pos;

		while (continueFunc(stream, result, parent)) {
			const newParent = {} as R;
			_parse(stream, schema, result, newParent); // cases when whole file is parsed but no termination is there and stream position is not getting updated as well
			// it falls into infinite recursion, null check to avoid the same

			if (stream.pos === lastStreamPos) {
				break;
			}

			lastStreamPos = stream.pos;
			arr.push(newParent);
		}

		return arr;
	};
};

type ConditionalFunction<T> = (st: Stream, result: T, parent: T) => boolean;
type ParseFn<T> = (st: Stream, schema: GifSchema, result: T, parent: T) => void;

export type GifSchema = unknown | ParsedGif;

export const conditional =
	<T>(schema: GifSchema, conditionFunc: ConditionalFunction<T>) =>
	(stream: Stream, result: T, parent: T, parseFn: ParseFn<T>) => {
		if (conditionFunc(stream, result, parent)) {
			parseFn(stream, schema, result, parent);
		}
	};
