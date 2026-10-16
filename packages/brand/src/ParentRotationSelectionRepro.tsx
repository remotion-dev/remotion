import {CanvasImage, Composition, Interactive, registerRoot} from 'remotion';

export const ParentRotationSelectionRepro = () => {
	return (
		<div style={{position: 'absolute', inset: 0, perspective: 1800}}>
			<Interactive.Div
				name="Parent"
				style={{
					position: 'absolute',
					left: 240,
					top: 160,
					width: 800,
					height: 400,
					backgroundColor: '#334155',
					rotate: '1 -1 0 12deg',
				}}
			>
				<CanvasImage
					name="Child"
					src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='400'%3E%3Crect width='800' height='400' fill='%230b84ff'/%3E%3C/svg%3E"
					cropRight={0.35}
					style={{position: 'absolute', width: '100%', height: '100%'}}
				/>
			</Interactive.Div>
		</div>
	);
};

registerRoot(() => (
	<Composition
		id="ParentRotationSelectionRepro"
		component={ParentRotationSelectionRepro}
		width={1280}
		height={720}
		fps={30}
		durationInFrames={90}
	/>
));
