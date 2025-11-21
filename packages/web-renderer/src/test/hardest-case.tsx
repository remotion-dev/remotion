const Component: React.FC = () => {
	return (
		<div
			style={{
				position: 'absolute',
				inset: 0,
				width: '100%',
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
				transform: 'scale(0.5)',
				alignItems: 'center',
			}}
		>
			<svg
				width={100}
				height={100}
				viewBox={`0 0 104.39999999999999 104.39999999999999`}
				xmlns="http://www.w3.org/2000/svg"
				style={{
					transform: 'translateX(-150px)',
				}}
			>
				<path
					d="M 52.199999999999996 0 C 88.02637538443085 0 104.39999999999999 16.37362461556915 104.39999999999999 52.199999999999996 C 104.39999999999999 88.02637538443085 88.02637538443085 104.39999999999999 52.199999999999996 104.39999999999999 C 16.37362461556915 104.39999999999999 0 88.02637538443085 0 52.199999999999996 C 0 16.37362461556915 16.37362461556915 0 52.199999999999996 0 Z"
					fill="rgba(241, 60, 3, 1)"
				/>
			</svg>
		</div>
	);
};

export const hardestCase = {
	component: Component,
	id: 'hardest-case',
	width: 300,
	height: 300,
	fps: 30,
	durationInFrames: 100,
} as const;
