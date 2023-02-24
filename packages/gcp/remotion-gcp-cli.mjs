#!/usr/bin/env node
import { v2 } from "@google-cloud/run";
import fs from "fs";
import { Storage, TransferManager } from "@google-cloud/storage";

// 	npx remotion-gcp --remotion-version=3.3.51-alpha --project=remotion-lambda --service-name=hello --region=australia-southeast1

// const { ServicesClient } = v2;

const sa_data = fs.readFileSync("./sa-key.json", "utf8");
const sa_json = JSON.parse(sa_data);

// const runClient = new ServicesClient({
// 	credentials: sa_json
// });

// const newService = await createService()

// // TODO: Check input for whether to allow unauthenticated access
// allowUnauthenticatedAccess(newService)

// async function createService() {
// 	const project = 'remotion-lambda' // TODO: get from args
// 	const location = 'australia-southeast1' // TODO: get from args

// 	const parent = `projects/${project}/locations/${location}`
// 	const serviceId = 'remotionCloudRun' // TODO: get from args, or use a default name

// 	// service structure: https://googleapis.dev/nodejs/run/latest/google.cloud.run.v2.IService.html
// 	const service = {
// 		template: {
// 			containers: [
// 				{ image: 'us-docker.pkg.dev/remotion-dev/cloud-run/render:3.3.51-alpha' }
// 			]
// 		}
// 	}
// 	// Construct request
// 	const request = {
// 		parent,
// 		service,
// 		serviceId,
// 	};

// 	// Run request
// 	const [operation] = await runClient.createService(request);
// 	const [response] = await operation.promise();
// 	return response.name
// }

// async function allowUnauthenticatedAccess(newService) {
// 	await runClient.setIamPolicy(
// 		{
// 			resource: newService,
// 			policy: {
// 				bindings: [
// 					{
// 						role: 'roles/run.invoker',
// 						members: ['allUsers']
// 					}
// 				]
// 			}
// 		});
// }

const cloudStorageClient = new Storage({
  credentials: sa_json,
});

// cloudStorageClient.bucket('remotionlambda-testy').get()

// const result = await cloudStorageClient.bucket('remotionlambda-testc').get();
const bucketName = "remotionlambda-test";
const prefix = "sites/xmycbufjs3/";
// const [files] = await cloudStorageClient.bucket(bucketName).getFiles({ prefix });
// // const [files, nextContinuationToken] = await cloudStorageClient.bucket('gcp-public-data-landsat').getFiles({ prefix: 'LC08/01/001' });

// const dir = [
// 	'bundle.js', 'bundle.js.map'
// ]

// const filesOnStorageButNotLocal = files.filter((fileOnStorage) => {
// 	const key = fileOnStorage.name?.substring(prefix.length);
// 	return !dir[key];
// });
// filesOnStorageButNotLocal.map((d) => [
// 	console.log('d', d.name)
// ])

// const key = 'sites/xmycbufjs3/LibraryMock.png'
// await cloudStorageClient.bucket(bucketName).file(key).delete();
// https://storage.googleapis.com/remotionlambda-test/sites/xmycbufjs3/LibraryMock.png
const firstFilePath = "haloInf.mp4";
const secondFilePath = "zoomJump.mp4";

// const transferManager = new TransferManager(cloudStorageClient.bucket(bucketName));
// await transferManager.uploadManyFiles([firstFilePath, secondFilePath], { prefix });

// for (const filePath of [firstFilePath, secondFilePath]) {
// 	console.log(`${filePath} uploaded to ${bucketName}.`);
// }

const bucket = cloudStorageClient.bucket(bucketName);
const remote_file = bucket.file("new/haloInf.mp4");

console.log("test message");

const uploadPromises = [];
const paths = [firstFilePath, secondFilePath];

async function uploadInParallel() {
  for (const index in paths) {
    const path = paths[index];
    const fileSizeInBytes = fs.statSync(path).size;
    uploadPromises.push(
      fs
        .createReadStream(path)
        .pipe(bucket.file(`new/${path}`).createWriteStream())
        .on("error", function (err) {})
        .on("progress", function (p) {
          console.log(
            path,
            `${Math.floor((p.bytesWritten / fileSizeInBytes) * 100)}%`
          );
        })
        .on("finish", function () {
          console.log(path, " completed");
        })
    );
  }
}
// const promise = Promise.all(uploadPromises).catch(console.error);

// uploadInParallel()
// console.log('before')
// await promise
// console.log('after')

const uploads = paths.map(async (path) => {
  const fileSizeInBytes = fs.statSync(path).size;
  return new Promise((resolve, reject) => {
    fs.createReadStream(path)
      .pipe(bucket.file(`new/${path}`).createWriteStream())
      .on("error", (error) => reject(error))
      .on("progress", function (p) {
        console.log(
          path,
          `${Math.floor((p.bytesWritten / fileSizeInBytes) * 100)}%`
        );
      })
      .on("finish", () => resolve("done"));
  });
});
console.log("before");
const promise = Promise.all(uploads);
await promise;
console.log("after");
