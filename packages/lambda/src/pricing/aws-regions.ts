export const DEFAULT_AWS_REGIONS = ['eu-central-1'] as const;

export const AWS_REGIONS = ['eu-central-1'] as const;

export type AwsRegion = typeof AWS_REGIONS[number];
