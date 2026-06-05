import {pushUrl} from '../../helpers/url-state';

type LinkInfo =
	| {
			kind: 'local';
			assetPath: string;
			title: string;
	  }
	| {
			kind: 'remote';
			href: string;
			title: string;
	  }
	| null;

export type TimelineAssetLinkInfo = Exclude<LinkInfo, null>;

export const getTimelineAssetLinkInfo = (src: string): LinkInfo => {
	const staticBase =
		typeof window === 'undefined' ? null : window.remotion_staticBase;

	if (staticBase && src.startsWith(staticBase + '/')) {
		const assetPath = src.slice(staticBase.length + 1);
		return {
			kind: 'local',
			assetPath: decodeURIComponent(assetPath),
			title: decodeURIComponent(assetPath),
		};
	}

	if (
		src.startsWith('http://') ||
		src.startsWith('https://') ||
		src.startsWith('//')
	) {
		try {
			const url = new URL(src.startsWith('//') ? 'https:' + src : src);
			return {kind: 'remote', href: src, title: url.hostname};
		} catch {
			return {kind: 'remote', href: src, title: src};
		}
	}

	return null;
};

export const openTimelineAssetLink = (
	linkInfo: TimelineAssetLinkInfo,
	selectAsset: (asset: string) => void,
) => {
	if (linkInfo.kind === 'local') {
		selectAsset(linkInfo.assetPath);
		pushUrl(`/assets/${linkInfo.assetPath}`);
		return;
	}

	window.open(linkInfo.href, '_blank', 'noopener,noreferrer');
};
