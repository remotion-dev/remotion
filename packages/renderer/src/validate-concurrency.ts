import {getCpuCount} from './get-cpu-count';
import type {LogLevel} from './log-level';

export const validateConcurrency = async ({
	setting,
	value,
	checkIfValidForCurrentMachine,
	indent,
	logLevel,
}: {
	value: unknown;
	setting: string;
	checkIfValidForCurrentMachine: boolean;
	indent: boolean;
	logLevel: LogLevel;
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

			if (value > (await getCpuCount({indent, logLevel}))) {
				throw new Error(
					`${setting} is set higher than the amount of CPU cores available. Available CPU cores: ${await getCpuCount(
						{indent, logLevel},
					)}, value set: ${value}`,
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

export const getMinConcurrency = () => 1;
