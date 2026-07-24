import {Easing, interpolate, useCurrentFrame} from 'remotion';
import austriaData from './austria-10m.json';
import {MapOverlay} from './MapOverlay';
import {MapRegion, type MapRegionFeature} from './MapRegion';
import {MapViewport} from './MapViewport';
import switzerlandData from './switzerland-10m.json';

const switzerland = switzerlandData as MapRegionFeature;
const austria = austriaData as MapRegionFeature;

export const SwitzerlandMap = () => {
	const frame = useCurrentFrame();

	return (
		<MapViewport
			name="Map camera"
			from={0}
			centerLongitude={interpolate(frame, [175, 215], [8.2275, 13.3347], {
				easing: Easing.bezier(0.65, 0, 0.35, 1),
				extrapolateLeft: 'clamp',
				extrapolateRight: 'clamp',
			})}
			centerLatitude={interpolate(frame, [175, 215], [46.8182, 47.6942], {
				easing: Easing.bezier(0.65, 0, 0.35, 1),
				extrapolateLeft: 'clamp',
				extrapolateRight: 'clamp',
			})}
			zoom={interpolate(frame, [0, 72, 175, 215], [4.5, 6.2, 6.65, 5.8], {
				easing: Easing.bezier(0.65, 0, 0.35, 1),
				extrapolateLeft: 'clamp',
				extrapolateRight: 'clamp',
			})}
			bearing={0}
		>
			<MapRegion
				name="Switzerland outline"
				from={76}
				id="switzerland"
				feature={switzerland}
				fill={interpolate(frame, [122, 144, 154], [0, 0.3, 0.24], {
					easing: Easing.out(Easing.cubic),
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				})}
				fillColor={'#1e46d5'}
				strokeColor="#8f1712"
				strokeWidth={4}
				progress={interpolate(frame, [76, 126], [0, 1], {
					easing: Easing.out(Easing.cubic),
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				})}
				glow={interpolate(frame, [142, 154], [0, 1], {
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',

					easing: [
						Easing.spring({
							damping: 200,
							mass: 1,
							stiffness: 100,
							allowTail: true,
							durationRestThreshold: 0.02,
							overshootClamping: false,
						}),
					],
				})}
			/>
			<MapRegion
				name="Austria outline"
				from={112}
				id="austria"
				feature={austria}
				fill={interpolate(frame, [158, 180, 190], [0, 0.3, 0.24], {
					easing: [
						Easing.bezier(0.33333333333333337, 1, 0.6666666666666667, 1),
						Easing.bezier(0.33333333333333337, 1, 0.6666666666666667, 1),
					],
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				})}
				fillColor="#ed2939"
				strokeColor="#981b27"
				strokeWidth={4}
				progress={interpolate(frame, [112, 162], [0, 1], {
					easing: [
						Easing.bezier(0.33333333333333337, 1, 0.6666666666666667, 1),
					],
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				})}
			/>
			<MapOverlay
				name="Switzerland label"
				from={145}
				longitude={8.2275}
				latitude={46.8182}
				style={{
					alignItems: 'center',
					display: 'flex',
					flexDirection: 'column',
					gap: 18,
					opacity: interpolate(frame, [145, 165], [0, 1], {
						easing: [
							Easing.bezier(0.33333333333333337, 1, 0.6666666666666667, 1),
						],
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
					translate: interpolate(
						frame,
						[145, 165],
						['-50% 24px', '-50% -92px'],
						{
							easing: Easing.out(Easing.cubic),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
				}}
			>
				<div
					style={{
						color: '#171a1f',
						fontFamily: 'Arial, sans-serif',
						fontSize: 84,
						fontWeight: 800,
						letterSpacing: -3,
						lineHeight: 1,
						textShadow: '0 3px 18px rgba(255, 255, 255, 0.95)',
					}}
				>
					Switzerland
				</div>
				<div
					style={{
						backgroundColor: '#d52b1e',
						height: 8,
						width: interpolate(frame, [150, 172], [0, 180], {
							easing: Easing.out(Easing.cubic),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
					}}
				/>
			</MapOverlay>
		</MapViewport>
	);
};

export default SwitzerlandMap;
