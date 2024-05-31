import type {AnySourceMapConsumer} from '../symbolicate-stacktrace';

export type SourceMapGetter = () => AnySourceMapConsumer | null;
