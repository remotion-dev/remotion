import type {ThreeElements} from '@react-three/fiber';
import {useThree} from '@react-three/fiber';
import React, {forwardRef, useEffect, useMemo, useRef} from 'react';
import {Interactive, Sequence, type _InternalTypes} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import {Box3, Vector3, type Group} from 'three';

type CustomSequenceOutline = _InternalTypes['CustomSequenceOutline'];
type CustomSequenceValueChange = _InternalTypes['CustomSequenceValueChange'];

/* eslint-disable react/no-unknown-property, react/require-default-props -- R3F group props are passed through and optional props have defaults at the render boundary */

type GroupProps = Omit<
	ThreeElements['group'],
	'position' | 'rotation' | 'scale'
> & {
	readonly name?: string;
	readonly from?: number;
	readonly durationInFrames?: number;
	readonly showInTimeline?: boolean;
	readonly positionX?: number;
	readonly positionY?: number;
	readonly positionZ?: number;
	readonly rotationX?: number;
	readonly rotationY?: number;
	readonly rotationZ?: number;
	readonly scale?: number | string | readonly number[];
};

type InteractiveThreeGroupComponent = {
	(
		props: Omit<GroupProps, 'scale'> & {readonly scale?: number},
	): React.ReactNode;
	(props: GroupProps): React.ReactNode;
};

type OutlineBridge = {
	measure: CustomSequenceOutline['measure'];
	setSelected: CustomSequenceOutline['setSelected'];
	notifyOutlineChange: () => void;
	notifyValueChange: (change: CustomSequenceValueChange) => void;
	getValues: () => Readonly<Record<string, unknown>>;
	getLocalAxes: () => NonNullable<
		CustomSequenceOutline['positionControls']
	>['getLocalAxes'] extends () => infer Result
		? Result
		: never;
};

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
	rotationX: {
		type: 'number',
		default: 0,
		step: 1,
		description: 'Rotation X',
		hiddenFromList: false,
		keyframable: true,
	},
	rotationY: {
		type: 'number',
		default: 0,
		step: 1,
		description: 'Rotation Y',
		hiddenFromList: false,
		keyframable: true,
	},
	rotationZ: {
		type: 'number',
		default: 0,
		step: 1,
		description: 'Rotation Z',
		hiddenFromList: false,
		keyframable: true,
	},
	scale: {
		type: 'scale',
		dimensions: 3,
		default: 1,
		min: 0.01,
		step: 0.01,
		description: 'Scale',
		hiddenFromList: false,
		keyframable: true,
	},
} as const;

const corners = [
	[-1, -1, -1],
	[-1, -1, 1],
	[-1, 1, -1],
	[-1, 1, 1],
	[1, -1, -1],
	[1, -1, 1],
	[1, 1, -1],
	[1, 1, 1],
] as const;

const ThreeGroupObject = forwardRef<
	Group,
	GroupProps & {readonly outlineBridge: React.MutableRefObject<OutlineBridge>}
