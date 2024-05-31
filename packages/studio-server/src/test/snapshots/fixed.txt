export const Index: React.FC = () => {
	return (
		<>
			<Composition
				id="schema-test"
				component={SchemaTest}
				width={1200}
				height={630}
				fps={30}
				durationInFrames={150}
				schema={schemaTestSchema}
				defaultProps={{abc: 'def', newDate: new Date('2022-01-02')}}
			/>
		</>
	);
};
