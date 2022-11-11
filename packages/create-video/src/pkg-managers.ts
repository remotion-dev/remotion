import path from 'path';
import type {Template} from './templates';

export type PackageManager = 'npm' | 'yarn' | 'pnpm';

const shouldUseYarn = (): boolean => {
	return Boolean(
		process.env.npm_execpath?.includes('yarn.js') ||
			process.env.npm_config_user_agent?.includes('yarn')
	);
};

const shouldUsePnpm = (): boolean => {
	if (__dirname.includes(path.join('.pnpm', 'create-video'))) {
		return true;
	}

	if (!process.env.npm_config_argv) {
		return false;
	}

	try {
		const conf = JSON.parse(process.env.npm_config_argv);
		return conf.remain[0] === 'dlx';
	} catch (err) {
		return false;
	}
};

export const selectPackageManager = (): PackageManager => {
	if (shouldUseYarn()) {
		return 'yarn';
	}

	if (shouldUsePnpm()) {
		return 'pnpm';
	}

	return 'npm';
};

export const getInstallCommand = (manager: PackageManager) => {
	if (manager === 'npm') {
		return `npm i`;
	}

	if (manager === 'yarn') {
		return `yarn`;
	}

	if (manager === 'pnpm') {
		return `pnpm i`;
	}
};

export const getDevCommand = (manager: PackageManager, template: Template) => {
	if (template.cliId === 'remix') {
		return `${getRunCommand(manager)} dev`;
	}

	return getStartCommand(manager);
};

export const getRenderCommandForTemplate = (
	manager: PackageManager,
	template: Template
) => {
	if (template.cliId === 'remix') {
		return `${getRunCommand(manager)} remotion:render`;
	}

	return getRenderCommand(manager);
};

export const getStartCommand = (manager: PackageManager) => {
	if (manager === 'npm') {
		return `npm start`;
	}

	if (manager === 'yarn') {
		return `yarn start`;
	}

	if (manager === 'pnpm') {
		return `pnpm start`;
	}
};

export const getRenderCommand = (manager: PackageManager) => {
	if (manager === 'npm') {
		return `npm run build`;
	}

	if (manager === 'yarn') {
		return `yarn build`;
	}

	if (manager === 'pnpm') {
		return `pnpm build`;
	}
};

export const getRunCommand = (manager: PackageManager) => {
	if (manager === 'npm') {
		return `npm run`;
	}

	if (manager === 'yarn') {
		return `yarn run`;
	}

	if (manager === 'pnpm') {
		return `pnpm run`;
	}

	throw new TypeError('unknown package manager');
};
