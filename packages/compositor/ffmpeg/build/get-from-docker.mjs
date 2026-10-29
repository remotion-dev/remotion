import {execSync} from 'child_process';

const containerName = process.argv[2];
const path = process.argv[3];

const result = execSync(`docker run -d ${containerName}`);

const id = result.toString().trim();

execSync(`docker cp ${id}:${path} ffmpeg.tar.gz`);

execSync('docker stop ' + result);
