import {AbsoluteFill} from 'remotion';

const FilterTextBox: React.FC<{label: string; filter: string}> = ({
	label,
	filter,
}) => (
	<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
		<span style={{fontSize: 12, marginBottom: 4, color: '#666'}}>{label}</span>
		<span
			style={{
				fontSize: 24,
				fontWeight: 'bold',
				color: 'red',
				filter,
			}}
		>
			Text
		</span>
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
			<FilterTextBox label="blur(2px)" filter="blur(2px)" />
			<FilterTextBox label="brightness(1.5)" filter="brightness(1.5)" />
			<FilterTextBox label="contrast(200%)" filter="contrast(200%)" />
			<FilterTextBox
				label="drop-shadow"
				filter="drop-shadow(3px 3px 2px rgba(0,0,0,0.5))"
			/>
			<FilterTextBox label="grayscale(100%)" filter="grayscale(100%)" />
			<FilterTextBox label="hue-rotate(90deg)" filter="hue-rotate(90deg)" />
			<FilterTextBox label="invert(100%)" filter="invert(100%)" />
			<FilterTextBox label="opacity(50%)" filter="opacity(50%)" />
			<FilterTextBox label="saturate(200%)" filter="saturate(200%)" />
			<FilterTextBox label="sepia(100%)" filter="sepia(100%)" />
			<FilterTextBox
				label="combined"
				filter="blur(1px) brightness(1.2) contrast(150%)"
			/>
			<FilterTextBox label="none" filter="none" />
		</AbsoluteFill>
	);
};

export const filterText = {
	component: Component,
	id: 'filter-text',
	width: 600,
	height: 400,
	fps: 25,
	durationInFrames: 1,
} as const;
