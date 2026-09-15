import type {ThreeElements} from '@react-three/fiber';
import React, {forwardRef} from 'react';
import {Interactive, Sequence} from 'remotion';
import type {Group} from 'three';

/* eslint-disable react/no-unknown-property -- position is an R3F group prop */

/* eslint-disable react/require-default-props -- optional position props default to the R3F origin */
type GroupProps = Omit<ThreeElements['group'], 'position'> & {
	readonly name?: string;
	readonly from?: number;
	readonly durationInFrames?: number;
	readonly showInTimeline?: boolean;
	readonly positionX?: number;
	readonly positionY?: number;
	readonly positionZ?: number;
};
/* eslint-enable react/require-default-props */

const positionSchema = {
	positionX: {
		type: 'number',
		default: 0,
		step: 0.1,
		description: 'Position X',
		hiddenFromList: false,
		keyframable: true,
	},
	positionY: {
		type: 'number',
		default: 0,
		step: 0.1,
		description: 'Position Y',
		hiddenFromList: false,
		keyframable: true,
	},
	positionZ: {
		type: 'number',
		default: 0,
		step: 0.1,
		description: 'Position Z',
		hiddenFromList: false,
		keyframable: true,
	},
} as const;

const GroupWithSequence = forwardRef<
	Group,
	GroupProps & {
		readonly controls: React.ComponentProps<typeof Sequence>['controls'];
	}
>(
	(
		{
			name,
			from,
			durationInFrames,
			showInTimeline,
			positionX = 0,
			positionY = 0,
			positionZ = 0,
			controls,
			children,
			...groupProps
		},
		ref,
	) => (
		<Sequence
			layout="none"
			name={name ?? '3D group'}
			from={from ?? 0}
			durationInFrames={durationInFrames}
			showInTimeline={showInTimeline}
			controls={controls}
		>
			<group
				{...groupProps}
				ref={ref}
				position={[positionX, positionY, positionZ]}
			>
				{children}
			</group>
		</Sequence>
	),
);

GroupWithSequence.displayName = 'InteractiveThree.Group';

/** Register an R3F group in the Studio timeline and edit its local position. */
export const InteractiveThree = {
	Group: Interactive.withSchema({
		Component: GroupWithSequence,
		componentName: '<InteractiveThree.Group>',
		componentIdentity: 'dev.remotion.three.InteractiveThree.Group',
		schema: positionSchema,
		supportsEffects: false,
	}) as React.ComponentType<GroupProps>,
};
