import type {LambdaRoutines} from '../../defaults';

export const printCloudwatchHelper = (
	type: LambdaRoutines,
	data: Record<string, string | boolean>
) => {
	const d = Object.keys(data).reduce((a, b) => {
		return [...a, `${b}=${data[b]}`];
	}, [] as string[]);
	const msg = [`method=${type}`, ...d].join(',');
	console.log(msg);
};
