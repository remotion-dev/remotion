export const ControlsShowcase: React.FC = () => {
	return (
		<Sequence
			styleWhilePostmounted={{opacity: 0}}
			styleWhilePremounted={{opacity: 0}}
			layout={'none'}
		></Sequence>
	);
};
