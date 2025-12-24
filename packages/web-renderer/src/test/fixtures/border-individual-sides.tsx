import {AbsoluteFill} from 'remotion';

const Component: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
				gap: 20,
				flexDirection: 'row',
				flexWrap: 'wrap',
			}}
		>
			<div
				style={{
					width: 100,
					height: 100,
					backgroundColor: 'lavender',
					borderTop: '5px solid red',
					borderRight: '3px dashed blue',
					borderBottom: '2px dotted green',
					borderLeft: '4px solid purple',
					borderRadius: 15,
				}}
			/>
			<div
				style={{
					width: 100,
					height: 100,
					backgroundColor: 'lightcoral',
					borderTop: '8px solid navy',
					borderRight: 'none',
					borderBottom: '4px dashed teal',
					borderLeft: '6px dotted maroon',
				}}
			/>
			<div
				style={{
					width: 100,
					height: 100,
					backgroundColor: 'lightblue',
					borderTop: '0px',
					borderRight: '10px solid orange',
					borderBottom: '0px',
					borderLeft: '10px solid orange',
				}}
			/>
		</AbsoluteFill>
	);
};

export const borderIndividualSides = {
	component: Component,
	id: 'border-individual-sides',
	width: 400,
	height: 200,
	fps: 25,
	durationInFrames: 1,
} as const;
