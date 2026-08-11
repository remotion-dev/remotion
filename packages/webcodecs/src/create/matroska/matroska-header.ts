import {makeMatroskaBytes} from './matroska-utils';

export const makeMatroskaHeader = () => {
	return makeMatroskaBytes({
		type: 'Header',
		value: [
			{
				minVintWidth: null,
				type: 'EBMLVersion',
				value: {
					value: 1,
					byteLength: null,
				},
			},
			{
				minVintWidth: null,
				type: 'EBMLReadVersion',
				value: {
					value: 1,
					byteLength: null,
				},
			},
			{
				type: 'EBMLMaxIDLength',
				value: {
					byteLength: null,
					value: 4,
				},
				minVintWidth: null,
			},
			{
				type: 'EBMLMaxSizeLength',
				value: {
					byteLength: null,
					value: 8,
				},
				minVintWidth: null,
			},
			{
				type: 'DocType',
				value: 'webm',
				minVintWidth: null,
			},
			{
				type: 'DocTypeVersion',
				value: {
					byteLength: null,
					value: 4,
				},
				minVintWidth: null,
			},
			{
				type: 'DocTypeReadVersion',
				value: {
					byteLength: null,
					value: 2,
				},
				minVintWidth: null,
			},
		],
		minVintWidth: null,
	});
};
