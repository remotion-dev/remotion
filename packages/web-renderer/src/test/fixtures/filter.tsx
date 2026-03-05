import {AbsoluteFill} from 'remotion';

const FilterBox: React.FC<{label: string; filter: string}> = ({
	label,
	filter,
}) => (
	<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
		<span style={{fontSize: 14, marginBottom: 6, color: '#333'}}>{label}</span>
		<div
			style={{
				backgroundColor: 'red',
				width: 80,
				height: 80,
				filter,
			}}
		/>
	</div>
);

const Component: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				backgroundColor: '#f0f0f0',
				padding: 20,
				display: 'flex',
				flexDirection: 'row',
				flexWrap: 'wrap',
				gap: 20,
				alignContent: 'flex-start',
			}}
		>
			<FilterBox label="blur(5px)" filter="blur(5px)" />
			<FilterBox label="brightness(1.5)" filter="brightness(1.5)" />
			<FilterBox label="contrast(200%)" filter="contrast(200%)" />
			<FilterBox
				label="drop-shadow"
				filter="drop-shadow(5px 5px 3px rgba(0,0,0,0.5))"
			/>
			<FilterBox label="grayscale(100%)" filter="grayscale(100%)" />
			<FilterBox label="hue-rotate(90deg)" filter="hue-rotate(90deg)" />
			<FilterBox label="invert(100%)" filter="invert(100%)" />
			<FilterBox label="opacity(50%)" filter="opacity(50%)" />
			<FilterBox label="saturate(200%)" filter="saturate(200%)" />
			<FilterBox label="sepia(100%)" filter="sepia(100%)" />
			<FilterBox
				label="combined"
				filter="blur(2px) brightness(1.2) contrast(150%)"
			/>
			<FilterBox label="none" filter="none" />
		</AbsoluteFill>
	);
};

export const filter = {
	component: Component,
	id: 'filter',
	width: 600,
	height: 500,
	fps: 25,
	durationInFrames: 1,
} as const;
