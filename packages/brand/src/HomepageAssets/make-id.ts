import {random} from 'remotion';

export const makeId = () => {
	return random(null).toString().replace('.', '');
};
