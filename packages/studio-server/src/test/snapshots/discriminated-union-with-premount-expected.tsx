export const ControlsShowcase: React.FC = () => {
	return (
		<Sequence
			premountFor={25}
			styleWhilePostmounted={{opacity: 0}}
			styleWhilePremounted={{opacity: 0}}
			layout={'none'}
		></Sequence>
	);
};
