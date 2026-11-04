import {Outlines, TransformControls} from '@react-three/drei';
import {ThreeCanvas} from '@remotion/three';
import React, {createContext, useContext, useRef, useState} from 'react';
import {
	Interactive,
	interpolate,
	Sequence,
	type SequenceControls,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import type {Group} from 'three';

const schema = {
	positionX: {
		type: 'number',
		default: 0,
		step: 0.1,
		description: 'Position X',
		hiddenFromList: false,
	},
	positionY: {
		type: 'number',
		default: 0,
		step: 0.1,
		description: 'Position Y',
		hiddenFromList: false,
	},
	positionZ: {
		type: 'number',
		default: 0,
		step: 0.1,
		description: 'Position Z',
		hiddenFromList: false,
	},
	rotationX: {
		type: 'number',
		default: 0,
		step: 1,
		description: 'Rotation X',
		hiddenFromList: false,
	},
	rotationY: {
		type: 'number',
		default: 0,
		step: 1,
		description: 'Rotation Y',
		hiddenFromList: false,
	},
	rotationZ: {
		type: 'number',
		default: 0,
		step: 1,
		description: 'Rotation Z',
		hiddenFromList: false,
	},
	scale: {
		type: 'number',
		default: 1,
		min: 0.05,
		step: 0.01,
		description: 'Scale',
		hiddenFromList: false,
	},
} as const;

type TransformProps = {
	readonly positionX?: number;
	readonly positionY?: number;
	readonly positionZ?: number;
	readonly rotationX?: number;
	readonly rotationY?: number;
	readonly rotationZ?: number;
	readonly scale?: number;
	readonly children: React.ReactNode;
};

const MODES = ['translate', 'rotate', 'scale'] as const;
const DEG = 180 / Math.PI;
const round = (value: number) => Math.round(value * 1000) / 1000;

const HighlightContext = createContext<'selected' | 'hovered' | null>(null);

const SelectionOutline: React.FC = () => {
	const highlight = useContext(HighlightContext);
	return highlight === null ? null : (
		<Outlines
			thickness={highlight === 'selected' ? 4 : 2}
			color={highlight === 'selected' ? '#0b84f3' : '#ffffff'}
		/>
	);
};

const GroupObject: React.FC<TransformProps> = ({
	positionX = 0,
	positionY = 0,
	positionZ = 0,
	rotationX = 0,
	rotationY = 0,
	rotationZ = 0,
	scale = 1,
	children,
}) => {
	const editor = Interactive.useEditor<typeof schema>();
	const groupRef = useRef<Group>(null);
	const [mode, setMode] = useState<(typeof MODES)[number]>('translate');

	// TransformControls moves the object directly.
	const readValues = () => {
		const object = groupRef.current!;
		if (mode === 'translate') {
			return {
				positionX: round(object.position.x),
				positionY: round(object.position.y),
				positionZ: round(object.position.z),
			};
		}

		if (mode === 'scale') {
			return {
				scale: Math.max(
					schema.scale.min,
					round((object.scale.x + object.scale.y + object.scale.z) / 3),
				),
			};
		}

		// The same orientation has two Euler XYZ forms, and three.js keeps Y
		// within ±90°.
		const {x, y, z} = object.rotation;
		const near = (angle: number, target: number) =>
			angle + Math.round((target - angle) / 360) * 360;
		const [rx, ry, rz] = [
			[x * DEG, y * DEG, z * DEG],
			[x * DEG + 180, 180 - y * DEG, z * DEG + 180],
		]
			.map(([a, b, c]) => [
				near(a, rotationX),
				near(b, rotationY),
				near(c, rotationZ),
			])
			.sort(
				(p, q) =>
					Math.abs(p[0] - rotationX) +
					Math.abs(p[1] - rotationY) +
					Math.abs(p[2] - rotationZ) -
					(Math.abs(q[0] - rotationX) +
						Math.abs(q[1] - rotationY) +
						Math.abs(q[2] - rotationZ)),
			)[0];
		return {
			rotationX: round(rx),
			rotationY: round(ry),
			rotationZ: round(rz),
		};
	};

	return (
		<HighlightContext.Provider
			value={editor.selected ? 'selected' : editor.hovered ? 'hovered' : null}
		>
			<group
				ref={groupRef}
				position={[positionX, positionY, positionZ]}
				rotation={[rotationX / DEG, rotationY / DEG, rotationZ / DEG]}
				scale={scale}
				onPointerDown={(e) => {
					e.stopPropagation();
					editor.select();
				}}
				onDoubleClick={(e) => {
					e.stopPropagation();
					setMode((m) => MODES[(MODES.indexOf(m) + 1) % MODES.length]);
				}}
				onPointerOver={(e) => {
					e.stopPropagation();
					editor.setHovered(true);
				}}
				onPointerOut={() => editor.setHovered(false)}
			>
				{children}
			</group>
			{editor.selected ? (
				<TransformControls
					object={groupRef as React.RefObject<Group>}
					mode={mode}
					size={0.8}
					onMouseDown={() => editor.start()}
					onObjectChange={() => editor.preview(readValues())}
					onMouseUp={() => editor.commit()}
				/>
			) : null}
		</HighlightContext.Provider>
	);
};

const GroupWithSequence: React.FC<
	TransformProps & {readonly name?: string} & {
		readonly controls: SequenceControls | undefined;
	}
> = ({name, controls, ...props}) => {
	return (
		<Sequence layout="none" name={name ?? '3D group'} controls={controls}>
			<GroupObject {...props} />
		</Sequence>
	);
};

const TransformGroup = Interactive.withSchema({
	Component: GroupWithSequence,
	componentName: '<TransformGroup>',
	schema,
	supportsEffects: false,
});

export const ThreeEditor: React.FC = () => {
	const {width, height} = useVideoConfig();
	const frame = useCurrentFrame();
	return (
		<ThreeCanvas
			width={width}
			height={height}
			style={{backgroundColor: '#0f1115'}}
			camera={{fov: 45, position: [5, 4, 8]}}
		>
			<ambientLight intensity={0.6} />
			<directionalLight position={[5, 8, 5]} intensity={2} />
			<gridHelper args={[12, 12, '#3a3f4b', '#23262d']} />
			<TransformGroup
				name="Cube"
				positionX={-1.8}
				positionY={0.8}
				positionZ={3.644}
				rotationX={0}
				rotationY={25}
				rotationZ={0}
				scale={1}
			>
				<mesh>
					<boxGeometry args={[1.4, 1.4, 1.4]} />
					<meshStandardMaterial color="#8b5cf6" roughness={0.35} />
					<SelectionOutline />
				</mesh>
			</TransformGroup>
			<TransformGroup
				name="Cone"
				positionX={1.8}
				positionY={interpolate(frame, [0, 60, 119], [0.8, 1.6, 0.8])}
				positionZ={0.827}
				rotationX={0}
				rotationY={interpolate(frame, [0, 119], [0, 180])}
				rotationZ={0}
				scale={1}
			>
				<mesh>
					<coneGeometry args={[0.8, 1.6, 4]} />
					<meshStandardMaterial color="#f97316" roughness={0.35} />
					<SelectionOutline />
				</mesh>
			</TransformGroup>
		</ThreeCanvas>
	);
};