>(
	(
		{
			positionX = 0,
			positionY = 0,
			positionZ = 0,
			rotationX = 0,
			rotationY = 0,
			rotationZ = 0,
			scale = 1,
			children,
			outlineBridge,
			...props
		},
		ref,
	) => {
		const objectRef = useRef<Group>(null);
		const {camera, gl} = useThree();

		outlineBridge.current.measure = () => {
			const object = objectRef.current;
			if (object === null) return null;
			const box = new Box3().setFromObject(object);
			if (box.isEmpty()) return null;
			const canvasRect = gl.domElement.getBoundingClientRect();
			const projected = corners.map(([x, y, z]) => {
				const point = new Vector3(
					x < 0 ? box.min.x : box.max.x,
					y < 0 ? box.min.y : box.max.y,
					z < 0 ? box.min.z : box.max.z,
				).project(camera);
				return {
					x: canvasRect.left + ((point.x + 1) / 2) * canvasRect.width,
					y: canvasRect.top + ((1 - point.y) / 2) * canvasRect.height,
				};
			});
			const xs = projected.map((point) => point.x);
			const ys = projected.map((point) => point.y);
			const left = Math.min(...xs);
			const right = Math.max(...xs);
			const top = Math.min(...ys);
			const bottom = Math.max(...ys);
			return {
				points: [
					{x: left, y: top},
					{x: right, y: top},
					{x: right, y: bottom},
					{x: left, y: bottom},
				],
				dimensions: {width: right - left, height: bottom - top},
			};
		};

		outlineBridge.current.setSelected = () => undefined;
		outlineBridge.current.getLocalAxes = () => {
			const object = objectRef.current;
			if (object === null || object.parent === null) {
				return {originOffset: {x: 0, y: 0}, x: null, y: null, z: null};
			}

			object.updateWorldMatrix(true, false);
			camera.updateWorldMatrix(true, false);
			const canvasRect = gl.domElement.getBoundingClientRect();
			const project = (point: Vector3) => {
				const projected = point.clone().project(camera);
				return {
					x: ((projected.x + 1) / 2) * canvasRect.width,
					y: ((1 - projected.y) / 2) * canvasRect.height,
				};
			};

			const worldOrigin = object.getWorldPosition(new Vector3());
			const screenOrigin = project(worldOrigin);
			const box = new Box3().setFromObject(object);
			const boxPoints = corners.map(([x, y, z]) =>
				project(
					new Vector3(
						x < 0 ? box.min.x : box.max.x,
						y < 0 ? box.min.y : box.max.y,
						z < 0 ? box.min.z : box.max.z,
					),
				),
			);
			const boxXs = boxPoints.map((point) => point.x);
			const boxYs = boxPoints.map((point) => point.y);
			const boxCenter = {
				x: (Math.min(...boxXs) + Math.max(...boxXs)) / 2,
				y: (Math.min(...boxYs) + Math.max(...boxYs)) / 2,
			};
			const epsilon = 0.1;
			const axis = (localAxis: Vector3) => {
				const directionInParent = localAxis.applyQuaternion(object.quaternion);
				const parentPoint = object.position
					.clone()
					.addScaledVector(directionInParent, epsilon);
				const worldPoint = object.parent!.localToWorld(parentPoint);
				const screenPoint = project(worldPoint);
				const screenX = screenPoint.x - screenOrigin.x;
				const screenY = screenPoint.y - screenOrigin.y;
				const screenLength = Math.hypot(screenX, screenY);
				if (!Number.isFinite(screenLength) || screenLength < 0.001) return null;
				const parentUnitsPerPixel = epsilon / screenLength;
				return {
					screenDirection: {
						x: screenX / screenLength,
						y: screenY / screenLength,
					},
					positionDeltaPerPixel: [
						directionInParent.x * parentUnitsPerPixel,
						directionInParent.y * parentUnitsPerPixel,
						directionInParent.z * parentUnitsPerPixel,
					] as const,
				};
			};

			return {
				originOffset: {
					x: screenOrigin.x - boxCenter.x,
					y: screenOrigin.y - boxCenter.y,
				},
				x: axis(new Vector3(1, 0, 0)),
				y: axis(new Vector3(0, 1, 0)),
				z: axis(new Vector3(0, 0, 1)),
			};
		};

		outlineBridge.current.getValues = () => ({
			positionX,
			positionY,
			positionZ,
			rotationX,
			rotationY,
			rotationZ,
			scale,
		});

		useEffect(() => {
			outlineBridge.current.notifyOutlineChange();
		}, [
			outlineBridge,
			positionX,
			positionY,
			positionZ,
			rotationX,
			rotationY,
			rotationZ,
			scale,
		]);

		const setRef = (object: Group | null) => {
			objectRef.current = object;
			if (typeof ref === 'function') ref(object);
			else if (ref) ref.current = object;
		};

		const parsedScale = NoReactInternals.parseScaleValue(scale, 3);

		return (
			<group
				{...props}
				ref={setRef}
				position={[positionX, positionY, positionZ]}
				rotation={[
					(rotationX * Math.PI) / 180,
					(rotationY * Math.PI) / 180,
					(rotationZ * Math.PI) / 180,
				]}
				scale={parsedScale}
			>
				{children}
			</group>
		);
	},
);

ThreeGroupObject.displayName = 'InteractiveThree.GroupObject';

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
			controls,
			children,
			...groupProps
		},
		ref,
	) => {
		const outlineBridge = useRef<OutlineBridge>({
			measure: () => null,
			setSelected: () => undefined,
			notifyOutlineChange: () => undefined,
			notifyValueChange: () => undefined,
			getValues: () => ({}),
			getLocalAxes: () => ({
				originOffset: {x: 0, y: 0},
				x: null,
				y: null,
				z: null,
			}),
		});
		const outlineRef = useRef<CustomSequenceOutline | null>(null);
		const customOutline = useMemo<CustomSequenceOutline>(() => {
			const listeners = new Set<() => void>();
			const valueListeners = new Set<
				(change: CustomSequenceValueChange) => void
			>();
			outlineBridge.current.notifyOutlineChange = () => {
				for (const listener of listeners) listener();
			};

			outlineBridge.current.notifyValueChange = (change) => {
				for (const listener of valueListeners) listener(change);
			};

			return {
				type: 'custom',
				positionControls: {
					position: {x: 'positionX', y: 'positionY', z: 'positionZ'},
					rotation: {x: 'rotationX', y: 'rotationY', z: 'rotationZ'},
					scale: 'scale',
					getLocalAxes: () => outlineBridge.current.getLocalAxes(),
					getValues: () => outlineBridge.current.getValues(),
					requestValueChange: (change) =>
						outlineBridge.current.notifyValueChange(change),
				},
				measure: () => outlineBridge.current.measure(),
				setSelected: (value) => outlineBridge.current.setSelected(value),
				subscribeToOutlineChanges: (listener) => {
					listeners.add(listener);
					return () => listeners.delete(listener);
				},
				subscribeToValueChanges: (listener) => {
					valueListeners.add(listener);
					return () => valueListeners.delete(listener);
				},
			};
		}, []);
		outlineRef.current = customOutline;

		return (
			<Sequence
				layout="none"
				name={name ?? '3D group'}
				from={from ?? 0}
				durationInFrames={durationInFrames}
				showInTimeline={showInTimeline}
				controls={controls}
				_remotionInternalCustomOutlineRef={outlineRef}
			>
				<ThreeGroupObject
					{...groupProps}
					ref={ref}
					outlineBridge={outlineBridge}
				>
					{children}
				</ThreeGroupObject>
			</Sequence>
		);
	},
);

GroupWithSequence.displayName = 'InteractiveThree.Group';

export const InteractiveThree = {
	Group: Interactive.withSchema({
		Component: GroupWithSequence,
		componentName: '<InteractiveThree.Group>',
		componentIdentity: 'dev.remotion.three.InteractiveThree.Group',
		schema: positionSchema,
		supportsEffects: false,
	}) as InteractiveThreeGroupComponent,
};
