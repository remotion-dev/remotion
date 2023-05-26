import {Circle} from '@remotion/shapes';
import {Loop, Sequence, useCurrentFrame} from 'remotion';

export const Tailwind = () => {
	const frame = useCurrentFrame();

	return (
		<Loop durationInFrames={30}>
			<Sequence
				durationInFrames={10}
				style={{
					display: 'flex',
					justifyContent: 'center',
					alignContent: 'center',
					alignItems: 'center',
				}}
			>
				<Circle className="fill-red-500" radius={100} strokeWidth={10}>
					{frame}
				</Circle>
			</Sequence>
			<Sequence
				from={10}
				durationInFrames={10}
				style={{
					display: 'flex',
					justifyContent: 'center',
					alignContent: 'center',
					alignItems: 'center',
				}}
			>
				<Circle className="fill-yellow-500" radius={100} strokeWidth={10}>
					{frame}
				</Circle>
			</Sequence>
			<Sequence
				from={20}
				durationInFrames={10}
				style={{
					display: 'flex',
					justifyContent: 'center',
					alignContent: 'center',
					alignItems: 'center',
				}}
			>
				<Circle className="fill-green-500" radius={100} strokeWidth={10}>
					{frame}
				</Circle>
			</Sequence>
		</Loop>
	);
};
