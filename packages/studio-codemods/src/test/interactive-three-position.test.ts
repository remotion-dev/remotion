import {expect, test} from 'bun:test';
import {computeSequencePropsSubscriptionFromContent} from '../sequence-props';
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
