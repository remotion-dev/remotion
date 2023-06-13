import React from 'react';

const line: React.CSSProperties = {
	borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
};

export const SchemaSeparationLine: React.FC = () => {
	return <div style={line} />;
};
