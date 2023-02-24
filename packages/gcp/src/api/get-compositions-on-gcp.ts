import type { TCompMetadata } from 'remotion';
import {
	getCompositions
} from '@remotion/renderer';

export type GetCompositionsOnGcpInput = {	serveUrl: string;};

export type GetCompositionsOnGcpOutput = TCompMetadata[];

/**
 * @description Returns the compositions from a serveUrl
 * @link https://remotion.dev/docs/lambda/getcompositionsOnGcp
 * @param params.serveUrl The URL of the deployed project
 * @returns The compositions
 */
export const getCompositionsOnGcp = async ({
	serveUrl
}: GetCompositionsOnGcpInput): Promise<GetCompositionsOnGcpOutput> => {

	try {
		const comps = await getCompositions(serveUrl);
		return comps;
	}
	catch (err) {
		throw err;
	}
};
