export declare const HOST = "https://www.remotion.pro";
import type { NoReactInternals } from 'remotion/no-react';
export declare const exponentialBackoffMs: (attempt: number) => number;
export declare const sleep: (ms: number) => Promise<void>;
export type RegisterUsageEventResponse = {
    billable: boolean;
    classification: UsageEventClassification;
};
type UsageEventType = 'webcodec-conversion' | 'cloud-render';
export type UsageEventClassification = 'billable' | 'development' | 'failed';
type EitherApiKeyOrLicenseKey = true extends typeof NoReactInternals.ENABLE_V5_BREAKING_CHANGES ? {
    licenseKey: string | null;
} : {
    /**
     * @deprecated Use `licenseKey` instead
     */
    apiKey: string | null;
} | {
    licenseKey: string | null;
};
type RegisterUsageEventMandatoryOptions = {
    host: string | null;
    succeeded: boolean;
    event: UsageEventType;
} & EitherApiKeyOrLicenseKey;
type OptionalRegisterUsageEventOptional = {
    isStill: boolean;
    isProduction: boolean;
};
type InternalRegisterUsageEventOptions = RegisterUsageEventMandatoryOptions & OptionalRegisterUsageEventOptional;
type RegisterUsageEventOptions = RegisterUsageEventMandatoryOptions & Partial<OptionalRegisterUsageEventOptional>;
export declare const internalRegisterUsageEvent: ({ host, succeeded, event, isStill, isProduction, ...apiOrLicenseKey }: InternalRegisterUsageEventOptions) => Promise<RegisterUsageEventResponse>;
export declare const registerUsageEvent: (options: RegisterUsageEventOptions) => Promise<RegisterUsageEventResponse>;
export {};
