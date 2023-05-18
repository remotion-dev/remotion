import {execSync} from 'child_process';
// Components
import {colorCode} from './installerScripts/components/colorCodes.mjs';
import {projectIdPrompt} from './installerScripts/components/projectIdPrompt.mjs';
import {cloudRunSplashScreen} from './installerScripts/components/splashScreen.mjs';
import {taskPrompt} from './installerScripts/components/taskPrompt.mjs';
// Tasks
import {generateEnv} from './installerScripts/tasks/generateEnv.mjs';
import {setupGcpProject} from './installerScripts/tasks/setupGcpProject.mjs';

/****************************************
 * Splash screen for Remotion Cloud Run
 ****************************************/
cloudRunSplashScreen();

const start = async () => {
	/****************************************
	 * Set project ID for Terraform and gcloud commands
	 ****************************************/
	execSync(`echo "Retrieving current Project ID..."`, {
		stdio: 'inherit',
	});

	const projectID =
		execSync('gcloud config get-value project', {
			stdio: ['inherit', 'pipe', 'pipe'],
		})
			.toString()
			.trim() || (await projectIdPrompt());

	execSync(
		`echo "Project set to ${colorCode.blueText}${projectID}${colorCode.resetText}\n"`,
		{
			stdio: 'inherit',
		}
	);

	/****************************************
	 * Check task the user is trying to complete
	 ****************************************/
	const selection = await taskPrompt(projectID);

	switch (selection) {
		case 'runTerraform':
			await setupGcpProject(projectID);
			break;

		case 'generateEnv':
			await generateEnv(projectID);
			break;

		default:
			break;
	}
};

start();
