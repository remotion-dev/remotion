import type {PackageInstallSpec} from '@remotion/studio-shared';
import {installPackages} from '../api/install-package';
import {showNotification} from '../components/Notifications/NotificationCenter';

let installQueue: Promise<void> = Promise.resolve();

const uniqueDependencies = (
	dependencies: readonly PackageInstallSpec[],
): PackageInstallSpec[] =>
	Array.from(
		new Map(
			dependencies.map((dependency) => [dependency.name, dependency] as const),
		).values(),
	);

export const getMissingPackages = (
	dependencies: readonly PackageInstallSpec[],
) => {
	const installedPackages = window.remotion_installedPackages ?? [];
	return uniqueDependencies(dependencies).filter(
		(dependency) =>
			dependency.version !== null ||
			!installedPackages.includes(dependency.name),
	);
};

const addInstalledPackages = (dependencies: readonly PackageInstallSpec[]) => {
	const installedPackages = window.remotion_installedPackages ?? [];
	window.remotion_installedPackages = Array.from(
		new Set([
			...installedPackages,
			...uniqueDependencies(dependencies).map((dependency) => dependency.name),
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
