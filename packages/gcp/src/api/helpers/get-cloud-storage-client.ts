import {Storage} from '@google-cloud/storage';
import fs from 'fs';

const sa_data = fs.readFileSync('./sa-key.json', 'utf8');
const sa_json = JSON.parse(sa_data);

export const getCloudStorageClient = () => {
	return new Storage({
		credentials: sa_json,
	});
};
