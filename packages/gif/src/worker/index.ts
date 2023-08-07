import {src} from './source';

export const makeWorker = (): Worker => {
	const blob = new Blob([src], {type: 'application/javascript'});
	const url = URL.createObjectURL(blob);
	const worker = new Worker(url);
	URL.revokeObjectURL(url);

	return worker;
};
