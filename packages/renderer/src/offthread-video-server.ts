import {createReadStream} from 'fs';
import http, {RequestListener} from 'http';

type StartOffthreadVideoServerReturnType = {
	close: () => void;
};

export const startOffthreadVideoServer =
	(): Promise<StartOffthreadVideoServerReturnType> => {
		const requestListener: RequestListener = (req, res) => {
			res.setHeader('content-type', 'image/png');
			res.writeHead(200);
			createReadStream(
				'/Users/jonathanburger/remotion/packages/example/public/logo.png'
			)
				.pipe(res)
				.on('close', () => {
					res.end();
				});
		};

		const server = http.createServer(requestListener);
		return new Promise<StartOffthreadVideoServerReturnType>((resolve) => {
			server.listen(9999, 'localhost', () => {
				resolve({
					close: () => server.close(),
				});
			});
		});
	};
