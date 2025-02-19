import type {webpack} from '@remotion/bundler';

export type WebpackStats = ReturnType<webpack.Stats['toJson']>;
