import {afterEach, expect, test} from 'bun:test';
import {mkdtemp, rm, truncate, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import type {_Object} from '@aws-sdk/client-s3';
import type {AwsProvider} from '@remotion/lambda-client';
import type {FullClientSpecifics} from '@remotion/serverless';
import {getEtagOfFile} from '../../shared/get-etag';
import {getS3DiffOperations} from '../../shared/get-s3-operations';
import {multipartUploadPartSize} from '../../shared/multipart-upload-part-size';
import {readDirectory} from '../../shared/read-dir';

let temporaryDirectory: string | null = null;

afterEach(async () => {
	if (temporaryDirectory) {
		await rm(temporaryDirectory, {recursive: true});
		temporaryDirectory = null;
	}
});

const createZeroFilledFile = async (size: number) => {
	temporaryDirectory = await mkdtemp(path.join(tmpdir(), 'remotion-etag-'));
	const file = path.join(temporaryDirectory, 'asset.bin');
	await writeFile(file, '');
	await truncate(file, size);
	return file;
};

test('calculates a single-part ETag at the multipart part-size boundary', async () => {
	const file = await createZeroFilledFile(multipartUploadPartSize);
	const getEtag = getEtagOfFile(file, () => undefined);

	expect(await getEtag()).toBe('"ec8bb3b24d5b0f1b5bdf8c8f0f541ee6"');
});

test('recognizes an unchanged file above the multipart part-size boundary', async () => {
	await createZeroFilledFile(multipartUploadPartSize + 1);
	const etag = '"60dc0dd5b9a5166cb9ea548998a4ccf4-2"';
	const objects: _Object[] = [{Key: 'sites/test/asset.bin', ETag: etag}];

	const operations = await getS3DiffOperations({
		objects,
		bundle: temporaryDirectory as string,
		prefix: 'sites/test',
		onProgress: () => undefined,
		fullClientSpecifics: {readDirectory} as FullClientSpecifics<AwsProvider>,
	});

	expect(operations).toEqual({
		toDelete: [],
		toUpload: [],
		existingCount: 1,
	});
});
