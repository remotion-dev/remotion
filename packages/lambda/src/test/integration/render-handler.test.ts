import {LambdaRoutines} from '../../defaults';
import {handler} from '../../functions';

jest.setTimeout(30000);

test('Render handler manually', async () => {
	expect(
		await handler(
			{
				type: LambdaRoutines.start,
				serveUrl: 'https://competent-mccarthy-56f7c9.netlify.app/',
				chromiumOptions: {},
				codec: 'h264',
				composition: 'react-svg',
				crf: 9,
				enableChunkOptimization: false,
				envVariables: {},
				frameRange: [0, 12],
				framesPerLambda: 8,
				imageFormat: 'png',
				inputProps: {},
				logLevel: 'warn',
				maxRetries: 3,
				outName: 'out.mp4',
				pixelFormat: 'yuv420p',
				privacy: 'public',
				proResProfile: undefined,
				quality: undefined,
				scale: 1,
				timeoutInMilliseconds: 12000,
			},
			{
				invokedFunctionArn: 'arn:fake',
				getRemainingTimeInMillis: () => 12000,
			}
		)
	);
});
