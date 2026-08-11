import {AbsoluteFill} from 'remotion';

export const AtRemotionButton: React.FC<{progress: number}> = () => {
	return (
		<AbsoluteFill className="bg-white justify-center items-center border-2 border-solid border-white rounded-full">
			<div
				className="text-black text-[42px] font-brand"
				style={{
					fontFamily: 'GT Planar',
					fontWeight: 'bold',
				}}
			>
				@remotion
			</div>
		</AbsoluteFill>
	);
};
