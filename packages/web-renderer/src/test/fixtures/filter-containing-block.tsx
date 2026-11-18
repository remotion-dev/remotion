import {AbsoluteFill, useCurrentFrame} from 'remotion';
// PR #13037: the filter itself establishes the containing block.
const ContainingBlockComponent = () => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill style={{background: 'white'}}>
			{(['absolute', 'fixed'] as const).map((position) => (
				<div
					key={position}
					style={{position: 'relative', width: 400, height: 200}}
				>
					<div
						style={{
							marginLeft: 100,
							width: 100,
							height: 80,
							filter: 'drop-shadow(0 0 0 red)',
						}}
					>
						<div
							style={{
								position,
								left: 10 + frame * 4,
								top: 10,
								width: 20,
								height: 20,
								background: 'red',
							}}
						/>
					</div>
				</div>
			))}
		</AbsoluteFill>
	);
};

export const filterContainingBlockReference = {
	component: ContainingBlockComponent,
	id: 'filter-containing-block',
	width: 400,
	height: 400,
	fps: 30,
	durationInFrames: 2,
} as const;
