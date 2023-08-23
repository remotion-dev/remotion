import http from 'https';

const getPackageJsonForRemotion = (): Promise<string> => {
	return new Promise<string>((resolve, reject) => {
		const req = http.get(
			'https://registry.npmjs.org/remotion',
			{
				headers: {
					accept:
						'application/vnd.npm.install-v1+json; q=1.0, application/json; q=0.8, */*',
				},
			},
			(res) => {
				let data = '';

				res.on('data', (d) => {
					data += d;
				});

				res.on('end', () => resolve(data));
			},
		);

		req.on('error', (error) => {
			reject(error);
		});

		req.end();
	});
};

export const getLatestRemotionVersion = async () => {
	const pkgJson = await getPackageJsonForRemotion();
	return JSON.parse(pkgJson)['dist-tags'].latest;
};
