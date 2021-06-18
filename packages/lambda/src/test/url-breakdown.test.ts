import {getSiteId} from '../shared/make-s3-url';

test('Break down URL', () => {
	const urlBreakdown = getSiteId(
		'https://remotionlambda-qg35eyp1s1.s3.eu-central-1.amazonaws.com/sites/pasmcxpmuw'
	);
	expect(urlBreakdown.bucketName).toBe('remotionlambda-qg35eyp1s1');
	expect(urlBreakdown.region).toBe('eu-central-1');
	expect(urlBreakdown.siteId).toBe('pasmcxpmuw');
});
