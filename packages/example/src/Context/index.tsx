import {createContext, useContext} from 'react';
import {AbsoluteFill} from 'remotion';

type RegressionTestContext = {
	hi: () => 'hithere';
};

export const MyCtx = createContext<RegressionTestContext>({
	hi: () => {
		throw new Error('context not provided');
	},
});

export const WrappedInContext: React.FC = () => {
	const value = useContext(MyCtx);

	return <AbsoluteFill>{value.hi()}</AbsoluteFill>;
};
