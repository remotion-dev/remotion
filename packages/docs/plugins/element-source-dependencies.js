import path from 'path';

export default function elementSourceDependencies({siteDir}) {
	const elementsRoot = path.join(siteDir, 'elements');

	return {
		name: 'element-source-dependencies',
		configureWebpack() {
			return {
				module: {
					rules: [
						{
							test: /\.mdx?$/i,
							include: elementsRoot,
							enforce: 'pre',
							use: [
								{
									loader: path.join(
										siteDir,
										'plugins',
										'element-source-dependency-loader.cjs',
									),
									options: {elementsRoot},
								},
							],
						},
					],
				},
			};
		},
	};
}
