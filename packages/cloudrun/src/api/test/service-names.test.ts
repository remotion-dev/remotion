import {VERSION} from 'remotion';
import {expect, test} from 'vitest';
import {speculateServiceName} from '../speculate-service-name';

test('Parse service names', () => {
	const serviceName = speculateServiceName({
		cpuLimit: '1.0',
		memoryLimit: '2Gi',
		timeoutSeconds: 120,
	});

	expect(serviceName).toBe(`remotion--${VERSION}--mem2gi--cpu1-0--t-120`);
});
