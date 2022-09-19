import {src} from './source';

export const makeWorker = (options?: WorkerOptions): Worker => {
	const blob = new Blob([src], {type: 'application/javascript'});
	const url = URL.createObjectURL(blob);
	const worker = new Worker(url, options);
	URL.revokeObjectURL(url);

	return worker;
};
