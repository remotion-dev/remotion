import dotenv from 'dotenv';
import {execSync} from 'node:child_process';

dotenv.config();
const isTest = false;
const pypiRepo = isTest ? 'testpypi' : 'pypi';

try {
	/**
	 * creates an environment file that is referenced by twine
	 */
	execSync(
		`cat <<EOF > ~/.pypirc
[${pypiRepo}]
username = __token__
password = ${process.env.PYPI_PASSWORD}
EOF`,
		{
			stdio: 'inherit',
		},
	);

	const commands = [
		'python -m venv remotion-env',
		'. ./remotion-env/bin/activate',
		'pip install boto3 twine wheel setuptools',
		'python setup.py sdist bdist_wheel',
		`python -m twine upload --repository ${pypiRepo} dist/*`,
		'deactivate',
	];

	execSync(commands.join(' && '), {
		stdio: 'inherit',
	});

	console.log('Remotion lambda published.');
} catch (error) {
	console.log('Something went wrong whit publishing ', error);
} finally {
	console.log('Cleaning up....');
	// clean up used folder
	const rmComm = [
		'rm -rf build',
		'rm -rf dist',
		'rm -rf remotion_lambda.*',
		'rm -rf remotion-env',
	];
	execSync(rmComm.join(' && '), {
		stdio: 'inherit',
	});
	console.log('Cleaning up successful.');
}
