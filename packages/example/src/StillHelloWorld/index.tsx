import {AbsoluteFill} from 'remotion';

export type StillHelloWorldType = {
	message: string;
};

export const StillHelloWorld: React.FC<StillHelloWorldType> = ({message}) => {
	return (
		<AbsoluteFill
			style={{
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				background: '#ffffffaa',
				fontSize: 100,
			}}
		>
			<div>{message}</div>
		</AbsoluteFill>
	);
};
