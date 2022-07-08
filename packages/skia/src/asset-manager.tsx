import type {SkImage, SkTypeface} from '@shopify/react-native-skia';
import {createContext, useContext} from 'react';
export type Images = Record<string, SkImage>;

export interface TAssetManagerContext {
	images: Images;
	typefaces: SkTypeface[];
}

export const AssetManagerContext = createContext<TAssetManagerContext | null>(
	null
);

const useAssetManager = () => {
	const assetManager = useContext(AssetManagerContext);
	if (!assetManager) {
		throw new Error('Could not find the asset manager');
	}

	return assetManager;
};

export const useTypefaces = () => {
	const assetManager = useAssetManager();
	return assetManager.typefaces;
};

export const useImages = () => {
	const assetManager = useAssetManager();
	return assetManager.images;
};
