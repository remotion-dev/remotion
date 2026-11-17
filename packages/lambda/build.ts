import {createHash} from 'node:crypto';
import fs, {cpSync, readdirSync} from 'node:fs';
import path from 'node:path';
import {BundlerInternals} from '@remotion/bundler';
import {dir} from '@remotion/compositor-linux-arm64-gnu';
import {LambdaClientInternals} from '@remotion/lambda-client';
import {$} from 'bun';
import {VERSION} from 'remotion/version';
import {
	FUNCTION_DEPLOYMENT_CONFIG,
	getRuntimeVersionArn,
	type FunctionArtifactManifest,
} from './src/shared/function-deployment-config';
import {FUNCTION_ZIP_ARM64} from './src/shared/function-zip-path';
import {getLayers} from './src/shared/get-layers';
import {hostedLayers, type HostedLayerRegion} from './src/shared/hosted-layers';

const outdir = path.join(__dirname, `build-render`);
fs.mkdirSync(outdir, {
	recursive: true,
});
const outfile = path.join(outdir, 'index.js');

fs.rmSync(outdir, {recursive: true});
fs.mkdirSync(outdir, {recursive: true});
const template = require.resolve(
	path.join(__dirname, 'dist', 'functions', 'index'),
);

await BundlerInternals.esbuild.build({
	platform: 'node',
	target: 'node16',
	bundle: true,
	outfile,
	minify: true,
	legalComments: 'none',
	entryPoints: [template],
	treeShaking: true,
	external: [],
});

const filesInCwd = readdirSync(dir);
const filesToCopy = filesInCwd.filter(
	(f) =>
		f.startsWith('remotion') ||
		f.endsWith('.so') ||
		f.endsWith('.dll') ||
		f.endsWith('.dylib') ||
		f.startsWith('ffmpeg') ||
		f.startsWith('ffprobe'),
);
for (const file of filesToCopy) {
	cpSync(path.join(dir, file), path.join(outdir, file));
}

fs.cpSync(
	path.join(
		__dirname,
		'..',
		'renderer',
		'node_modules',
		'source-map',
		'lib',
		'mappings.wasm',
	),
	`${outdir}/mappings.wasm`,
);

await $`cd ${outdir} && zip -r ${path.resolve(FUNCTION_ZIP_ARM64)} .`;

const zip = new Uint8Array(fs.readFileSync(FUNCTION_ZIP_ARM64));
const sha256 = createHash('sha256').update(zip).digest('hex');
const sha256Base64 = createHash('sha256').update(zip).digest('base64');
const manifests = Object.keys(hostedLayers)
	.sort()
	.map((region): FunctionArtifactManifest => {
		const hostedRegion = region as HostedLayerRegion;
		return {
			schemaVersion: 1,
			remotionVersion: VERSION,
			region: hostedRegion,
			architecture: FUNCTION_DEPLOYMENT_CONFIG.architecture,
			runtime: FUNCTION_DEPLOYMENT_CONFIG.runtime,
			handler: FUNCTION_DEPLOYMENT_CONFIG.handler,
			runtimeVersionArn: getRuntimeVersionArn(hostedRegion),
			maximumRetryAttempts: FUNCTION_DEPLOYMENT_CONFIG.maximumRetryAttempts,
			code: {
				s3Bucket: `remotionlambda-binaries-${region}`,
				s3Key: `functions/v${VERSION}/arm64.zip`,
				sha256,
				sha256Base64,
				sizeBytes: zip.length,
			},
			layers: Object.fromEntries(
				LambdaClientInternals.runtimePreferenceOptions.map((option) => [
					option,
					getLayers({region: hostedRegion, option}).map(
						({layerArn, version}) => `${layerArn}:${version}`,
					),
				]),
			) as FunctionArtifactManifest['layers'],
		};
	});
fs.writeFileSync(
	path.join(__dirname, 'function-manifests.json'),
	JSON.stringify(manifests, null, 2) + '\n',
);

fs.rmSync(outdir, {recursive: true});
console.log('Bundled Lambda');
