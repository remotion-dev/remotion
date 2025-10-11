import React from 'react';
import {Still} from 'remotion';
// Test file just for making sure the types are sound
import {z} from 'zod';

type MyComponentProps = {
	readonly a: number;
	readonly b: string;
};

function MyComponent(props: MyComponentProps) {
	return (
		<div>
			{props.a} {props.b}
		</div>
	);
}

<Still
	component={MyComponent}
	height={1080}
	width={1080}
	id="comps"
	defaultProps={{a: 3, b: '2'}}
/>;

<Still
	component={MyComponent}
	height={1080}
	width={1080}
	id="comps"
	// @ts-expect-error C should not be allowed
	defaultProps={{c: '2'}}
/>;

// React.FC syntax
const MyComponent2: React.FC<{
	readonly c: number;
}> = ({c}) => {
	return <div>{c}</div>;
};

<Still
	component={MyComponent2}
	height={1080}
	width={1080}
	id="comps"
	defaultProps={{c: 2, d: '4'}}
	schema={z.object({
		d: z.string(),
	})}
/>;

// React.FC syntax
const MyComponent3: React.FC<{
	readonly a: number;
}> = ({a}) => {
	return <div>{a}</div>;
};

// No more optional types
// @ts-expect-error Should be a type error
<Still component={MyComponent3} height={1080} width={1080} id="hithere" />;
<Still
	component={MyComponent3}
	height={1080}
	width={1080}
	id="hithere"
	defaultProps={{a: 2}}
/>;

const CompWithNoProps: React.FC = () => {
	return <div />;
};

<Still component={CompWithNoProps} height={1080} width={1080} id="no-props" />;

// @ts-expect-error Should be a type error since we leave out the defaultProps
<Still
	component={CompWithNoProps}
	height={1080}
	width={1080}
	id="no-props-but-schema"
	schema={z.object({
		a: z.string(),
	})}
/>;
