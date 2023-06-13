export const SchemaVerticalGuide: React.FC<{
	isRoot: boolean;
	children: React.ReactNode;
}> = ({isRoot, children}) => {
	return (
		<div
			style={
				isRoot
					? undefined
					: {
							borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
							marginLeft: 4,
					  }
			}
		>
			{children}
		</div>
	);
};
