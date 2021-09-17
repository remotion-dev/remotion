import {deploySite} from '../../api/deploy-site';

test('Should throw on wrong prefix', async () => {
	expect(() =>
		deploySite({
			bucketName: 'wrongprefix',
			entryPoint: 'hi',
			region: 'us-east-1',
		})
	).rejects.toThrow(/The bucketName parameter must start /);
});
