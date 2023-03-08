import {isInsideLambda} from '../../shared/is-in-lambda';
import type {LambdaArchitecture} from '../../shared/validate-architecture';

export const getCurrentArchitecture = (): LambdaArchitecture => {
	if (!isInsideLambda()) {
		throw new Error(
			'Should not call getCurrentArchitecture() if not inside a lambda function'
		);
	}

	return process.arch.includes('arm') ? 'arm64' : 'x86_64';
};
