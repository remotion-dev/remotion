/**
 * Compares two version strings.
 *
 * @param version1 - The first version string.
 * @param version2 - The second version string.
 * @returns 1 if version1 > version2, -1 if version1 < version2, 0 if they are equal.
 * @throws {Error} If either version is not a valid string or has an invalid format.
 */
export function compareVersions(version1: string, version2: string): number {
	const parseVersion = (version: string): number[] => {
		const parts = version.split('.').map((part) => Number(part));
		if (parts.some(isNaN)) {
			throw new Error('Invalid version format. Expected x.x.x');
		}

		return parts;
	};

	if (typeof version1 !== 'string' || typeof version2 !== 'string') {
		throw new Error('Both inputs should be strings. Expected x.x.x');
	}

	const v1Parts = parseVersion(version1);
	const v2Parts = parseVersion(version2);

	// Ensure both versions have the same number of parts
	const maxLength = Math.max(v1Parts.length, v2Parts.length);
	while (v1Parts.length < maxLength) v1Parts.push(0);
	while (v2Parts.length < maxLength) v2Parts.push(0);

	for (let i = 0; i < maxLength; i++) {
		if (v1Parts[i] > v2Parts[i]) return 1; // Version1 is greater
		if (v1Parts[i] < v2Parts[i]) return -1; // Version2 is greater
	}

	return 0; // Versions are equal
}
