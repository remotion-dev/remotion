import {createContext} from 'react';

type RegressionTestContext = {
	hi: () => 'hithere';
};

export const MyCtx = createContext<RegressionTestContext>({
	hi: () => {
		throw new Error('context not provided');
	},
});
