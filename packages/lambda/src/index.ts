import {deployLambda} from './api/create-lambda';
import {deployProject} from './api/deploy-project';
import {getDeployedLambdas} from './api/get-deployed-lambdas';
import {getOrCreateBucket} from './api/get-or-create-bucket';
import {getRenderProgress} from './api/get-render-progress';
import {simulatePermissions} from './api/iam-validation/simulate';
import {
	getRolePolicy,
	getUserPolicy,
} from './api/iam-validation/suggested-policy';
import {ensureLayers} from './api/lambda-layers';
import {renderVideoOnLambda} from './api/render-video-on-lambda';

export {
	deployLambda,
	deployProject,
	ensureLayers,
	getDeployedLambdas,
	getUserPolicy,
	getRolePolicy,
	getOrCreateBucket,
	getRenderProgress,
	renderVideoOnLambda,
	simulatePermissions,
};
