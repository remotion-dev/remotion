import { internalRegisterUsageEvent } from './register-usage-event';

export {
	UsageEventClassification as Classification,
	RegisterUsageEventResponse,
	registerUsageEvent,
} from './register-usage-event';

export {EventCount, GetUsageResponse, getUsage} from './get-usage';

export const LicensingInternals = {
	internalRegisterUsageEvent
}