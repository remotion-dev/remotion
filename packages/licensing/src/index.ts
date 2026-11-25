import {logDeprecatedStillRenderLicenseKey} from './log-deprecated-still-render-license-key';
import {
	getUsageEventErrorMessage,
	internalRegisterUsageEvent,
} from './register-usage-event';

export {
	UsageEventClassification as Classification,
	registerUsageEvent,
	RegisterUsageEventResponse,
} from './register-usage-event';

export {EventCount, getUsage, GetUsageResponse} from './get-usage';

export const LicensingInternals = {
	internalRegisterUsageEvent,
	getUsageEventErrorMessage,
	logDeprecatedStillRenderLicenseKey,
};
