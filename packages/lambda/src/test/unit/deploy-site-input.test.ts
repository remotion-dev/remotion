import {expect, test} from 'bun:test';
import {
	type DeploySiteInputForVersion,
	resolveDeploySiteMode,
} from '../../api/deploy-site';

const acceptV4DeploySiteInput = (_input: DeploySiteInputForVersion<false>) =>
	undefined;
const acceptV5DeploySiteInput = (_input: DeploySiteInputForVersion<true>) =>
	undefined;

test('deploySite() exposes the intended v4 and v5 input types', () => {
	const common = {
		bucketName: 'remotionlambda-testing',
		region: 'us-east-1' as const,
	};
	acceptV4DeploySiteInput({...common, entryPoint: 'src/index.ts'});
	acceptV4DeploySiteInput({...common, bundleDir: '/tmp/remotion-bundle'});
	acceptV5DeploySiteInput({...common, bundleDir: '/tmp/remotion-bundle'});

	// @ts-expect-error `entryPoint` is not supported in v5.
	acceptV5DeploySiteInput({...common, entryPoint: 'src/index.ts'});
	// @ts-expect-error The local inputs are mutually exclusive.
	acceptV4DeploySiteInput({
		...common,
		entryPoint: 'src/index.ts',
		bundleDir: '/tmp/remotion-bundle',
	});
});

test('deploySite() accepts bundle directories in v4 and v5', () => {
	expect(
		resolveDeploySiteMode({bundleDir: '/tmp/remotion-bundle'}, false),
	).toBe('bundle-dir');
	expect(resolveDeploySiteMode({bundleDir: '/tmp/remotion-bundle'}, true)).toBe(
		'bundle-dir',
	);
});

test('deploySite() accepts entry points only in v4', () => {
	expect(resolveDeploySiteMode({entryPoint: 'src/index.ts'}, false)).toBe(
		'entry-point',
	);
	expect(() =>
		resolveDeploySiteMode({entryPoint: 'src/index.ts'}, true),
	).toThrow(
		'In Remotion v5, deploySite() does not bundle projects. Call bundle() from `@remotion/bundler` first and pass the resulting directory as `bundleDir`.',
	);
});

test('deploySite() requires exactly one local input', () => {
	expect(() => resolveDeploySiteMode({}, false)).toThrow(
		'Pass exactly one of `bundleDir` or `entryPoint` to deploySite().',
	);
	expect(() =>
		resolveDeploySiteMode(
			{entryPoint: 'src/index.ts', bundleDir: '/tmp/remotion-bundle'},
			false,
		),
	).toThrow('Pass exactly one of `bundleDir` or `entryPoint` to deploySite().');
});

test('deploySite() validates the selected input type', () => {
	expect(() => resolveDeploySiteMode({bundleDir: undefined}, false)).toThrow(
		'`bundleDir` must be a string.',
	);
	expect(() => resolveDeploySiteMode({entryPoint: undefined}, false)).toThrow(
		'`entryPoint` must be a string.',
	);
});
