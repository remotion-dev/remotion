#!/usr/bin/env node
import { v2 } from '@google-cloud/run';
import fs from 'fs';

// 	npx remotion-gcp --remotion-version=3.3.36-alpha --project=remotion-lambda --service-name=hello --region=australia-southeast1

const { ServicesClient } = v2;

const sa_data = fs.readFileSync('./sa-key.json', 'utf8');
const sa_json = JSON.parse(sa_data)

const runClient = new ServicesClient({
	credentials: sa_json
});

const newService = await createService()

// TODO: Check input for whether to allow unauthenticated access
allowUnauthenticatedAccess(newService)


async function createService() {
	const project = 'remotion-lambda' // TODO: get from args
	const location = 'australia-southeast1' // TODO: get from args

	const parent = `projects/${project}/locations/${location}`
	const serviceId = 'remotionCloudRun' // TODO: get from args, or use a default name

	// service structure: https://googleapis.dev/nodejs/run/latest/google.cloud.run.v2.IService.html
	const service = {
		template: {
			containers: [
				{ image: 'us-docker.pkg.dev/remotion-dev/cloud-run/render:3.3.36-alpha' }
			]
		}
	}
	// Construct request
	const request = {
		parent,
		service,
		serviceId,
	};

	// Run request
	const [operation] = await runClient.createService(request);
	const [response] = await operation.promise();
	return response.name
}

async function allowUnauthenticatedAccess(newService) {
	await runClient.setIamPolicy(
		{
			resource: newService,
			policy: {
				bindings: [
					{
						role: 'roles/run.invoker',
						members: ['allUsers']
					}
				]
			}
		});
}