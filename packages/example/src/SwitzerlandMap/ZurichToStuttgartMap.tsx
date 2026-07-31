import {Easing, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {MapOverlay} from './MapOverlay';
import {MapPin} from './MapPin';
import {MapRoute, type MapRouteFeature} from './MapRoute';
import {MapViewport} from './MapViewport';

const zurichToStuttgart = {
	type: 'Feature',
	properties: {
		name: 'Zurich to Stuttgart',
		source: 'Direct city-to-city route',
	},
	geometry: {
		type: 'LineString',
		coordinates: [
			[8.541071693747302, 47.41728197584036],
			[8.622, 47.66],
			[8.811, 47.94],
			[8.951, 48.24],
			[9.059, 48.49],
			[9.1829, 48.7758],
		],
	},
} as const satisfies MapRouteFeature;

export const ZurichToStuttgartMap = () => {
	const frame = useCurrentFrame();

	return (
		<MapViewport
			name="Map camera"
			from={0}
			centerLongitude={interpolate(
				frame,
				[106, 179],
				[8.541071693747302, 9.1829],
				{
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
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				},
			)}
			centerLatitude={interpolate(
				frame,
				[106, 179],
				[47.41728197584036, 48.7758],
				{
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				},
			)}
			zoom={interpolate(frame, [78, 101, 204, 216], [17.97, 7.4, 7.4, 12], {
				easing: [
					Easing.spring({
						damping: 200,
						mass: 1,
						stiffness: 100,
						allowTail: true,
						durationRestThreshold: 0.04,
						overshootClamping: false,
					}),
					Easing.bezier(0.65, 0, 0.35, 1),
					Easing.bezier(0.65, 0, 0.35, 1),
				],

				extrapolateLeft: 'clamp',
				extrapolateRight: 'clamp',
			})}
			bearing={111}
		>
			<MapOverlay
				name="Zurich marker"
				from={28}
				longitude={8.541071693747302}
				latitude={47.41728197584036}
				style={{
					scale: 0.4,
				}}
			>
				<MapPin name="Zurich pin" imageSrc={staticFile('zurich-pin.png')} />
			</MapOverlay>
			<MapRoute
				name="Zurich to Stuttgart route"
				from={106}
				id="zurich-to-stuttgart"
				feature={zurichToStuttgart}
				glow={0.7}
				progress={interpolate(frame, [128, 179], [0, 1], {
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
				strokeColor={'#ff6700'}
				strokeWidth={8}
			/>
			<MapOverlay
				name="Stuttgart marker"
				from={225}
				longitude={9.1829}
				latitude={48.7758}
				style={{
					scale: 0.3,
				}}
			>
				<MapPin
					name="Stuttgart pin"
					imageSrc={staticFile('stuttgart-pin.png')}
				/>
			</MapOverlay>
		</MapViewport>
	);
};

export default ZurichToStuttgartMap;
