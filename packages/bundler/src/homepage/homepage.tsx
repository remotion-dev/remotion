import {Studio} from '@remotion/studio';
import React from 'react';

export const Homepage: React.FC<{
	rootComponent: React.FC;
}> = ({rootComponent}) => {
	const Root = rootComponent;
	return <Studio readOnly rootComponent={Root} />;
};
