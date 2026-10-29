import {serverlessCodecs, type ServerlessCodec} from './shared-constants';
/* eslint-disable no-console */

export const validateLambdaCodec = (codec: unknown): ServerlessCodec => {
	if (typeof codec !== 'string') {
		throw new TypeError('"codec" must be a string ');
	}

	if (!(serverlessCodecs as readonly string[]).includes(codec)) {
		throw new TypeError(
			"'" +
				codec +
				"' is not a valid codec for Lambda. The following values are supported: " +
				serverlessCodecs.join(', '),
		);
	}

	if ((codec as string) === 'h264-mkv') {
		console.warn(
			'The "h264-mkv" codec for renderMediaOnLambda() is deprecated - it\'s now just "h264".',
		);

		return 'h264';
	}

	return codec as ServerlessCodec;
};
