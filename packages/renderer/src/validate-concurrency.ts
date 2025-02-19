import {getCpuCount} from './get-cpu-count';

export const validateConcurrency = ({
	setting,
	value,
	checkIfValidForCurrentMachine,
}: {
	value: unknown;
	setting: string;
	checkIfValidForCurrentMachine: boolean;
}) => {
	if (typeof value === 'undefined') {
		return;
	}

	if (value === null) {
		return;
	}

	if (typeof value !== 'number' && typeof value !== 'string') {
		throw new Error(setting + ' must a number or a string but is ' + value);
	}

	if (typeof value === 'number') {
		if (value % 1 !== 0) {
			throw new Error(setting + ' must be an integer, but is ' + value);
		}

		if (checkIfValidForCurrentMachine) {
			if (value < getMinConcurrency()) {
				throw new Error(
					`${setting} must be at least ${getMinConcurrency()}, but is ${JSON.stringify(
						value,
					)}`,
				);
			}

			if (value > getMaxConcurrency()) {
				throw new Error(
					`${setting} is set higher than the amount of CPU cores available. Available CPU cores: ${getMaxConcurrency()}, value set: ${value}`,
				);
			}
		}
	} else if (!/^\d+(\.\d+)?%$/.test(value)) {
		throw new Error(
			`${setting} must be a number or percentage, but is ${JSON.stringify(
				value,
			)}`,
		);
	}
};

export const getMaxConcurrency = () => {
	return getCpuCount();
};

export const getMinConcurrency = () => 1;
