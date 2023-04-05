// this will be executed with node
import { execSync } from "child_process";

// execSync("gcloud config get-value project", (error, stdout, stderr, {stdio: 'inherit'}) => {
//   if (error) {
//     console.log(`error: ${error.message}`);
//     return;
//   }

//   if (stderr) {
//     console.log(`stderr: ${stderr}`);
//     return;
//   }

//   console.log('setting TF_VAR_project_id');
//   execSync(`export TF_VAR_project_id=${stdout}`)
//   console.log('stdout');
// })


console.log('setting project_id in Terraform, based on current project.')

execSync(
  'export TF_VAR_project_id=$(gcloud config get-value project)',
  {stdio: 'inherit'}
);

execSync(
  'echo project_id set to $TF_VAR_project_id',
  {stdio: 'inherit'}
);

console.log('Initialising Terraform.')

execSync(
  'terraform init',
  {stdio: 'inherit'}
);

execSync(
  'terraform apply',
  {stdio: 'inherit'}
);


// try {
//   const cmd = 'gcloud config get-value project';
//   execSync(cmd, {
//     encoding: "utf8"
//   })
// } catch (error) {
//   console.log(`Status Code: ${error.status} with '${error.message}'`);
// }

// exec("gcloud config get-value project", (error, stdout, stderr) => {
//   if (error) {
//     console.log(`error: ${error.message}`);
//     return;
//   }

//   if (stderr) {
//     console.log(`stderr: ${stderr}`);
//     return;
//   }

//   console.log('setting TF_VAR_project_id');
//   exec(`export TF_VAR_project_id=${stdout}`)
//   console.log('stdout');
// });

// exec("terraform init", (error, stdout, stderr) => {
//   if (error) {
//     console.log(`error: ${error.message}`);
//     return;
//   }

//   if (stderr) {
//     console.log(`stderr: ${stderr}`);
//     return;
//   }

//   console.log(stdout)

//   console.log('Terraform initialised');
// })