import {createHash} from 'node:crypto';
import {mkdtempSync, readFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {
	GetBucketLocationCommand,
	HeadObjectCommand,
	PutObjectCommand,
	S3Client,
	S3ServiceException,
} from '@aws-sdk/client-s3';
import {
	GetCallerIdentityCommand,
	STSClient,
	type STSClientConfig,
} from '@aws-sdk/client-sts';
import {$} from 'bun';
import {VERSION} from 'remotion/version';
import type {FunctionArtifactManifest} from '../shared/function-deployment-config';

const publishFunctionArtifacts = async () => {
	const args = process.argv.slice(2);
	if (args.length > 1 || (args.length === 1 && args[0] !== '--check')) {
		throw new Error('Usage: bun run publishlambdaartifacts [--check]');
	}

	const checkOnly = args.includes('--check');
	const accountId = '678892195805';
	const directory = mkdtempSync(
		path.join(tmpdir(), 'remotion-lambda-artifacts-'),
	);
	try {
		const published: {
			name: string;
			version: string;
			dist: {tarball: string; integrity: string};
		} =
			await $`npm view @remotion/lambda@${VERSION} name version dist --json --prefer-online`
				.quiet()
				.json();
		if (
			published.name !== '@remotion/lambda' ||
			published.version !== VERSION
		) {
			throw new Error(`Expected @remotion/lambda@${VERSION} on npm`);
		}

		await $`npm pack @remotion/lambda@${VERSION} --ignore-scripts --pack-destination ${directory}`.quiet();
		const tarball = path.join(directory, `remotion-lambda-${VERSION}.tgz`);
		const integrity = `sha512-${createHash('sha512')
			.update(new Uint8Array(readFileSync(tarball)))
			.digest('base64')}`;
		if (integrity !== published.dist.integrity) {
			throw new Error('The downloaded npm package failed its integrity check');
		}

		await $`tar -xzf ${tarball} -C ${directory} package/remotionlambda-arm64.zip package/function-manifests.json`.quiet();
		const zip = new Uint8Array(
			readFileSync(path.join(directory, 'package', 'remotionlambda-arm64.zip')),
		);
		const sha256 = createHash('sha256').update(zip).digest('hex');
		const sha256Base64 = createHash('sha256').update(zip).digest('base64');
		const manifests: FunctionArtifactManifest[] = JSON.parse(
			readFileSync(
				path.join(directory, 'package', 'function-manifests.json'),
				'utf8',
			),
		);
		if (
			manifests.length === 0 ||
			new Set(manifests.map((manifest) => manifest.region)).size !==
				manifests.length
		) {
			throw new Error(
				'The package must contain one manifest per hosted region',
			);
		}

		for (const manifest of manifests) {
			if (
				manifest.schemaVersion !== 1 ||
				manifest.remotionVersion !== VERSION ||
				manifest.code.sha256 !== sha256 ||
				manifest.code.sha256Base64 !== sha256Base64 ||
				manifest.code.sizeBytes !== zip.length ||
				manifest.code.s3Bucket !==
					`remotionlambda-binaries-${manifest.region}` ||
				manifest.code.s3Key !== `functions/v${VERSION}/arm64.zip`
			) {
				throw new Error(`Invalid artifact manifest for ${manifest.region}`);
			}
		}

		let credentials: STSClientConfig['credentials'] | null = null;
		if (!checkOnly) {
			const result = await $`aws configure export-credentials --format process`
				.quiet()
				.nothrow();
			if (result.exitCode !== 0) {
				throw new Error(
					'AWS CLI credentials are unavailable. Run aws login first.',
				);
			}

			try {
				const value = result.json();
				if (!value.AccessKeyId || !value.SecretAccessKey) {
					throw new Error('Missing AWS credentials');
				}

				credentials = {
					accessKeyId: value.AccessKeyId,
					secretAccessKey: value.SecretAccessKey,
					sessionToken: value.SessionToken,
				};
			} catch {
				throw new Error('AWS CLI returned invalid credentials');
			}
		}

		if (credentials !== null) {
			const sts = new STSClient({region: 'eu-central-1', credentials});
			try {
				const identity = await sts.send(new GetCallerIdentityCommand({}));
				if (identity.Account !== accountId) {
					throw new Error(`Log into AWS publishing account ${accountId} first`);
				}
			} finally {
				sts.destroy();
			}
		}

		for (const manifest of manifests) {
			const {region} = manifest;
			const bucket = manifest.code.s3Bucket;
			const s3 =
				credentials === null ? null : new S3Client({region, credentials});
			try {
				if (s3 !== null) {
					const location = await s3.send(
						new GetBucketLocationCommand({
							Bucket: bucket,
							ExpectedBucketOwner: accountId,
						}),
					);
					if ((location.LocationConstraint ?? 'us-east-1') !== region) {
						throw new Error(`${bucket} is not in ${region}`);
					}
				}

				const files = [
					{name: 'arm64.zip', body: zip, contentType: 'application/zip'},
					{
						name: 'arm64.zip.sha256',
						body: Buffer.from(`${sha256}  arm64.zip\n`),
						contentType: 'text/plain',
					},
					{
						name: 'manifest.json',
						body: Buffer.from(
							JSON.stringify(
								{
									...manifest,
									source: {
										package: published.name,
										tarball: published.dist.tarball,
										integrity,
									},
								},
								null,
								2,
							) + '\n',
						),
						contentType: 'application/json',
					},
				];
				for (const file of files) {
					const key = `functions/v${VERSION}/${file.name}`;
					const digest = createHash('sha256')
						.update(new Uint8Array(file.body))
						.digest();
					if (s3 !== null) {
						const existing = await s3
							.send(
								new HeadObjectCommand({
									Bucket: bucket,
									Key: key,
									ExpectedBucketOwner: accountId,
									ChecksumMode: 'ENABLED',
								}),
							)
							.catch((error) => {
								if (
									error instanceof S3ServiceException &&
									error.$metadata.httpStatusCode === 404
								) {
									return null;
								}

								throw error;
							});
						if (existing === null) {
							await s3.send(
								new PutObjectCommand({
									Bucket: bucket,
									Key: key,
									Body: file.body,
									ExpectedBucketOwner: accountId,
									IfNoneMatch: '*',
									ContentType: file.contentType,
									CacheControl: 'public,max-age=31536000,immutable',
									ServerSideEncryption: 'AES256',
									ChecksumAlgorithm: 'SHA256',
									ChecksumSHA256: digest.toString('base64'),
									Metadata: {
										'remotion-version': VERSION,
										sha256: digest.toString('hex'),
									},
								}),
							);
						} else if (
							existing.ContentLength !== file.body.length ||
							existing.ChecksumSHA256 !== digest.toString('base64')
						) {
							throw new Error(`Refusing to overwrite s3://${bucket}/${key}`);
						}
					}

					const url = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
					const response = await fetch(url, {
						signal: AbortSignal.timeout(60_000),
					});
					if (!response.ok) {
						throw new Error(
							`${url} returned HTTP ${response.status}. Ensure functions/ permits public s3:GetObject access.`,
						);
					}

					if (
						!Buffer.from(await response.arrayBuffer()).equals(
							new Uint8Array(file.body),
						)
					) {
						throw new Error(
							`Published bytes differ from the npm package: ${url}`,
						);
					}
				}

				console.log(
					`${region}: ${checkOnly ? 'Verified' : 'Published and verified'}`,
				);
			} finally {
				s3?.destroy();
			}
		}

		console.log(
			`Verified Remotion ${VERSION} artifacts in ${manifests.length} regions`,
		);
	} finally {
		rmSync(directory, {recursive: true, force: true});
	}
};

publishFunctionArtifacts().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
