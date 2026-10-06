import {showNotification} from '../components/Notifications/NotificationCenter';
import {getCodexAnnotation} from './get-codex-annotation';

export const getVisibleAnnotationTarget = (
	targets: readonly (Element | null | undefined)[],
): Element | null => {
	return (
		targets.find((element) => {
			if (!element?.isConnected) {
				return false;
			}

			const rect = element.getBoundingClientRect();
			const style = window.getComputedStyle(element);
			return (
				style.visibility !== 'hidden' &&
				style.display !== 'none' &&
				rect.width > 0 &&
				rect.height > 0 &&
				rect.bottom > 0 &&
				rect.right > 0 &&
				rect.top < window.innerHeight &&
				rect.left < window.innerWidth
			);
		}) ?? null
	);
};

export const requestCodexAnnotation = ({
	target,
	initialComment,
	metadata,
}: {
	readonly target: Element | null;
	readonly initialComment: string | null;
	readonly metadata: Record<string, string | number> | null;
}): boolean => {
	const annotation = getCodexAnnotation();
	if (annotation === null) {
		showNotification('The annotation editor is unavailable', 3000);
		return false;
	}

	if (target === null || getVisibleAnnotationTarget([target]) === null) {
		showNotification('The annotation target is no longer visible', 3000);
		return false;
	}

	// Omit oversized facts instead of truncating source paths or identifiers.
	const boundedMetadata: Record<string, string | number> = {};
	for (const [key, value] of Object.entries(metadata ?? {})) {
		if (
			Object.keys(boundedMetadata).length >= 6 ||
			key.length > 64 ||
			!/^[A-Za-z][A-Za-z0-9 _-]*$/.test(key) ||
			key.includes('  ') ||
			(typeof value === 'string' ? value.length > 256 : !Number.isFinite(value))
		) {
			continue;
		}

		const next = {...boundedMetadata, [key]: value};
		if (new TextEncoder().encode(JSON.stringify(next)).length <= 2048) {
			boundedMetadata[key] = value;
		}
	}

	try {
		const result = annotation.request(target, {
			...(initialComment === null ? {} : {initialComment}),
			...(Object.keys(boundedMetadata).length === 0
				? {}
				: {metadata: boundedMetadata}),
		});
		if (result?.accepted) {
			return true;
		}

		showNotification('Could not open the annotation editor', 3000);
	} catch (err) {
		showNotification(
			`Could not open the annotation editor: ${(err as Error).message}`,
			3000,
		);
	}

	return false;
};
