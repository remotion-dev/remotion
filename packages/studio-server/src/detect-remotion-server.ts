import http from 'http';
import type {RemotionConfigResponse} from './remotion-config-response';

type RemotionDetectionResult =
	| {type: 'match'}
	| {type: 'mismatch'}
	| {type: 'not-remotion'};

export const detectRemotionServer = ({
	port,
	cwd,
	hostname,
}: {
	port: number;
	cwd: string;
	hostname: string;
}): Promise<RemotionDetectionResult> => {
	return new Promise((resolve) => {
		const req = http.get(
			{
				hostname,
				port,
				path: '/__remotion_config',
				timeout: 1000,
			},
			(res) => {
				let data = '';

				res.on('data', (chunk) => {
					data += chunk;
				});

				res.on('end', () => {
					try {
						const json = JSON.parse(data) as RemotionConfigResponse;

						if (json.isRemotion !== true) {
							return resolve({type: 'not-remotion'});
						}

						// Normalize paths for comparison to avoid issues with different separators or casing on Windows
						const normalize = (p: string) =>
							p.replace(/\\/g, '/').toLowerCase();

						if (normalize(json.cwd) === normalize(cwd)) {
							return resolve({type: 'match'});
						}

						return resolve({type: 'mismatch'});
					} catch {
						resolve({type: 'not-remotion'});
					}
				});
			},
		);

		req.on('error', () => resolve({type: 'not-remotion'}));
		req.on('timeout', () => {
			req.destroy();
			resolve({type: 'not-remotion'});
		});
	});
};
