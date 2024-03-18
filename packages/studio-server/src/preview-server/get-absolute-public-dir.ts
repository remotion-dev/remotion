import path from 'node:path';

export const getAbsolutePublicDir = ({
	relativePublicDir,
	remotionRoot,
}: {
	relativePublicDir: string | null;
	remotionRoot: string;
}) => {
	return relativePublicDir
		? path.resolve(remotionRoot, relativePublicDir)
		: path.join(remotionRoot, 'public');
};
