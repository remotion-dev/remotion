// Rspack's RealContentHashPlugin globally replaces preliminary hashes in all
// assets. An eight-character hash can occur in source data and corrupt a
// bundle: https://github.com/web-infra-dev/rspack/issues/8474
const shortContentHash = '[contenthash:8]';
const longContentHash = '[contenthash:12]';

export default function longContentHashes() {
	return {
		name: 'long-content-hashes',
		configureWebpack(config, isServer) {
			if (isServer || config.mode !== 'production') {
				return {};
			}

			for (const key of ['filename', 'chunkFilename']) {
				const value = config.output?.[key];
				if (typeof value === 'string') {
					config.output[key] = value.replace(shortContentHash, longContentHash);
				}
			}

			for (const plugin of config.plugins ?? []) {
				const options = plugin?.options;
				if (!options) {
					continue;
				}

				for (const key of ['filename', 'chunkFilename']) {
					const value = options[key];
					if (typeof value === 'string') {
						options[key] = value.replace(shortContentHash, longContentHash);
					}
				}
			}

			return {};
		},
	};
}
