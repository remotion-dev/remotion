export type EventCount = {
    billable: number;
    failed: number;
    development: number;
};
export type GetUsageApiResponse = {
    success: true;
    cloudRenders: EventCount;
    webcodecConversions: EventCount;
} | {
    success: false;
    error: string;
};
export type GetUsageResponse = {
    cloudRenders: EventCount;
    webcodecConversions: EventCount;
};
export declare const getUsage: ({ apiKey, since, }: {
    apiKey: string;
    since?: number | null | undefined;
}) => Promise<GetUsageResponse>;
