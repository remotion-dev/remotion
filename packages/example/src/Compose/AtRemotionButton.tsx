import {AbsoluteFill} from 'remotion';

export const AtRemotionButton: React.FC<{progress: number}> = ({progress}) => {
	return (
		<AbsoluteFill className="bg-white justify-center items-center border-2 border-solid border-white rounded-full">
			<div
				className="text-black text-3xl font-brand"
				style={{
					fontFamily: 'GT Planar',
					opacity: 1.1 - progress * 3,
				}}
			>
				Follow @JNYBGR
			</div>
		</AbsoluteFill>
	);
};
