import {Audio} from '@remotion/media';
import {
	AbsoluteFill,
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {assetUrl} from './assets';

export type ListItem = {
	label: string;
	/** Frame at which item appears. Use -1 for immediately visible (no animation, no sound). */
	appearFrame: number;
};

type AnimatedListProps = {
	title: string;
	items: ListItem[];
};

export const AnimatedList: React.FC<AnimatedListProps> = ({title, items}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	return (
		<AbsoluteFill
			style={{
				backgroundColor: 'white',
				flexDirection: 'column',
				display: 'flex',
				padding: '0 40px',
			}}
		>
			<div
				style={{
					flex: 1,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					fontFamily: 'GT Planar',
					fontSize: 42,
					fontWeight: 700,
					color: '#111',
					borderBottom: '1px solid #e0e0e0',
				}}
			>
				{title}
			</div>
			{items.map((item, i) => {
				const isImmediate = item.appearFrame < 0;
				const progress = isImmediate
					? 1
					: spring({
							frame: frame - item.appearFrame,
							fps,
							config: {damping: 200},
							durationInFrames: 12,
						});
				const translateY = isImmediate
					? 0
					: interpolate(progress, [0, 1], [20, 0]);

				return (
					<div
						key={item.label}
						style={{
							flex: 1,
							display: 'flex',
							alignItems: 'center',
							fontFamily: 'GT Planar',
							fontSize: 34,
							fontWeight: 500,
							color: '#333',
							opacity: progress,
							transform: `translateY(${translateY}px)`,
							borderBottom: i < items.length - 1 ? '1px solid #e0e0e0' : 'none',
							paddingLeft: 20,
						}}
					>
						{!isImmediate && (
							<Audio
								from={item.appearFrame}
								src={assetUrl('list-item-sfx.m4a')}
								volume={0.8}
							/>
						)}
						{item.label}
					</div>
				);
			})}
		</AbsoluteFill>
	);
};
