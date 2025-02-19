import {deleteService} from './api/delete-service';
import {deleteSite} from './api/delete-site';
import type {
	DeployServiceInput,
	DeployServiceOutput,
} from './api/deploy-service';
import {deployService} from './api/deploy-service';
import {deploySite} from './api/deploy-site';
import {getOrCreateBucket} from './api/get-or-create-bucket';
import {getRegions} from './api/get-regions';
import {getServiceInfo} from './api/get-service-info';
import {getServices} from './api/get-services';
import {getSites as deprecatedGetSites} from './api/get-sites';
import {testPermissions} from './api/iam-validation/testPermissions';
import type {RenderMediaOnCloudrunInput} from './api/render-media-on-cloudrun';
import {renderMediaOnCloudrun as deprecatedRenderMediaOnCloudrun} from './api/render-media-on-cloudrun';
import {renderStillOnCloudrun as deprecatedRenderStillOnCloudrun} from './api/render-still-on-cloudrun';
import {speculateServiceName} from './api/speculate-service-name';
import type {RenderMediaOnCloudrunOutput} from './functions/helpers/payloads';
import {CloudrunInternals} from './internals';
import type {GcpRegion} from './pricing/gcp-regions';

/**
 * @deprecated  Import this from `@remotion/cloudrun/client` instead
 */
const renderMediaOnCloudrun = deprecatedRenderMediaOnCloudrun;

/**
 * @deprecated  Import this from `@remotion/cloudrun/client` instead
 */
const renderStillOnCloudrun = deprecatedRenderStillOnCloudrun;

/**
 * @deprecated Import this from `@remotion/lambda/client` instead
 */
const getSites = deprecatedGetSites;

export {
	CloudrunInternals,
	deleteService,
	deleteSite,
	deployService,
	deploySite,
	getOrCreateBucket,
	getRegions,
	getServiceInfo,
	getServices,
	getSites,
	renderMediaOnCloudrun,
	renderStillOnCloudrun,
	speculateServiceName,
	testPermissions,
};
export type {
	DeployServiceInput,
	DeployServiceOutput,
	GcpRegion,
	RenderMediaOnCloudrunInput,
	RenderMediaOnCloudrunOutput,
};
