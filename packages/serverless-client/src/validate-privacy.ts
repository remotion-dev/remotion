import type {Privacy} from './constants';

export function validatePrivacy(
	privacy: unknown,
	allowPrivate: boolean,
): asserts privacy is Privacy {
	if (typeof privacy !== 'string') {
		throw new TypeError('Privacy must be a string');
	}

	if (!allowPrivate && privacy === 'private') {
		throw new TypeError('Privacy must be either "public" or "no-acl"');
	}

	if (privacy !== 'private' && privacy !== 'public' && privacy !== 'no-acl') {
		throw new TypeError(
			'Privacy must be either "private", "public" or "no-acl"',
		);
	}
}
