export const checkNodeVersionAndWarnAboutRosetta = () => {
	const version = process.version.replace('v', '').split('.');
	const majorVersion = Number(version[0]);
	const requiredNodeVersion = 16;

	if (majorVersion < 16) {
		throw new Error(
			`Remotion requires at least Node ${requiredNodeVersion}. You currently have ${process.version}. Update your node version to ${requiredNodeVersion} to use Remotion.`
		);
	}
};
