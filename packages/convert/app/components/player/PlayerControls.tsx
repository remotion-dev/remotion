export const PlayerControls: React.FC<{
	play: () => void;
}> = ({play}) => {
	return (
		<div
			style={{
				backgroundColor: 'red',
				width: '100%',
				height: 100,
				position: 'absolute',
				bottom: 0,
			}}
		>
			<button type="button" onClick={play}>
				play
			</button>
		</div>
	);
};
