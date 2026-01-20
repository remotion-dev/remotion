export { UsageEventClassification as Classification, RegisterUsageEventResponse, registerUsageEvent, } from './register-usage-event';
export { EventCount, GetUsageResponse, getUsage } from './get-usage';
export declare const LicensingInternals: {
    internalRegisterUsageEvent: ({ host, succeeded, event, isStill, isProduction, ...apiOrLicenseKey }: ({
        host: string | null;
        succeeded: boolean;
        event: "cloud-render" | "webcodec-conversion";
    } & ({
        apiKey: string | null;
    } | {
        licenseKey: string | null;
    })) & {
        isStill: boolean;
        isProduction: boolean;
    }) => Promise<import("./register-usage-event").RegisterUsageEventResponse>;
};
