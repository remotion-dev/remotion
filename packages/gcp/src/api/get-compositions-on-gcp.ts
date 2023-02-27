import {getCompositions} from '@remotion/renderer';
import type {TCompMetadata} from 'remotion';

export type GetCompositionsOnGcpInput = {serveUrl: string};

export type GetCompositionsOnGcpOutput = TCompMetadata[];

/**
 * @description Returns the compositions from a serveUrl
 * @link https://remotion.dev/docs/lambda/getcompositionsOnGcp
 * @param params.serveUrl The URL of the deployed project
 * @returns The compositions
 */
export const getCompositionsOnGcp = async ({
	serveUrl,
}: GetCompositionsOnGcpInput): Promise<GetCompositionsOnGcpOutput> => {
	const comps = await getCompositions(serveUrl);
	return comps;
};
