import React, {createContext, useEffect, useState} from 'react';

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
export type ZodType = Awaited<typeof import('zod')>['z'];

export const getZodIfPossible = async (): Promise<ZodType | null> => {
	try {
		const {z} = await import('zod');
		return z;
	} catch (err) {
		return null;
	}
};

export const useZodIfPossible = () => {
	const [zod, setZod] = useState<ZodType | null>(null);

	useEffect(() => {
		getZodIfPossible().then((z) => setZod(z));
	}, []);

	return zod;
};

const ZodContext = createContext<ZodType | null>(null);

export const ZodProvider: React.FC<{
	children: React.ReactNode;
}> = ({children}) => {
	const zod = useZodIfPossible();

	return <ZodContext.Provider value={zod}>{children}</ZodContext.Provider>;
};
