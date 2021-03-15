import {useCurrentFrame} from 'remotion';

export const Framer: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<div
			style={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				background: 'white',
				flex: 1,
			}}
		>
			<h1 style={{fontSize: 120}}>{frame}</h1>
		</div>
	);
};
