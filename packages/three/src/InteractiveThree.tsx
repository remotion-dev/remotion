import type {ThreeElements} from '@react-three/fiber';
import {useThree} from '@react-three/fiber';
import React, {
	forwardRef,
	useContext,
	useEffect,
	useRef,
	useState,
	useSyncExternalStore,
} from 'react';
import {
	Interactive,
	Internals,
	Sequence,
	useCurrentFrame,
	useRemotionEnvironment,
} from 'remotion';
import type {Group} from 'three';
import type {TransformControls} from 'three/examples/jsm/controls/TransformControls.js';
import {continuousEuler} from './continuous-euler';

/* eslint-disable react/no-unknown-property -- position is an R3F group prop */

/* eslint-disable react/require-default-props -- optional position props default to the R3F origin */
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
	readonly scaleX?: number;
	readonly scaleY?: number;
	readonly scaleZ?: number;
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
	rotationX: {
		type: 'rotation-degrees',
		default: 0,
		step: 1,
		description: 'Rotation X',
		keyframable: true,
	},
	rotationY: {
		type: 'rotation-degrees',
		default: 0,
		step: 1,
		description: 'Rotation Y',
		keyframable: true,
	},
	rotationZ: {
		type: 'rotation-degrees',
		default: 0,
		step: 1,
		description: 'Rotation Z',
		keyframable: true,
	},
	scaleX: {
		type: 'number',
		default: 1,
		min: 0.001,
		step: 0.01,
		description: 'Scale X',
		hiddenFromList: false,
		keyframable: true,
	},
	scaleY: {
		type: 'number',
		default: 1,
		min: 0.001,
		step: 0.01,
		description: 'Scale Y',
		hiddenFromList: false,
		keyframable: true,
	},
	scaleZ: {
		type: 'number',
		default: 1,
		min: 0.001,
		step: 0.01,
		description: 'Scale Z',
		hiddenFromList: false,
		keyframable: true,
	},
} as const;

const RAD_TO_DEG = 180 / Math.PI;

const ThreeGroupObject = forwardRef<
	Group,
	GroupProps & {readonly sourceFrame: number}
