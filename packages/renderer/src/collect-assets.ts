import type {TRenderAsset} from 'remotion/no-react';
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

		const stringOrUintArray =
			typeof asset.content === 'string'
				? asset.content
				: new Uint8Array(Object.values(asset.content));

		return {
			...asset,
			content: stringOrUintArray,
		};
	});

	return fixedArtifacts;
};
