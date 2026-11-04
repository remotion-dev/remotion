const makeComponent = ({
	filter,
	left,
	top,
	textTop,
}: {
	filter: string;
	left: number;
	top: number;
	textTop: number;
}): React.FC => {
	const Component: React.FC = () => {
		return (
			<div
				style={{
					width: 650,
					height: 370,
					position: 'relative',
					overflow: 'hidden',
					backgroundColor: '#182330',
				}}
			>
				<div
					style={{
						position: 'absolute',
						left,
						top,
						width: 585,
						height: 333,
						transform: 'scale(0.9, 0.9)',
						transformOrigin: '0 0',
					}}
				>
					<div
						style={{
							position: 'absolute',
							inset: 0,
							filter,
							overflow: 'hidden',
						}}
					>
						<div
							style={{
								position: 'absolute',
								left: 45,
								top: textTop,
								width: 300,
								height: 30,
								fontFamily: 'sans-serif',
								fontSize: 25,
								fontWeight: 400,
								lineHeight: 1.2,
								color: '#ffffff',
								backgroundColor: '#304355',
								textAlign: 'center',
							}}
						>
							Full turn 360
						</div>
					</div>
				</div>
			</div>
		);
	};

	return Component;
};

const base = {
	width: 650,
	height: 370,
	fps: 30,
	durationInFrames: 1,
} as const;

const directFilter = 'grayscale(1)';
const precomposedFilter = 'grayscale(1) drop-shadow(0px 0px 0px transparent)';

export const issue12604Direct = {
	...base,
	component: makeComponent({
		filter: directFilter,
		left: 33,
		top: 19,
		textTop: 220.24,
	}),
	id: 'issue-12604-direct',
} as const;

export const issue12604Precomposed = {
	...base,
	component: makeComponent({
		filter: precomposedFilter,
		left: 33,
		top: 19,
		textTop: 220.24,
	}),
	id: 'issue-12604-precomposed',
} as const;

export const issue12604DirectFractional = {
	...base,
	component: makeComponent({
		filter: directFilter,
		left: 32.5,
		top: 18.5,
		textTop: 219.68,
	}),
	id: 'issue-12604-direct-fractional',
} as const;

export const issue12604PrecomposedFractional = {
	...base,
	component: makeComponent({
		filter: precomposedFilter,
		left: 32.5,
		top: 18.5,
		textTop: 219.68,
	}),
	id: 'issue-12604-precomposed-fractional',
} as const;
