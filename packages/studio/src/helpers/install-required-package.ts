import {
	getMissingPackageDependencies,
	uniquePackageDependencies,
	type PackageInstallSpec,
} from '@remotion/studio-shared';
import {installPackages} from '../api/install-package';
import {showNotification} from '../components/Notifications/NotificationCenter';

let installQueue: Promise<void> = Promise.resolve();

export const getMissingPackages = (
	dependencies: readonly PackageInstallSpec[],
) =>
	getMissingPackageDependencies({
		dependencies,
		installedPackages: window.remotion_installedPackages ?? [],
	});

const addInstalledPackages = (dependencies: readonly PackageInstallSpec[]) => {
	const installedPackages = window.remotion_installedPackages ?? [];
	window.remotion_installedPackages = Array.from(
		new Set([
			...installedPackages,
			...uniquePackageDependencies(dependencies).map(
				(dependency) => dependency.name,
			),
		]),
	);
};

const formatPackageList = (dependencies: PackageInstallSpec[]) =>
	dependencies.length === 1
		? dependencies[0]!.name
		: `${dependencies.length} packages`;

export const installRequiredPackages = async (
	dependencies: readonly PackageInstallSpec[],
): Promise<void> => {
	const runInstall = async () => {
		const missingPackages = getMissingPackages(dependencies);
		if (missingPackages.length === 0) return;
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
