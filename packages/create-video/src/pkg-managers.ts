type PackageManager = 'npm' | 'yarn' | 'pnpm';

const shouldUseYarn = (): boolean => {
	return Boolean(
		process.env.npm_execpath?.includes('yarn.js') ||
			process.env.npm_config_user_agent?.includes('yarn')
	);
};

const shouldUsePnpm = (): boolean => {
	console.log(process.env, process.cwd(), __dirname, __filename);
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
