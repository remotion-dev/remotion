import {AbsoluteFill} from 'remotion';

export const AtRemotionButton: React.FC = () => {
	return (
		<AbsoluteFill className="bg-black justify-center items-center border-2 border-solid border-white rounded-full">
			<div
				className="text-white text-3xl font-brand"
				style={{
					fontFamily: 'GT Planar',
				}}
			>
				@remotion
			</div>
		</AbsoluteFill>
	);
};
