import {AbsoluteFill, Img, staticFile} from 'remotion';

const FilterImageBox: React.FC<{label: string; filter: string}> = ({
	label,
	filter,
}) => (
	<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
		<span style={{fontSize: 10, marginBottom: 4, color: '#333'}}>{label}</span>
		<Img
			src={staticFile('1.jpg')}
			style={{
				width: 80,
				height: 60,
				objectFit: 'cover',
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
				gap: 15,
				alignContent: 'flex-start',
			}}
		>
			<FilterImageBox label="blur(3px)" filter="blur(3px)" />
			<FilterImageBox label="brightness(1.5)" filter="brightness(1.5)" />
			<FilterImageBox label="contrast(200%)" filter="contrast(200%)" />
			<FilterImageBox
				label="drop-shadow"
				filter="drop-shadow(3px 3px 2px rgba(0,0,0,0.5))"
			/>
			<FilterImageBox label="grayscale(100%)" filter="grayscale(100%)" />
			<FilterImageBox label="hue-rotate(90deg)" filter="hue-rotate(90deg)" />
			<FilterImageBox label="invert(100%)" filter="invert(100%)" />
			<FilterImageBox label="opacity(50%)" filter="opacity(50%)" />
			<FilterImageBox label="saturate(200%)" filter="saturate(200%)" />
			<FilterImageBox label="sepia(100%)" filter="sepia(100%)" />
			<FilterImageBox
				label="combined"
				filter="blur(1px) brightness(1.2) saturate(1.5)"
			/>
			<FilterImageBox label="none" filter="none" />
		</AbsoluteFill>
	);
};

export const filterImage = {
	component: Component,
	id: 'filter-image',
	width: 500,
	height: 400,
	fps: 25,
	durationInFrames: 1,
} as const;
