import {expect, test} from 'bun:test';
import {computeSequencePropsSubscriptionFromContent} from '../sequence-props';
import {updateSequenceKeyframes} from '../update-keyframes';
import {updateSequencePropsAst} from '../update-sequence-props';

test('3D group position props resolve to the imported component for Studio edits', () => {
	const fileContents = `import {InteractiveThree} from '@remotion/three';
import {interpolate, useCurrentFrame} from 'remotion';

export const Scene = () => {
  const frame = useCurrentFrame();
  return <InteractiveThree.Group
    name="Product"
    positionX={interpolate(frame, [0, 90], [-1, 1])}
    positionY={0}
    positionZ={2}
  />;
};
`;
	const result = computeSequencePropsSubscriptionFromContent({
		fileContents,
		absolutePath: '/project/src/Scene.tsx',
		line: 6,
		preferredNodePath: null,
		componentIdentity: 'dev.remotion.three.InteractiveThree.Group',
		keys: ['positionX', 'positionY', 'positionZ'],
		effects: [],
		videoConfigValues: {
			durationInFrames: 120,
			fps: 30,
			height: 720,
			width: 1280,
		},
	});

	expect(result.success).toBe(true);
	if (!result.success || !result.status.canUpdate) {
		throw new Error('Expected editable position props');
	}

	expect(result.status.props.positionX.status).toBe('keyframed');
	expect(result.status.props.positionY).toEqual({
		status: 'static',
		keyframeDisplayOffsetAdjustment: null,
		codeValue: 0,
	});
	expect(result.status.props.positionZ).toEqual({
		status: 'static',
		keyframeDisplayOffsetAdjustment: null,
		codeValue: 2,
	});

	const updated = updateSequencePropsAst({
		input: fileContents,
		nodePath: result.nodePath.nodePath,
		updates: [{key: 'positionY', value: 1.5, defaultValue: 0}],
		schema: {
			positionY: {
				type: 'number',
				default: 0,
				hiddenFromList: false,
			},
		},
		videoConfigValues: result.nodePath.videoConfigValues,
	});
	expect(updated.serialized).toContain('positionY={1.5}');
});

test('3D rotation and scale props can be written back as source edits', () => {
	const fileContents = `import {InteractiveThree} from '@remotion/three';
export const Scene = () => <InteractiveThree.Group
  name="Product"
  rotationX={0}
  rotationY={0}
  rotationZ={0}
  scaleX={1}
  scaleY={1}
  scaleZ={1}
/>;`;
	const result = computeSequencePropsSubscriptionFromContent({
		fileContents,
		absolutePath: '/project/src/Scene.tsx',
		line: 2,
		preferredNodePath: null,
		componentIdentity: 'dev.remotion.three.InteractiveThree.Group',
		keys: ['rotationX', 'rotationY', 'rotationZ', 'scaleX', 'scaleY', 'scaleZ'],
		effects: [],
		videoConfigValues: {
			durationInFrames: 120,
			fps: 30,
			height: 720,
			width: 1280,
		},
	});
	expect(result.success).toBe(true);
	if (!result.success || !result.status.canUpdate) {
		throw new Error('Expected editable 3D transform props');
	}

	expect(result.status.props.rotationY.status).toBe('static');
	expect(result.status.props.scaleZ.status).toBe('static');
	const updated = updateSequencePropsAst({
		input: fileContents,
		nodePath: result.nodePath.nodePath,
		updates: [
			{key: 'rotationY', value: 45, defaultValue: 0},
			{key: 'scaleZ', value: 1.5, defaultValue: 1},
		],
		schema: {
			rotationY: {type: 'rotation-degrees', default: 0},
			scaleZ: {type: 'number', default: 1, hiddenFromList: false},
		},
		videoConfigValues: result.nodePath.videoConfigValues,
	});
	expect(updated.serialized).toContain('rotationY={45}');
	expect(updated.serialized).toContain('scaleZ={1.5}');
});

test('3D rotation and scale edits can create keyframes in the source file', async () => {
	const input = `import {InteractiveThree} from '@remotion/three';
export const Scene = () => <InteractiveThree.Group rotationY={0} scaleZ={1} />;`;
	const result = computeSequencePropsSubscriptionFromContent({
		fileContents: input,
		absolutePath: '/project/src/Scene.tsx',
		line: 2,
		preferredNodePath: null,
		componentIdentity: 'dev.remotion.three.InteractiveThree.Group',
		keys: ['rotationY', 'scaleZ'],
		effects: [],
		videoConfigValues: {
			durationInFrames: 120,
			fps: 30,
			height: 720,
			width: 1280,
		},
	});
	if (!result.success) throw new Error('Expected 3D source node path');
	const updated = await updateSequenceKeyframes({
		input,
		nodePath: result.nodePath.nodePath,
		updates: [
			{key: 'rotationY', operation: {type: 'add', frame: 30, value: 45}},
			{key: 'scaleZ', operation: {type: 'add', frame: 30, value: 1.5}},
		],
		videoConfigValues: result.nodePath.videoConfigValues,
		schema: {
			rotationY: {type: 'rotation-degrees', default: 0},
			scaleZ: {type: 'number', default: 1, hiddenFromList: false},
		},
		formatFile: () => {
			throw new Error('Formatting fallback should be unnecessary');
		},
	});
	expect(updated.output).toContain('interpolate(');
	expect(updated.output).toContain('rotationY={');
	expect(updated.output).toContain('scaleZ={');
	expect(updated.output).toContain('[30]');
});
