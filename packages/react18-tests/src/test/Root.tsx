// bun run studio
import React from 'react';
import {Composition} from 'remotion';
import {ZodV3SchemaTest, zodV3Schema} from './ZodV3SchemaTest';

const TestComponent: React.FC = () => {
	return (
		<div
			style={{
				backgroundColor: 'white',
				width: '100%',
				height: '100%',
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			<h1 style={{fontSize: 60}}>React 18 Test</h1>
		</div>
	);
};

export const Root: React.FC = () => {
	return (
		<>
			<Composition
				id="React18Test"
				component={TestComponent}
				durationInFrames={150}
				fps={30}
				width={1920}
				height={1080}
			/>
			<Composition
				id="ZodV3SchemaTest"
				component={ZodV3SchemaTest}
				durationInFrames={150}
				fps={30}
				width={1920}
				height={1080}
				schema={zodV3Schema}
				defaultProps={{
					title: 'Hello from Zod v3!',
					count: 10,
					enabled: [1, 0, 0, 1],
					tags: ['react18', 'zod-v3'],
					level: 'beginner' as const,
				}}
			/>
		</>
	);
};
