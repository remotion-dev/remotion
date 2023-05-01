import React, {
	createContext,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react';

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
export type ZodType = Awaited<typeof import('zod')>['z'];
export type ZodColorType = Awaited<
	// eslint-disable-next-line @typescript-eslint/consistent-type-imports
	typeof import('@remotion/zod-types')
>;

export const getZodIfPossible = async (): Promise<ZodType | null> => {
	try {
		const {z} = await import('zod');
		return z;
	} catch (err) {
		return null;
	}
};

export const getZColorIfPossible = async (): Promise<ZodColorType | null> => {
	try {
		const mod = await import('@remotion/zod-types');
		return mod;
	} catch (err) {
		return null;
	}
};

export const useZodIfPossible = () => {
	const context = useContext(ZodContext);
	return context?.zod ?? null;
};

export const useZodColorIfPossible = () => {
	const context = useContext(ZodContext);
	return context?.zodColor ?? null;
};

type ContextType = {
	zod: ZodType | null;
	zodColor: ZodColorType | null;
};

const ZodContext = createContext<ContextType | null>(null);

export const ZodProvider: React.FC<{
	children: React.ReactNode;
}> = ({children}) => {
	const [zod, setZod] = useState<ZodType | null>(null);
	const [zodColor, setZodColor] = useState<ZodColorType | null>(null);

	useEffect(() => {
		getZodIfPossible().then((z) => setZod(z));
	}, []);

	useEffect(() => {
		getZColorIfPossible().then((z) => setZodColor(z));
	}, []);

	const contextValue = useMemo(() => {
		return {
			zod,
			zodColor,
		};
	}, [zod, zodColor]);

	return (
		<ZodContext.Provider value={contextValue}>{children}</ZodContext.Provider>
	);
};
