import {execSync} from 'child_process';
import {colorCode} from './colorCodes.mjs';
/****************************************
 * Splash screen for Remotion Cloud Run
 ****************************************/

export function cloudRunSplashScreen() {
	execSync(
		`echo "\n\n${colorCode.greenBackground}                                                "`,
		{
			stdio: 'inherit',
		},
	);
	execSync('echo "    GCP project setup for Remotion Cloud Run    "', {
		stdio: 'inherit',
	});
	execSync(
		`echo "                                                \n\n${colorCode.resetText}"`,
		{stdio: 'inherit'},
	);
}
