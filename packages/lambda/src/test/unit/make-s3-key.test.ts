import {expect, test} from 'bun:test';
import {makeS3Key} from '../../shared/make-s3-key';

test('makeS3Key should return POSIX syntax cross-platform', () => {
	if (process.platform === 'win32') {
		const key = makeS3Key(
			'renders/234kj324',
			'C:\\Users\\Jonny\\Pictures',
			'C:\\Users\\Jonny\\Pictures\\public\\index.mp4',
		);
		expect(key).toEqual('renders/234kj324/public/index.mp4');
	} else {
		const key2 = makeS3Key(
			'renders/234kj324',
			'/tmp/test/',
			'/tmp/test/public/index.mp4',
		);

		expect(key2).toEqual('renders/234kj324/public/index.mp4');
	}
});
