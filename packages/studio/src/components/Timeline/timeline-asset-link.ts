import {getAssetSchemaKeys} from '@remotion/studio-shared';
import type {SequenceControls} from 'remotion';
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

export const splitRemoteSourceForMiddleEllipsis = (src: string) => {
	const protocolEnd = src.indexOf('://');
	const minimumSlashIndex = protocolEnd === -1 ? 0 : protocolEnd + 3;
	const lastSlash = src.lastIndexOf('/');

	if (lastSlash >= minimumSlashIndex && lastSlash < src.length - 1) {
		return {
			leading: src.slice(0, lastSlash + 1),
			trailing: src.slice(lastSlash + 1),
		};
	}

	const middle = Math.ceil(src.length / 2);
	return {
		leading: src.slice(0, middle),
		trailing: src.slice(middle),
	};
};

export const getTimelineAssetSrcFromSchema = (
	controls: SequenceControls | null,
): string | null => {
	if (!controls || !getAssetSchemaKeys(controls.schema).includes('src')) {
		return null;
	}

	const {src} = controls.currentRuntimeValueDotNotation;
	return typeof src === 'string' ? src : null;
};

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
