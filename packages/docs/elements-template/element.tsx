import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';

export const ElementComponent: React.FC = () => {
	return (
		<Sequence width={1080} height={1080}>
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
				}}
			>
				Element
			</AbsoluteFill>
		</Sequence>
	);
};
