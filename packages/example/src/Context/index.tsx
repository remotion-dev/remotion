import {createContext, useContext} from 'react';
import {AbsoluteFill} from 'remotion';
import {MyCtx} from './index-context';

type RegressionTestContext = {
	hi: () => 'hithere';
};

export const WrappedInContext: React.FC = () => {
	const value = useContext(MyCtx);

	return <AbsoluteFill>{value.hi()}</AbsoluteFill>;
};
