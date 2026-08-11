/* eslint-disable no-bitwise */
import {accessSync, chmodSync, constants, statSync} from 'node:fs';

const hasPermissions = (p: string) => {
	// We observe that with Bun, the problem also happens in macOS
	if (process.platform !== 'linux' && process.platform !== 'darwin') {
		try {
			accessSync(p, constants.X_OK);
			return true;
		} catch {
			return false;
		}
	}

	// On Linux, checking file permissions, because Node.js
	// seems buggy: https://github.com/remotion-dev/remotion/issues/3587
	const stats = statSync(p);
	const {mode} = stats;
	const othersHaveExecutePermission = Boolean(mode & 0o001);

	if (othersHaveExecutePermission) {
		return true;
	}

	if (!process.getuid || !process.getgid) {
		throw new Error(
			'Cannot check permissions on Linux without process.getuid and process.getgid',
		);
	}

	const uid = process.getuid();
	const gid = process.getgid();

	const isOwner = uid === stats.uid;
	const isGroup = gid === stats.gid;

	const ownerHasExecutePermission = Boolean(mode & 0o100);
	const groupHasExecutePermission = Boolean(mode & 0o010);

	const canExecute =
		(isOwner && ownerHasExecutePermission) ||
		(isGroup && groupHasExecutePermission);

	return canExecute;
};

export const makeFileExecutableIfItIsNot = (path: string) => {
	const hasPermissionsResult = hasPermissions(path);
	if (!hasPermissionsResult) {
		chmodSync(path, 0o755);
	}
};
