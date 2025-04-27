import {AbsoluteFill, Img} from 'remotion';

const edgeBlurWithOffset = (offset: number): React.CSSProperties => {
	return {
		backdropFilter: `blur(${offset}px)`,
		inset: offset,
		width: `calc(100% - ${offset * 2}px)`,
		height: `calc(100% - ${offset * 2}px)`,
	};
};

export const EdgeBlur: React.FC = () => {
	return (
		<AbsoluteFill>
			<Img src="https://images.pexels.com/photos/8361426/pexels-photo-8361426.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" />
			<AbsoluteFill
				style={{
					clipPath: `inset(${40}px ${40}px ${40}px ${40}px)`,
				}}
			>
				<AbsoluteFill
					style={{
						position: 'relative',
					}}
				>
					<Img src="https://images.pexels.com/photos/8361426/pexels-photo-8361426.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" />
					<AbsoluteFill
						style={{
							backgroundColor: `rgba(255,255,255, 0.5)`,
							inset: 40,
							...edgeBlurWithOffset(200),
						}}
					></AbsoluteFill>
				</AbsoluteFill>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
