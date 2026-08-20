import {
	MapHeatmap,
	MapViewport,
	type MapHeatmapProps,
} from '@remotion/maptiler';
import {Easing, interpolate, useCurrentFrame} from 'remotion';

const zurichActivity = {
	type: 'FeatureCollection',
	features: [
		{
			type: 'Feature',
			properties: {activity: 92},
			geometry: {type: 'Point', coordinates: [8.5417, 47.3769]},
		},
		{
			type: 'Feature',
			properties: {activity: 78},
			geometry: {type: 'Point', coordinates: [8.5352, 47.3782]},
		},
		{
			type: 'Feature',
			properties: {activity: 74},
			geometry: {type: 'Point', coordinates: [8.5482, 47.3763]},
		},
		{
			type: 'Feature',
			properties: {activity: 66},
			geometry: {type: 'Point', coordinates: [8.5203, 47.3731]},
		},
		{
			type: 'Feature',
			properties: {activity: 62},
			geometry: {type: 'Point', coordinates: [8.5581, 47.3708]},
		},
		{
			type: 'Feature',
			properties: {activity: 59},
			geometry: {type: 'Point', coordinates: [8.531, 47.3674]},
		},
		{
			type: 'Feature',
			properties: {activity: 57},
			geometry: {type: 'Point', coordinates: [8.5451, 47.3658]},
		},
		{
			type: 'Feature',
			properties: {activity: 54},
			geometry: {type: 'Point', coordinates: [8.5097, 47.3815]},
		},
		{
			type: 'Feature',
			properties: {activity: 51},
			geometry: {type: 'Point', coordinates: [8.5662, 47.3833]},
		},
		{
			type: 'Feature',
			properties: {activity: 48},
			geometry: {type: 'Point', coordinates: [8.577, 47.3717]},
		},
		{
			type: 'Feature',
			properties: {activity: 45},
			geometry: {type: 'Point', coordinates: [8.5175, 47.3894]},
		},
		{
			type: 'Feature',
			properties: {activity: 42},
			geometry: {type: 'Point', coordinates: [8.5517, 47.3902]},
		},
		{
			type: 'Feature',
			properties: {activity: 39},
			geometry: {type: 'Point', coordinates: [8.5268, 47.3981]},
		},
		{
			type: 'Feature',
			properties: {activity: 36},
			geometry: {type: 'Point', coordinates: [8.5634, 47.397]},
		},
		{
			type: 'Feature',
			properties: {activity: 34},
			geometry: {type: 'Point', coordinates: [8.4914, 47.3912]},
		},
		{
			type: 'Feature',
			properties: {activity: 31},
			geometry: {type: 'Point', coordinates: [8.5847, 47.3888]},
		},
		{
			type: 'Feature',
			properties: {activity: 28},
			geometry: {type: 'Point', coordinates: [8.5013, 47.3635]},
		},
		{
			type: 'Feature',
			properties: {activity: 25},
			geometry: {type: 'Point', coordinates: [8.5688, 47.3569]},
		},
	],
} satisfies MapHeatmapProps['data'];

export const Heatmap = () => {
	const frame = useCurrentFrame();

	return (
		<MapViewport
			name="Map camera"
			apiKey={process.env.REMOTION_MAPTILER_KEY ?? null}
			centerLongitude={8.54}
			centerLatitude={47.378}
			zoom={11.6}
			bearing={0}
			pitch={0}
			showLabels={false}
			administrativeBorders="none"
		>
			<MapHeatmap
				name="Zurich activity heatmap"
				layerId="zurich-activity"
				data={zurichActivity}
				property="activity"
				weight={[
					{propertyValue: 20, value: 0.2},
					{propertyValue: 100, value: 1},
				]}
				radius={interpolate(frame, [0, 45], [12, 42], {
					easing: Easing.out(Easing.cubic),
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				})}
				intensity={interpolate(frame, [0, 45], [0.2, 1.4], {
					easing: Easing.out(Easing.cubic),
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				})}
				opacity={interpolate(frame, [0, 30, 120, 150], [0, 0.85, 0.85, 0], {
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				})}
				zoomCompensation={false}
			/>
		</MapViewport>
	);
};

export default Heatmap;
