import {AbsoluteFill} from 'remotion';

const FilterBox: React.FC<{label: string; filterValue: string}> = ({
	label,
	filterValue,
}) => (
	<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
		<span style={{fontSize: 14, marginBottom: 6, color: '#333'}}>{label}</span>
		<div
			style={{
				backgroundColor: 'red',
				width: 80,
				height: 80,
				filter: filterValue,
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
			<FilterBox label="blur(5px)" filterValue="blur(5px)" />
			<FilterBox label="brightness(1.5)" filterValue="brightness(1.5)" />
			<FilterBox label="contrast(200%)" filterValue="contrast(200%)" />
			<FilterBox
				label="drop-shadow"
				filterValue="drop-shadow(5px 5px 3px rgba(0,0,0,0.5))"
			/>
			<FilterBox label="grayscale(100%)" filterValue="grayscale(100%)" />
			<FilterBox label="hue-rotate(90deg)" filterValue="hue-rotate(90deg)" />
			<FilterBox label="invert(100%)" filterValue="invert(100%)" />
			<FilterBox label="opacity(50%)" filterValue="opacity(50%)" />
			<FilterBox label="saturate(200%)" filterValue="saturate(200%)" />
			<FilterBox label="sepia(100%)" filterValue="sepia(100%)" />
			<FilterBox
				label="combined"
				filterValue="blur(2px) brightness(1.2) contrast(150%)"
			/>
			<FilterBox label="none" filterValue="none" />
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
