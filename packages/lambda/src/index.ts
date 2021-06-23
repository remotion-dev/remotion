import {deleteFunction} from './api/delete-function';
import {deployLambda} from './api/deploy-lambda';
import {deployProject} from './api/deploy-project';
import {ensureLambdaBinaries} from './api/ensure-lambda-binaries';
import {getDeployedLambdas} from './api/get-deployed-lambdas';
import {getFunctionInfo} from './api/get-function-info';
import {getFunctionVersion} from './api/get-function-version';
import {getOrCreateBucket} from './api/get-or-create-bucket';
import {getRenderProgress} from './api/get-render-progress';
import {simulatePermissions} from './api/iam-validation/simulate';
import {
	getRolePolicy,
	getUserPolicy,
} from './api/iam-validation/suggested-policy';
import {renderVideoOnLambda} from './api/render-video-on-lambda';

export {
	deployLambda,
	deployProject,
	ensureLambdaBinaries,
	getDeployedLambdas,
	getUserPolicy,
	getRolePolicy,
	getOrCreateBucket,
	getRenderProgress,
	renderVideoOnLambda,
	simulatePermissions,
	deleteFunction,
	getFunctionInfo,
	getFunctionVersion,
};
