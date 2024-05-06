import React, {createContext} from 'react';

export const IsInsideSeriesContext = createContext(false);

export const IsInsideSeriesContainer: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	return (
		<IsInsideSeriesContext.Provider value>
			{children}
		</IsInsideSeriesContext.Provider>
	);
};

export const IsNotInsideSeriesProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	return (
		<IsInsideSeriesContext.Provider value={false}>
			{children}
		</IsInsideSeriesContext.Provider>
	);
};

export const useRequireToBeInsideSeries = () => {
	const isInsideSeries = React.useContext(IsInsideSeriesContext);
	if (!isInsideSeries) {
		throw new Error('This component must be inside a <Series /> component.');
	}
};
