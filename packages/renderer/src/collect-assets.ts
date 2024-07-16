import type {ArtifactAsset, TRenderAsset} from 'remotion/no-react';
import type {Page} from './browser/BrowserPage';
import {puppeteerEvaluateWithCatch} from './puppeteer-evaluate';

export const collectAssets = async ({
	frame,
	freePage,
	timeoutInMilliseconds,
}: {
	frame: number;
	freePage: Page;
	timeoutInMilliseconds: number;
}) => {
	const {value} = await puppeteerEvaluateWithCatch<TRenderAsset[]>({
		pageFunction: () => {
			return window.remotion_collectAssets();
		},
		args: [],
		frame,
		page: freePage,
		timeoutInMilliseconds,
	});

	const fixedArtifacts = value.map((asset) => {
		if (asset.type !== 'artifact') {
			return asset;
		}

		if (typeof asset.content !== 'string') {
			throw new Error(
				`Expected string content for artifact ${asset.id}, but got ${asset.content}`,
			);
		}

		const stringOrUintArray = asset.binary
			? new TextEncoder().encode(atob(asset.content as string))
			: asset.content;

		return {
			...asset,
			content: stringOrUintArray,
		} as ArtifactAsset;
	});

	return fixedArtifacts;
};
