import {expect, test} from 'bun:test';
import {VERSION} from 'remotion';
import type {GcpRegion} from '../../pricing/gcp-regions';
import {getGcpParent, parseServiceName} from '../helpers/parse-service-name';
import {speculateServiceName} from '../speculate-service-name';

const dashedVersion = VERSION.replace(/\./g, '-');
const region: GcpRegion = 'asia-east1';

test('Parse service names', () => {
	process.env.REMOTION_GCP_PROJECT_ID = 'remotion-test-project';

	const shortServiceName = speculateServiceName({
		cpuLimit: '8.0',
		memoryLimit: '100000k',
		// max timeout
		timeoutSeconds: 3600,
	});

	expect(shortServiceName).toBe(
		`remotion-${VERSION.replace(/\./g, '-')}-mem100000k-cpu8-0-t3600`,
	);

	const fullServiceName = `${getGcpParent(
		region,
	)}/services/${shortServiceName}`;

	process.env.REMOTION_GCP_PROJECT_ID = 'remotion-test-project';
	const parsed = parseServiceName(fullServiceName, region);
	expect(parsed).toEqual({
		consoleUrl: `https://console.cloud.google.com/run/detail/asia-east1/remotion-${dashedVersion}-mem100000k-cpu8-0-t3600/logs?project=remotion-test-project`,
		region: 'asia-east1',
		remotionVersion: VERSION.replace(/\./g, '-'),
		serviceName: `remotion-${dashedVersion}-mem100000k-cpu8-0-t3600`,
	});
	// Max length of service name is 49 characters, asking for less in case the version string gets longer
	expect(shortServiceName.length).toBeLessThanOrEqual(47);
});
