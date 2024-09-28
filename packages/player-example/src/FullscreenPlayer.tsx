import {Player} from '@remotion/player';
import CarSlideshow from './CarSlideshow';

export const FullscreenPlayer = () => {
	const compositionWidth = 300;
	const compositionHeight = 200;

	return (
		<div
			style={{
				width: '100%',
				height: '100%',
				backgroundColor: 'gray',
				position: 'absolute',
			}}
		>
			<div
				style={{
					position: 'absolute',
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					margin: 'auto',
					aspectRatio: `${compositionWidth} / ${compositionHeight}`,
					maxHeight: '100%',
					maxWidth: '100%',
					background: 'black',
				}}
			>
				<Player
					controls
					component={CarSlideshow}
					compositionWidth={compositionWidth}
					compositionHeight={compositionHeight}
					durationInFrames={200}
					fps={30}
					style={{
						width: '100%',
						backgroundColor: 'black',
					}}
					inputProps={{title: 'Hi there', bgColor: 'black', color: 'white'}}
				/>
			</div>
		</div>
	);
};
