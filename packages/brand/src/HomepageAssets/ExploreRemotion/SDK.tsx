import {AbsoluteFill, Img} from 'remotion';
import {EXPLORE_CAMERA_ANGLE} from './camera-angle';

export const ExploreRemotionSDK = () => {
	return (
		<AbsoluteFill style={{backgroundColor: '#24292e'}}>
			<div
				style={{
					position: 'absolute',
					inset: 0,
					rotate: EXPLORE_CAMERA_ANGLE,
				}}
			>
				<Img
					src="https://remotion.media/explore-remotion/sdk-monaco-github-dark-f706ff491f04.png"
					style={{
						position: 'absolute',
						left: 115,
						top: 0,
						width: 1180,
						height: 1180,
					}}
				/>
			</div>
		</AbsoluteFill>
	);
};
