export const emptyCompositionComponent = (componentName: string) => {
	return `import React from 'react';

export const ${componentName}: React.FC = () => {
	return null;
};
`;
};
