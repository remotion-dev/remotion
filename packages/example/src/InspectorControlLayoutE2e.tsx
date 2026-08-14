import React from 'react';
import {
	AbsoluteFill,
	Interactive,
	Sequence,
	type InteractivitySchema,
	type SequenceControls,
} from 'remotion';

const inspectorControlLayoutSchema = {
	first: {
		type: 'array',
		item: {type: 'number', step: 0.0001},
		default: [-0.1276, 51.5072],
		minLength: 2,
		maxLength: 2,
		newItemDefault: 0,
		description: 'Origin [longitude, latitude]',
	},
	second: {
		type: 'array',
		item: {type: 'number', step: 0.0001},
		default: [139.6917, 35.6895],
		minLength: 2,
		maxLength: 2,
		newItemDefault: 0,
		description: 'Destination [longitude, latitude]',
	},
	label: {
		type: 'text-content',
		default: 'London',
		description: 'Origin label',
	},
	color: {
		type: 'color',
		default: '#ff5c4d',
		description: 'Route color',
	},
	width: {
		type: 'number',
		default: 24,
		min: 2,
		max: 24,
		step: 1,
		hiddenFromList: false,
		description: 'Route width',
	},
} as const satisfies InteractivitySchema;

type InspectorControlLayoutProps = {
	readonly name: string;
	readonly first: readonly number[];
	readonly second: readonly number[];
	readonly label: string;
	readonly color: string;
	readonly width: number;
};

const InspectorControlLayoutInner: React.FC<
	InspectorControlLayoutProps & {
		readonly controls: SequenceControls | undefined;
	}
> = ({controls, name}) => {
	return (
		<Sequence name={name} controls={controls}>
			<AbsoluteFill style={{backgroundColor: '#111'}} />
		</Sequence>
	);
};

const InteractiveInspectorControlLayout = Interactive.withSchema({
	Component: InspectorControlLayoutInner,
	componentName: '<InspectorControlLayout>',
	componentIdentity: null,
	schema: inspectorControlLayoutSchema,
	supportsEffects: false,
}) as React.FC<InspectorControlLayoutProps>;

export const InspectorControlLayoutE2e: React.FC = () => {
	return (
		<InteractiveInspectorControlLayout
			name="Inspector control layout"
			first={[-0.1276, 51.5072]}
			second={[139.6917, 35.6895]}
			label="London"
			color="#ff5c4d"
			width={24}
		/>
	);
};
