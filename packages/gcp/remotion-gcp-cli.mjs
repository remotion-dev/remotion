#!/usr/bin/env node
import { exec } from 'child_process';
import minimist from 'minimist';
import {CliInternals} from '@remotion/cli';

const {Log} = CliInternals;

// process args:
// [2]. remotion version (this should match in the Artifact Registry)
// [3]. project name
// [4]. service name
// [5]. region

let args = minimist(process.argv.slice(2));
console.log(args);
console.log(args.project ? `project set to: ${args.project}` : 'no project set');
// console.log(args.remotionVersion ? `remotion version requested: ${args.remotionVersion}` : 'no remotion-version passed');
if (args.remotionVersion) {
	console.log(`remotion version requested: ${args.remotionVersion}`)
} else {
	Log.error('no remotion version set!')
}

// exec(`gcloud run deploy ${process.argv[4]} --image=us-docker.pkg.dev/remotion-dev/cloud-run/render:${process.argv[2]} --project=${args.project} --region=${process.argv[5]} --allow-unauthenticated`,
// 	(error, stdout, stderr) => {
// 		console.log(stdout);
// 		console.log(stderr);
// 		if (error !== null) {
// 			console.log(`exec error: ${error}`);
// 		}
// 	});

// 	npx remotion-gcp --remotion-version=3.3.36-alpha --project=remotion-lambda --service-name=hello --region=australia-southeast1