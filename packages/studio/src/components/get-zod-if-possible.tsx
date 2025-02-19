import React, {
	createContext,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react';

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
export type ZodType = Awaited<typeof import('zod')>['z'];
export type ZodTypesType = Awaited<
	// eslint-disable-next-line @typescript-eslint/consistent-type-imports
	typeof import('@remotion/zod-types')
>;

export const getZodIfPossible = async (): Promise<ZodType | null> => {
	try {
		const {z} = await import('zod');
		return z;
	} catch {
		return null;
	}
};

export const getZTypesIfPossible = async (): Promise<ZodTypesType | null> => {
	try {
		const mod = await import('@remotion/zod-types');
		return mod;
	} catch {
		return null;
	}
};

export const useZodIfPossible = () => {
	const context = useContext(ZodContext);
	return context?.zod ?? null;
};

export const useZodTypesIfPossible = () => {
	const context = useContext(ZodContext);
	return context?.zodTypes ?? null;
};

type ContextType = {
	zod: ZodType | null;
	zodTypes: ZodTypesType | null;
};

const ZodContext = createContext<ContextType | null>(null);

export const ZodProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const [zod, setZod] = useState<ZodType | null>(null);
	const [zodTypes, setZodTypes] = useState<ZodTypesType | null>(null);

	useEffect(() => {
		getZodIfPossible().then((z) => setZod(z));
	}, []);

	useEffect(() => {
		getZTypesIfPossible().then((z) => setZodTypes(z));
	}, []);

	const contextValue = useMemo(() => {
		return {
			zod,
			zodTypes,
		};
	}, [zod, zodTypes]);

	return (
		<ZodContext.Provider value={contextValue}>{children}</ZodContext.Provider>
	);
};
