import {expect, test} from 'bun:test';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {parseAst} from '../codemods/parse-ast';
import {
	computeSequencePropsStatus,
	lineColumnToNodePath,
} from '../preview-server/routes/can-update-sequence-props';

const getNodePath = (filePath: string, line: number) => {
	const content = readFileSync(filePath, 'utf-8');
	const ast = parseAst(content);
	const result = lineColumnToNodePath(ast, line);
	if (!result) {
		throw new Error(`No JSX element found at line ${line} in ${filePath}`);
	}

	return result;
};

test('canUpdateSequenceProps should flag computed props', () => {
	const filePath = path.join(__dirname, 'snapshots', 'light-leak-computed.txt');
	const result = computeSequencePropsStatus({
		fileName: filePath,
		nodePath: getNodePath(filePath, 8),
		keys: ['durationInFrames', 'seed', 'hueShift', 'nonExistentProp'],
		remotionRoot: '/',
	});

	expect(result.canUpdate).toBe(true);
	if (!result.canUpdate) {
		throw new Error('Expected canUpdate to be true');
	}

	expect(result.props.durationInFrames).toEqual({
		canUpdate: true,
		codeValue: 60,
	});
	expect(result.props.hueShift).toEqual({canUpdate: true, codeValue: 30});
	expect(result.props.seed).toEqual({canUpdate: false, reason: 'computed'});
	expect(result.props.nonExistentProp).toEqual({
		canUpdate: true,
		codeValue: undefined,
	});
});

test('computeSequencePropsStatus should detect static nested props', () => {
	const filePath = path.join(__dirname, 'snapshots', 'nested-props.txt');
	const result = computeSequencePropsStatus({
		fileName: filePath,
		nodePath: getNodePath(filePath, 7),
		keys: ['style.opacity', 'style.scale'],
		remotionRoot: '/',
	});

	expect(result.canUpdate).toBe(true);
	if (!result.canUpdate) throw new Error('Expected canUpdate to be true');

	expect(result.props['style.opacity']).toEqual({
		canUpdate: true,
		codeValue: 0.5,
	});
	expect(result.props['style.scale']).toEqual({
		canUpdate: true,
		codeValue: 2,
	});
});

test('computeSequencePropsStatus should flag computed nested props', () => {
	const filePath = path.join(__dirname, 'snapshots', 'nested-props.txt');
	const result = computeSequencePropsStatus({
		fileName: filePath,
		nodePath: getNodePath(filePath, 8),
		keys: ['style.opacity', 'style.scale'],
		remotionRoot: '/',
	});

	expect(result.canUpdate).toBe(true);
	if (!result.canUpdate) throw new Error('Expected canUpdate to be true');

	// opacity uses getOpacity() — computed
	expect(result.props['style.opacity']).toEqual({
		canUpdate: false,
		reason: 'computed',
	});
	// scale is static
	expect(result.props['style.scale']).toEqual({
		canUpdate: true,
		codeValue: 2,
	});
});

test('computeSequencePropsStatus should flag computed when parent is not an object', () => {
	const filePath = path.join(__dirname, 'snapshots', 'nested-props.txt');
	const result = computeSequencePropsStatus({
		fileName: filePath,
		nodePath: getNodePath(filePath, 9),
		keys: ['style.opacity'],
		remotionRoot: '/',
	});

	expect(result.canUpdate).toBe(true);
	if (!result.canUpdate) throw new Error('Expected canUpdate to be true');

	// style={dynamicStyles} — entire parent is computed
	expect(result.props['style.opacity']).toEqual({
		canUpdate: false,
		reason: 'computed',
	});
});

test('computeSequencePropsStatus should report unset nested props as undefined', () => {
	const filePath = path.join(__dirname, 'snapshots', 'nested-props.txt');
	const result = computeSequencePropsStatus({
		fileName: filePath,
		nodePath: getNodePath(filePath, 7),
		keys: ['style.rotate'],
		remotionRoot: '/',
	});

	expect(result.canUpdate).toBe(true);
	if (!result.canUpdate) throw new Error('Expected canUpdate to be true');

	expect(result.props['style.rotate']).toEqual({
		canUpdate: true,
		codeValue: undefined,
	});
});

test('computeSequencePropsStatus should report unset when parent attribute missing', () => {
	const filePath = path.join(__dirname, 'snapshots', 'nested-props.txt');
	const result = computeSequencePropsStatus({
		fileName: filePath,
		nodePath: getNodePath(filePath, 10),
		keys: ['style.opacity'],
		remotionRoot: '/',
	});

	expect(result.canUpdate).toBe(true);
	if (!result.canUpdate) throw new Error('Expected canUpdate to be true');

	expect(result.props['style.opacity']).toEqual({
		canUpdate: true,
		codeValue: undefined,
	});
});
