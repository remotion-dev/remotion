export const ControlsShowcase: React.FC = () => {
	return (
		<Sequence
			style={{opacity: 0.5}}
			premountFor={25}
			styleWhilePostmounted={{opacity: 0}}
			styleWhilePremounted={{opacity: 0}}
		></Sequence>
	);
};
