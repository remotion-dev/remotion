import fs from 'fs';
import path from 'path';
import {bundleLambda} from '../api/bundle-lambda';

export const pushLayer = async () => {
	const lambda = await bundleLambda();
	const folder = path.join(process.cwd(), 'image');
	if (!fs.existsSync(folder)) {
		fs.mkdirSync(folder);
	}

	fs.renameSync(lambda, path.join(folder, 'app.js'));
};

pushLayer()
	.then(() => {
		process.exit(0);
	})
	.catch((err) => {
		console.log(err);
		process.exit(1);
	});
