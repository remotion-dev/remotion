import {execSync} from 'child_process';
import {VERSION} from 'remotion/version';

execSync(
	'gcloud builds submit --tag us-docker.pkg.dev/remotion-dev/cloud-run/render:' +
		VERSION,
	{stdio: 'inherit'}
);
