import type {Privacy} from './constants';

export function validatePrivacy(privacy: unknown): asserts privacy is Privacy {
	if (typeof privacy !== 'string') {
		throw new TypeError('Privacy must be a string');
	}

	if (privacy !== 'private' && privacy !== 'public') {
		throw new TypeError('Privacy must be either "private" or "public"');
	}
}
