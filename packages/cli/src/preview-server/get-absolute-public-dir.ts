import path from 'path';

export const getAbsolutePublicDir = ({
	userPassedPublicDir,
	remotionRoot,
}: {
	userPassedPublicDir: string | null;
	remotionRoot: string;
}) => {
	const publicDir = userPassedPublicDir
		? path.resolve(remotionRoot, userPassedPublicDir)
		: path.join(remotionRoot, 'public');

	return publicDir;
};
