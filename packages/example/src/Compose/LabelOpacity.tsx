import React from 'react';

export const LabelOpacityContext = React.createContext<number>(1);

export const useLabelOpacity = () => {
	return React.useContext(LabelOpacityContext);
};
