import {execSync} from 'child_process';
import {colorCode} from './colorCodes.mjs';
/****************************************
 * Success screen for completing Terraform
 ****************************************/

export function tfSuccessScreen() {
	execSync(
		`echo "\n\n${colorCode.blueBackground}                                                "`,
		{
			stdio: 'inherit',
		},
	);
	execSync('echo "        Terraform completed successfully        "', {
		stdio: 'inherit',
	});
	execSync(
		`echo "                                                ${colorCode.resetText}\n\n"`,
		{stdio: 'inherit'},
	);
}
