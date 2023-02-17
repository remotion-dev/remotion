import { v2 } from '@google-cloud/run';
import fs from 'fs';

const { ServicesClient } = v2;

const sa_data = fs.readFileSync('./sa-key.json', 'utf8');
const sa_json = JSON.parse(sa_data)

export const getCloudRunClient = () => {
	return new ServicesClient({
		credentials: sa_json
	})
};
