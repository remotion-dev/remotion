import React, {
	createContext,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react';

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
export type ZodType = Awaited<typeof import('zod')>['z'];
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
export type ZodV3Type = Awaited<typeof import('zod/v3')>;
export type ZodTypesType = Awaited<
	// eslint-disable-next-line @typescript-eslint/consistent-type-imports
	typeof import('@remotion/zod-types')
>;

export async function getZodIfPossible(): Promise<ZodType | null> {
	try {
		const {z} = await import('zod');
		return z;
	} catch {
		return null;
	}
}

export const getZodV3IfPossible = async (): Promise<ZodV3Type | null> => {
	try {
		const mod = await import('zod/v3');
		return mod;
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

export function useZodIfPossible(): ZodType | null {
	const context = useContext(ZodContext);
	return context?.zod ?? null;
}

export const useZodV3IfPossible = () => {
	const context = useContext(ZodContext);
	return context?.zodV3 ?? null;
};

export const useZodTypesIfPossible = () => {
	const context = useContext(ZodContext);
	return context?.zodTypes ?? null;
};

type ContextType = {
	zod: ZodType | null;
	zodV3: ZodV3Type | null;
	zodTypes: ZodTypesType | null;
};

const ZodContext = createContext<ContextType | null>(null);

export const ZodProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const [zod, setZod] = useState<ZodType | null>(null);
	const [zodV3, setZodV3] = useState<ZodV3Type | null>(null);
	const [zodTypes, setZodTypes] = useState<ZodTypesType | null>(null);

	useEffect(() => {
		getZodIfPossible().then((z) => setZod(z));
	}, []);

	useEffect(() => {
		getZodV3IfPossible().then((z) => setZodV3(z));
	}, []);

	useEffect(() => {
		getZTypesIfPossible().then((z) => setZodTypes(z));
	}, []);

	const contextValue = useMemo(() => {
		return {
			zod,
			zodV3,
			zodTypes,
		};
	}, [zod, zodV3, zodTypes]);

	return (
		<ZodContext.Provider value={contextValue}>{children}</ZodContext.Provider>
	);
};
