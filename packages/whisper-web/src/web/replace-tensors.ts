import {isONNXTensor, Tensor} from './tensor';

export function replaceTensors(obj: any) {
	for (const prop in obj) {
		if (isONNXTensor(obj[prop])) {
			obj[prop] = new Tensor(obj[prop]);
		} else if (typeof obj[prop] === 'object') {
			replaceTensors(obj[prop]);
		}
	}

	return obj;
}
