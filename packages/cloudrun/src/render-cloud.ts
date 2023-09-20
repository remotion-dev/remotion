import dotenv from 'dotenv';
import type {GcpRegion} from './index';
import {getServices, renderMediaOnCloudrun} from './index';
dotenv.config();
async function execute() {
	const services = await getServices({
		region: 'australia-southeast2',
		compatibleOnly: false,
	});

	const {serviceName} = services[0];
	console.log(serviceName);

	const result = await renderMediaOnCloudrun({
		serviceName,
		region:
			(process.env.REGION as GcpRegion) ?? ('asia-southeast2' as GcpRegion),
		serveUrl: process.env.SERVE_URL ?? '',
		composition: 'MyComp',
		inputProps: {},
		codec: 'h264',
	});
	if (result.type === 'success') {
		console.log(result.bucketName);
		console.log(result.renderId);
	}
}

execute()
	.then(() => process.exit(0))
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});
