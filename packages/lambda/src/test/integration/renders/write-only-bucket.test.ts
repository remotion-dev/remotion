import {expect, spyOn, test} from 'bun:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {bundle} from '@remotion/bundler';
import {LambdaClientInternals} from '@remotion/lambda-client';
import {RenderInternals} from '@remotion/renderer';
import {
	OutputFileAccessDeniedError,
	ServerlessRoutines,
} from '@remotion/serverless';
import {mockImplementation} from '../../mocks/mock-implementation';
import {readMockS3File} from '../../mocks/mock-store';
import {waitUntilDone} from '../wait-until-done';

test.each([1, 2])(
	'renders to a write-only destination with concurrency %s without overwriting existing files',
	async (concurrency) => {
		const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'write-only-render-'));
		const destination = `write-only-output-${concurrency}`;
		const region = 'eu-central-1';
		const key = 'output.mp4';
		const originalHead = mockImplementation.headFile;
		const originalConditionalWrite = mockImplementation.writeFileIfNotExists;
		const capabilitySpy = spyOn(
			mockImplementation,
			'supportsConditionalOutput',
		);
		let destinationChecks = 0;
		const headSpy = spyOn(mockImplementation, 'headFile').mockImplementation(
			(input) => {
				if (input.bucketName === destination) {
					destinationChecks++;
					throw new OutputFileAccessDeniedError('s3:GetObject access denied');
				}

				return originalHead(input);
			},
		);
		let close: (() => Promise<void>) | null = null;
		try {
			const serveUrl = await bundle({
				entryPoint: path.join(__dirname, 'write-only-bucket.tsx'),
				outDir: temp,
				publicDir: null,
			});
			const server = await RenderInternals.serveStatic(serveUrl, {
				binariesDirectory: null,
				offthreadVideoThreads: 1,
				downloadMap: RenderInternals.makeDownloadMap(48000),
				indent: false,
				logLevel: 'error',
				offthreadVideoCacheSizeInBytes: null,
				port: null,
				remotionRoot: process.cwd(),
				forceIPv4: false,
			});
			close = server.close;
			const render = async (overwrite: boolean | null) => {
				const payload =
					await LambdaClientInternals.makeLambdaRenderMediaPayload(
						LambdaClientInternals.renderMediaOnLambdaOptionalToRequired({
							codec: 'h264',
							composition: 'write-only',
							concurrency,
							region,
							functionName: 'remotion-dev-render',
							serveUrl: `http://localhost:${server.port}`,
							outName: {bucketName: destination, key},
							privacy: 'no-acl',
							inputProps: {color: overwrite ? 'blue' : 'red'},
							logLevel: 'error',
							...(overwrite === null ? {} : {overwrite}),
						}),
					);
				const result =
					await mockImplementation.callFunctionSync<ServerlessRoutines.start>({
						type: ServerlessRoutines.start,
						payload,
						functionName: 'remotion-dev-lambda',
						region,
						timeoutInTest: 120000,
						requestHandler: null,
					});
				return waitUntilDone(result.bucketName, result.renderId);
			};

			const first = await render(null);
			expect(first.done).toBe(true);
			expect(first.outBucket).toBe(destination);
			const original = Buffer.from(
				readMockS3File({region, bucketName: destination, key})!.content,
			);
			expect(original.includes('ftyp')).toBe(true);
			await expect(render(false)).rejects.toThrow('already exists');
			expect(
				Buffer.from(
					readMockS3File({region, bucketName: destination, key})!.content,
				).equals(Uint8Array.from(original)),
			).toBe(true);
			const replaced = await render(true);
			expect(replaced.done).toBe(true);
			expect(
				Buffer.from(
					readMockS3File({region, bucketName: destination, key})!.content,
				).equals(Uint8Array.from(original)),
			).toBe(false);
			expect(destinationChecks).toBeGreaterThanOrEqual(2);

			// The provider can reject a destination even when it implements conditional writes.
			capabilitySpy.mockReturnValue(false);
			await expect(render(false)).rejects.toThrow('s3:GetObject');
			capabilitySpy.mockReturnValue(true);

			// Without conditional uploads, denied preflight reads must remain fatal.
			mockImplementation.writeFileIfNotExists = null;
			await expect(render(false)).rejects.toThrow('s3:GetObject');
			mockImplementation.writeFileIfNotExists = originalConditionalWrite;

			// With read access, reject an existing file before uploading.
			headSpy.mockImplementation(originalHead);
			const uploadSpy = spyOn(mockImplementation, 'writeFileIfNotExists');
			try {
				await expect(render(false)).rejects.toThrow('already exists');
				expect(uploadSpy).not.toHaveBeenCalled();
			} finally {
				uploadSpy.mockRestore();
			}
		} finally {
			mockImplementation.writeFileIfNotExists = originalConditionalWrite;
			capabilitySpy.mockRestore();
			headSpy.mockRestore();
			await close?.();
			fs.rmSync(temp, {recursive: true, force: true});
		}
	},
	120000,
);
