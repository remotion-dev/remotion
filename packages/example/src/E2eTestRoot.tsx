import React from 'react';
import {Composition, Folder} from 'remotion';
import {NewVideoComp} from './NewVideo';
import {SchemaTest, schemaTestSchema} from './SchemaTest';
import {VisualControls} from './VisualControls';

export const E2eTestRoot: React.FC = () => {
	return (
		<>
			<Folder name="Schema">
				<Composition
					id="schema-test"
					component={SchemaTest}
					width={1200}
					height={630}
					fps={30}
					durationInFrames={150}
					schema={schemaTestSchema}
					defaultProps={{
						title: 'sdasds',
						delay: 5.2,
						color: 'rgba(223, 42, 42, 0.46)',
						list: [{name: 'first', age: 12}],
						matrix: [0, 1, 1, 0] as const,
						description: 'Sample description \nOn multiple lines',
						country: 'Armenia' as const,
						dropdown: 'a' as const,
						superSchema: [
							{type: 'a' as const, a: {a: 'hi'}},
							{type: 'b' as const, b: {b: 'hi'}},
						],
						discriminatedUnion: {type: 'auto' as const},
						tuple: ['foo', 42, {a: 'hi'}],
					}}
				/>
			</Folder>
			<Folder name="visual-controls">
				<Composition
					id="visual-controls"
					component={VisualControls}
					width={1920}
					height={2400}
					fps={30}
					durationInFrames={900}
				/>
			</Folder>
			<NewVideoComp />
		</>
	);
};
