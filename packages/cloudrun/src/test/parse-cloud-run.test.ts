import {expect, test} from 'vitest';
import {parseCloudRunUrl} from '../api/helpers/parse-cloud-run-url';

test('Should parse Cloud Run URL correctly', () => {
	const result = parseCloudRunUrl(
		'https://remotion-consumer-2iigzhq5wa-ue.a.run.app'
	);

	expect(result).toEqual({
		region: 'us-east1',
		projectHash: '2iigzhq5wa',
		serviceName: 'remotion-consumer',
	});
});
