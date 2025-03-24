import {
	AbsoluteFill,
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {RotateX, RotateY, RotateZ} from '../3DContext/transformation-context';
import {LabelOpacityContext, useLabelOpacity} from './LabelOpacity';

export const Rotations: React.FC<{
	children: React.ReactNode;
	delay: number;
	zIndexHack: boolean;
}> = ({children, delay, zIndexHack}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const opacity = useLabelOpacity();

	const spr = spring({
		fps,
		frame,
		delay,
	});

	const rotate = interpolate(spr, [0, 1], [Math.PI, 0]);

	return (
		<RotateY radians={rotate - 0.4}>
			<RotateX radians={-0.6}>
				<RotateZ radians={-0.5}>
					<LabelOpacityContext.Provider value={spr * opacity}>
						<AbsoluteFill
							id="video"
							style={{
								zIndex: zIndexHack ? (spr > 0.3 ? 1 : -1) : undefined,
							}}
							className="flex justify-center items-center"
						>
							{children}
						</AbsoluteFill>
					</LabelOpacityContext.Provider>
				</RotateZ>
			</RotateX>
		</RotateY>
	);
};