>(
	(
		{
			positionX = 0,
			positionY = 0,
			positionZ = 0,
			rotationX = 0,
			rotationY = 0,
			rotationZ = 0,
			scaleX = 1,
			scaleY = 1,
			scaleZ = 1,
			sourceFrame,
			children,
			...props
		},
		ref,
	) => {
		const objectRef = useRef<Group>(null);
		const controlsRef = useRef<TransformControls | null>(null);
		const [TransformControlsClass, setTransformControlsClass] = useState<
			typeof TransformControls | null
		>(null);
		const sourceFrameRef = useRef(sourceFrame);
		sourceFrameRef.current = sourceFrame;
		const sequence = useContext(Internals.SequenceContext);
		const sequenceId = sequence?.id ?? null;
		const editor = useSyncExternalStore(
			Internals.ThreeEditorStore.subscribe,
			Internals.ThreeEditorStore.getSnapshot,
		);
		const {scene, camera, gl, invalidate} = useThree();
		const {isStudio, isRendering} = useRemotionEnvironment();
		const selected =
			isStudio &&
			!isRendering &&
			sequenceId !== null &&
			editor.selectedSequenceId === sequenceId &&
			editor.availableModes.includes(editor.mode);

		useEffect(() => {
			if (!selected || TransformControlsClass) return;
			let active = true;
			import('three/examples/jsm/controls/TransformControls.js').then(
				({TransformControls: Controls}) => {
					if (active) setTransformControlsClass(() => Controls);
				},
			);
			return () => {
				active = false;
			};
		}, [selected, TransformControlsClass]);

		useEffect(() => {
			if (!isStudio || isRendering || sequenceId === null) return;
			return Internals.ThreeEditorStore.register(sequenceId);
		}, [isRendering, isStudio, sequenceId]);

		useEffect(() => {
			if (
				!selected ||
				!TransformControlsClass ||
				!objectRef.current ||
				sequenceId === null
			)
				return;
			const object = objectRef.current;
			const controls = new TransformControlsClass(camera, gl.domElement);
			controls.attach(object);
			controls.setSpace('local');
			const helper = controls.getHelper();
			scene.add(helper);
			const readTransform = () => ({
				position: object.position.toArray() as [number, number, number],
				rotation: [object.rotation.x, object.rotation.y, object.rotation.z] as [
					number,
					number,
					number,
				],
				scale: object.scale.toArray() as [number, number, number],
			});
			let didChange = false;
			let pointerX = 0;
			let pointerY = 0;
			let startPointerX = 0;
			let startPointerY = 0;
			const scaleAtMouseDown = object.scale.clone();
			const rotationAtMouseDown = object.rotation.clone();
			const onMouseDown = () => {
				didChange = false;
				scaleAtMouseDown.copy(object.scale);
				rotationAtMouseDown.copy(object.rotation);
				startPointerX = pointerX;
				startPointerY = pointerY;
			};

			const onChange = () => invalidate();
			const onObjectChange = () => {
				didChange = true;
				if (controls.mode === 'rotate') {
					const next = continuousEuler(
						[object.rotation.x, object.rotation.y, object.rotation.z],
						[
							rotationAtMouseDown.x,
							rotationAtMouseDown.y,
							rotationAtMouseDown.z,
						],
					);
					object.rotation.set(...next);
				} else if (controls.mode === 'scale') {
					const axis = controls.axis ?? 'XYZ';
					const rawFactor =
						axis === 'XYZ'
							? Math.exp(
									(pointerX - startPointerX - (pointerY - startPointerY)) *
										0.006,
								)
							: (() => {
									const axisIndex = axis.includes('X')
										? 0
										: axis.includes('Y')
											? 1
											: 2;
									return (
										object.scale.getComponent(axisIndex) /
										scaleAtMouseDown.getComponent(axisIndex)
									);
								})();
					const minimumFactor = Math.max(
						0.1,
						0.001 / Math.min(...scaleAtMouseDown.toArray()),
					);
					const factor = Math.min(
						10,
						Math.max(minimumFactor, Number.isFinite(rawFactor) ? rawFactor : 1),
					);
					object.scale.copy(scaleAtMouseDown).multiplyScalar(factor);
				}

				Internals.ThreeEditorStore.preview(
					sequenceId,
					controls.mode,
					readTransform(),
					sourceFrameRef.current,
				);
			};

			const onMouseUp = () => {
				if (!didChange) return;
				didChange = false;
				Internals.ThreeEditorStore.commit(
					sequenceId,
					controls.mode,
					readTransform(),
					sourceFrameRef.current,
				);
			};

			controls.addEventListener('change', onChange);
			controls.addEventListener('mouseDown', onMouseDown);
			controls.addEventListener('objectChange', onObjectChange);
			controls.addEventListener('mouseUp', onMouseUp);
			const onPointerDownCapture = (event: PointerEvent) => {
				pointerX = event.clientX;
				pointerY = event.clientY;
			};

			const onPointerMoveCapture = (event: PointerEvent) => {
				pointerX = event.clientX;
				pointerY = event.clientY;
			};

			const onCanvasPointerDown = (event: PointerEvent) => {
				if (controls.dragging) event.stopPropagation();
			};

			gl.domElement.addEventListener('pointerdown', onPointerDownCapture, true);
			gl.domElement.addEventListener('pointermove', onPointerMoveCapture, true);
			gl.domElement.addEventListener('pointerdown', onCanvasPointerDown);
			controlsRef.current = controls;
			return () => {
				gl.domElement.removeEventListener(
					'pointerdown',
					onPointerDownCapture,
					true,
				);
				gl.domElement.removeEventListener(
					'pointermove',
					onPointerMoveCapture,
					true,
				);
				gl.domElement.removeEventListener('pointerdown', onCanvasPointerDown);
				controls.removeEventListener('change', onChange);
				controls.removeEventListener('mouseDown', onMouseDown);
				controls.removeEventListener('objectChange', onObjectChange);
				controls.removeEventListener('mouseUp', onMouseUp);
				scene.remove(helper);
				controls.detach();
				controls.dispose();
				controlsRef.current = null;
			};
		}, [
			TransformControlsClass,
			camera,
			gl.domElement,
			invalidate,
			scene,
			selected,
			sequenceId,
		]);

		useEffect(() => {
			controlsRef.current?.setMode(editor.mode);
			controlsRef.current?.setSize(editor.mode === 'scale' ? 1.45 : 1);
		}, [TransformControlsClass, editor.mode, selected]);

		const setRef = (object: Group | null) => {
			objectRef.current = object;
			if (typeof ref === 'function') ref(object);
			else if (ref) ref.current = object;
		};

		return (
			<>
				<group
					{...props}
					ref={setRef}
					position={[positionX, positionY, positionZ]}
					rotation={[
						rotationX / RAD_TO_DEG,
						rotationY / RAD_TO_DEG,
						rotationZ / RAD_TO_DEG,
					]}
					scale={[scaleX, scaleY, scaleZ]}
					onClick={(event) => {
						event.stopPropagation();
						if (isStudio && !isRendering && sequenceId !== null) {
							Internals.ThreeEditorStore.requestSelect(sequenceId);
						}
					}}
				>
					{children}
				</group>
				{selected && editor.referencePosition ? (
					<>
						<mesh position={[...editor.referencePosition]}>
							<sphereGeometry args={[0.06, 10, 8]} />
							<meshBasicMaterial color="#f59e0b" depthTest={false} />
						</mesh>
						<line>
							<bufferGeometry>
								<bufferAttribute
									attach="attributes-position"
									args={[
										new Float32Array([
											...editor.referencePosition,
											positionX,
											positionY,
											positionZ,
										]),
										3,
									]}
								/>
							</bufferGeometry>
							<lineBasicMaterial color="#f59e0b" depthTest={false} />
						</line>
					</>
				) : null}
			</>
		);
	},
);

ThreeGroupObject.displayName = 'InteractiveThree.GroupObject';

const SourceFrameGroup = forwardRef<Group, GroupProps>((props, ref) => {
	const sourceFrame = useCurrentFrame();
	return <ThreeGroupObject {...props} ref={ref} sourceFrame={sourceFrame} />;
});

SourceFrameGroup.displayName = 'InteractiveThree.SourceFrameGroup';

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
			rotationX = 0,
			rotationY = 0,
			rotationZ = 0,
			scaleX = 1,
			scaleY = 1,
			scaleZ = 1,
			controls,
			children,
			...groupProps
		},
		ref,
	) => {
		return (
			<Sequence
				layout="none"
				name={name ?? '3D group'}
				from={from ?? 0}
				durationInFrames={durationInFrames}
				showInTimeline={showInTimeline}
				controls={controls}
			>
				<SourceFrameGroup
					{...groupProps}
					ref={ref}
					positionX={positionX}
					positionY={positionY}
					positionZ={positionZ}
					rotationX={rotationX}
					rotationY={rotationY}
					rotationZ={rotationZ}
					scaleX={scaleX}
					scaleY={scaleY}
					scaleZ={scaleZ}
				>
					{children}
				</SourceFrameGroup>
			</Sequence>
		);
	},
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
