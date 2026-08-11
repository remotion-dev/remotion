import {writeFileSync} from 'node:fs';
import path from 'node:path';
import {Log} from './log';
import type {PackageManager} from './pkg-managers';

export const createYarnYmlFile = ({
	projectRoot,
	pkgManagerVersion,
	pkgManager,
}: {
	projectRoot: string;
	pkgManagerVersion: string | null;
	pkgManager: PackageManager;
}) => {
	if (pkgManager !== 'yarn') {
		return;
	}

	if (!pkgManagerVersion) {
		return;
	}

	const majorVersion = pkgManagerVersion[0] as string;
	const majorVersionNumber = Number(majorVersion);

	if (majorVersionNumber < 2) {
		return;
	}

	Log.info(
		'Remotion has no support for automatically installing the Yarn PnP modules yet.',
	);
	Log.info('Creating .yarnrc.yml file to disable Yarn PnP.');

	const yarnrcYml = `nodeLinker: node-modules\n`;
	writeFileSync(path.join(projectRoot, '.yarnrc.yml'), yarnrcYml);
};
