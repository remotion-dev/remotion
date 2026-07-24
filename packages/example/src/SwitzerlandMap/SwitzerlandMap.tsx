import {Easing, interpolate, useCurrentFrame} from 'remotion';
import austriaData from './austria-10m.json';
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
			centerLongitude={interpolate(frame, [124, 164], [8.2275, 13.3347], {
				easing: [Easing.bezier(0.65, 0, 0.35, 1)],
				extrapolateLeft: 'clamp',
				extrapolateRight: 'clamp',
			})}
			centerLatitude={interpolate(frame, [124, 164], [46.8182, 47.6942], {
				easing: [Easing.bezier(0.65, 0, 0.35, 1)],
				extrapolateLeft: 'clamp',
				extrapolateRight: 'clamp',
			})}
			zoom={interpolate(frame, [0, 72, 124, 164], [4.5, 6.2, 6.65, 5.8], {
				easing: [
					Easing.bezier(0.65, 0, 0.35, 1),
					Easing.bezier(0.65, 0, 0.35, 1),
					Easing.bezier(0.65, 0, 0.35, 1),
				],
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
				from={140}
				id="austria"
				feature={austria}
				fill={interpolate(frame, [186, 208, 218], [0, 0.3, 0.24], {
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
				progress={interpolate(frame, [162, 212], [0, 1], {
					easing: [
						Easing.bezier(0.33333333333333337, 1, 0.6666666666666667, 1),
					],
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				})}
			/>
		</MapViewport>
	);
};

export default SwitzerlandMap;
