import {installPackages} from '../api/install-package';
import {showNotification} from '../components/Notifications/NotificationCenter';

let installQueue: Promise<void> = Promise.resolve();

export const getMissingPackages = (packageNames: string[]) => {
	const uniquePackageNames = Array.from(new Set(packageNames));
	const installedPackages = window.remotion_installedPackages ?? [];

	return uniquePackageNames.filter(
		(packageName) => !installedPackages.includes(packageName),
	);
};

const addInstalledPackages = (packageNames: string[]) => {
	const installedPackages = window.remotion_installedPackages ?? [];
	window.remotion_installedPackages = Array.from(
		new Set([...installedPackages, ...packageNames]),
	);
};

const formatPackageList = (packageNames: string[]) => {
	if (packageNames.length === 1) {
		return packageNames[0];
	}

	return `${packageNames.length} packages`;
};

export const installRequiredPackages = async (
	packageNames: string[],
): Promise<void> => {
	const runInstall = async () => {
		const missingPackages = getMissingPackages(packageNames);
		if (missingPackages.length === 0) {
			return;
		}

		showNotification(
			`Installing ${formatPackageList(missingPackages)}...`,
			3000,
		);
		await installPackages(missingPackages);
		addInstalledPackages(missingPackages);
		showNotification(`Installed ${formatPackageList(missingPackages)}`, 3000);
	};

	const queuedInstall = installQueue.then(runInstall, runInstall);
	installQueue = queuedInstall.catch(() => undefined);
	await queuedInstall;
};
