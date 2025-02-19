export const StillZoom: React.FC = () => {
	return (
		<div
			style={{
				display: 'flex',
				flexWrap: 'wrap',
				background: '#ffffffaa',
			}}
		>
			{Array(396)
				.fill(null)
				.map((_, i) => (
					<div
						key={i}
						style={{
							width: '100px',
							height: '100px',
							outline: '1px solid rebeccapurple',
							fontSize: '3rem',
						}}
					>
						{i}
					</div>
				))}
		</div>
	);
};
