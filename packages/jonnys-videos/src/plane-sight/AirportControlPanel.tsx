import {
	AbsoluteFill,
	type InteractiveTransformProps,
	Interactive,
} from 'remotion';

const AirportControlPanelContent = ({style}: InteractiveTransformProps) => {
	return <AbsoluteFill style={style} />;
};

export const AirportControlPanel = Interactive.create({
	Component: AirportControlPanelContent,
	componentName: 'AirportControlPanel',
});
