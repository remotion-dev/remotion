import React from 'react';
import {
	AbsoluteFill,
	Interactive,
	type InteractiveTransformProps,
} from 'remotion';

const ElementComponentInner: React.FC<InteractiveTransformProps> = ({
	style,
}) => {
	return (
		<AbsoluteFill
			style={{
				alignItems: 'center',
				backgroundColor: '#111827',
				color: 'white',
				display: 'flex',
				fontFamily: 'Inter, system-ui, sans-serif',
				fontSize: 96,
				fontWeight: 700,
				justifyContent: 'center',
				...style,
			}}
		>
			Element
		</AbsoluteFill>
	);
};

export const ElementComponent = Interactive.withSchema({
	Component: ElementComponentInner,
	componentName: '<ElementComponent>',
	schema: {},
	wrapInSequence: true,
});
