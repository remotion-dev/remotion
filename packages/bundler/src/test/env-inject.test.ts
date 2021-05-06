import {convertEnvToProcessEnv} from '../convert-env-to-process-env';

test('Should correctly convert env', () => {
	expect(
		convertEnvToProcessEnv({
			HI: 'there',
			THERE: 'world',
		})
	).toEqual({
		'process.env.HI': 'there',
		'process.env.THERE': 'world',
	});
});
