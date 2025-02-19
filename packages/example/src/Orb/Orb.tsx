import {ContactShadows, MeshDistortMaterial} from '@react-three/drei';

export const Orb = () => {
	return (
		<>
			<ambientLight intensity={2.5} />
			<pointLight position-z={-15} intensity={1} color="#F8C069" />
			<mesh>
				<sphereGeometry args={[1, 64, 64]} />
				<MeshDistortMaterial
					color="black"
					envMapIntensity={1}
					clearcoat={1}
					clearcoatRoughness={0}
					metalness={0.1}
					mass={2}
					tenstion={1000}
					friction={10}
				/>
			</mesh>
			<ContactShadows
				rotation={[Math.PI / 2, 0, 0]}
				position={[0, -1.6, 0]}
				opacity={0.8}
				width={15}
				height={15}
				blur={2.5}
				far={1.6}
				getObjectsByProperty={false}
				matrixWorldAutoUpdate={false}
			/>
		</>
	);
};
