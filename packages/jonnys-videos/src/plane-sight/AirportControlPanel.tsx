import {
	AbsoluteFill,
	type InteractiveTransformProps,
	Interactive,
} from 'remotion';

const AirportControlPanelContent = ({style}: InteractiveTransformProps) => {
	return <AbsoluteFill style={style} />;
};

export const AirportControlPanel = Interactive.withSchema({
	Component: AirportControlPanelContent,
	componentName: 'AirportControlPanel',
	schema: {},
	wrapInSequence: true,
});
