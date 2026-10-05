import {showNotification} from '../components/Notifications/NotificationCenter';
import {getCodexAnnotation} from './get-codex-annotation';

export const requestCodexAnnotation = ({
	target,
	initialComment,
	metadata,
}: {
	readonly target: Element | null;
	readonly initialComment: string;
	readonly metadata: Record<string, string | number> | null;
}): boolean => {
	const annotation = getCodexAnnotation();
	if (annotation === null || target === null) {
		showNotification('The annotation editor is unavailable', 3000);
		return false;
	}

	try {
		const result = annotation.request(target, {
			initialComment,
			...(metadata === null ? {} : {metadata}),
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
