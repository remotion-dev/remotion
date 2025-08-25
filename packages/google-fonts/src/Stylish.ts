import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Stylish',
	importName: 'Stylish',
	version: 'v25',
	url: 'https://fonts.googleapis.com/css2?family=Stylish:ital,wght@0,400',
	unicodeRanges: {
		'[2]':
			'U+d723-d728, U+d72a-d733, U+d735-d748, U+d74a-d74f, U+d752-d753, U+d755-d757, U+d75a-d75f, U+d762-d764, U+d766-d768, U+d76a-d76b, U+d76d-d76f, U+d771-d787, U+d789-d78b, U+d78d-d78f, U+d791-d797, U+d79a, U+d79c, U+d79e-d7a3, U+f900-f909, U+f90b-f92e',
		'[3]':
			'U+d679-d68b, U+d68e-d69e, U+d6a0, U+d6a2-d6a7, U+d6a9-d6c3, U+d6c6-d6c7, U+d6c9-d6cb, U+d6cd-d6d3, U+d6d5-d6d6, U+d6d8-d6e3, U+d6e5-d6e7, U+d6e9-d6fb, U+d6fd-d717, U+d719-d71f, U+d721-d722',
		'[4]':
			'U+d5bc-d5c7, U+d5ca-d5cb, U+d5cd-d5cf, U+d5d1-d5d7, U+d5d9-d5da, U+d5dc, U+d5de-d5e3, U+d5e6-d5e7, U+d5e9-d5eb, U+d5ed-d5f6, U+d5f8, U+d5fa-d5ff, U+d602-d603, U+d605-d607, U+d609-d60f, U+d612-d613, U+d616-d61b, U+d61d-d637, U+d63a-d63b, U+d63d-d63f, U+d641-d647, U+d64a-d64c, U+d64e-d653, U+d656-d657, U+d659-d65b, U+d65d-d666, U+d668, U+d66a-d678',
		'[5]':
			'U+d507, U+d509-d50b, U+d50d-d513, U+d515-d53b, U+d53e-d53f, U+d541-d543, U+d545-d54c, U+d54e, U+d550, U+d552-d557, U+d55a-d55b, U+d55d-d55f, U+d561-d564, U+d566-d567, U+d56a, U+d56c, U+d56e-d573, U+d576-d577, U+d579-d583, U+d585-d586, U+d58a-d5a4, U+d5a6-d5bb',
		'[6]':
			'U+d464-d477, U+d47a-d47b, U+d47d-d47f, U+d481-d487, U+d489-d48a, U+d48c, U+d48e-d4e7, U+d4e9-d503, U+d505-d506',
		'[7]':
			'U+d3bf-d3c7, U+d3ca-d3cf, U+d3d1-d3eb, U+d3ee-d3ef, U+d3f1-d3f3, U+d3f5-d3fb, U+d3fd-d400, U+d402-d45b, U+d45d-d463',
		'[8]':
			'U+d2ff, U+d302-d304, U+d306-d30b, U+d30f, U+d311-d313, U+d315-d31b, U+d31e, U+d322-d324, U+d326-d327, U+d32a-d32b, U+d32d-d32f, U+d331-d337, U+d339-d33c, U+d33e-d37b, U+d37e-d37f, U+d381-d383, U+d385-d38b, U+d38e-d390, U+d392-d397, U+d39a-d39b, U+d39d-d39f, U+d3a1-d3a7, U+d3a9-d3aa, U+d3ac, U+d3ae-d3b3, U+d3b5-d3b7, U+d3b9-d3bb, U+d3bd-d3be',
		'[9]':
			'U+d257-d27f, U+d281-d29b, U+d29d-d29f, U+d2a1-d2ab, U+d2ad-d2b7, U+d2ba-d2bb, U+d2bd-d2bf, U+d2c1-d2c7, U+d2c9-d2ef, U+d2f2-d2f3, U+d2f5-d2f7, U+d2f9-d2fe',
		'[10]':
			'U+d1b4, U+d1b6-d1f3, U+d1f5-d22b, U+d22e-d22f, U+d231-d233, U+d235-d23b, U+d23d-d240, U+d242-d256',
		'[11]':
			'U+d105-d12f, U+d132-d133, U+d135-d137, U+d139-d13f, U+d141-d142, U+d144, U+d146-d14b, U+d14e-d14f, U+d151-d153, U+d155-d15b, U+d15e-d187, U+d189-d19f, U+d1a2-d1a3, U+d1a5-d1a7, U+d1a9-d1af, U+d1b2-d1b3',
		'[12]':
			'U+d04b-d04f, U+d051-d057, U+d059-d06b, U+d06d-d06f, U+d071-d073, U+d075-d07b, U+d07e-d0a3, U+d0a6-d0a7, U+d0a9-d0ab, U+d0ad-d0b3, U+d0b6, U+d0b8, U+d0ba-d0bf, U+d0c2-d0c3, U+d0c5-d0c7, U+d0c9-d0cf, U+d0d2, U+d0d6-d0db, U+d0de-d0df, U+d0e1-d0e3, U+d0e5-d0eb, U+d0ee-d0f0, U+d0f2-d104',
		'[13]':
			'U+cfa2-cfc3, U+cfc5-cfdf, U+cfe2-cfe3, U+cfe5-cfe7, U+cfe9-cff4, U+cff6-cffb, U+cffd-cfff, U+d001-d003, U+d005-d017, U+d019-d033, U+d036-d037, U+d039-d03b, U+d03d-d04a',
		'[14]':
			'U+cef0-cef3, U+cef6, U+cef9-ceff, U+cf01-cf03, U+cf05-cf07, U+cf09-cf0f, U+cf11-cf12, U+cf14-cf1b, U+cf1d-cf1f, U+cf21-cf2f, U+cf31-cf53, U+cf56-cf57, U+cf59-cf5b, U+cf5d-cf63, U+cf66, U+cf68, U+cf6a-cf6f, U+cf71-cf84, U+cf86-cf8b, U+cf8d-cfa1',
		'[15]':
			'U+ce3c-ce57, U+ce5a-ce5b, U+ce5d-ce5f, U+ce61-ce67, U+ce6a, U+ce6c, U+ce6e-ce73, U+ce76-ce77, U+ce79-ce7b, U+ce7d-ce83, U+ce85-ce88, U+ce8a-ce8f, U+ce91-ce93, U+ce95-ce97, U+ce99-ce9f, U+cea2, U+cea4-ceab, U+cead-cee3, U+cee6-cee7, U+cee9-ceeb, U+ceed-ceef',
		'[16]':
			'U+cd92-cd93, U+cd96-cd97, U+cd99-cd9b, U+cd9d-cda3, U+cda6-cda8, U+cdaa-cdaf, U+cdb1-cdc3, U+cdc5-cdcb, U+cdcd-cde7, U+cde9-ce03, U+ce05-ce1f, U+ce22-ce34, U+ce36-ce3b',
		'[17]':
			'U+ccef-cd07, U+cd0a-cd0b, U+cd0d-cd1a, U+cd1c, U+cd1e-cd2b, U+cd2d-cd5b, U+cd5d-cd77, U+cd79-cd91',
		'[18]':
			'U+cc3f-cc43, U+cc46-cc47, U+cc49-cc4b, U+cc4d-cc53, U+cc55-cc58, U+cc5a-cc5f, U+cc61-cc97, U+cc9a-cc9b, U+cc9d-cc9f, U+cca1-cca7, U+ccaa, U+ccac, U+ccae-ccb3, U+ccb6-ccb7, U+ccb9-ccbb, U+ccbd-cccf, U+ccd1-cce3, U+cce5-ccee',
		'[19]':
			'U+cb91-cbd3, U+cbd5-cbe3, U+cbe5-cc0b, U+cc0e-cc0f, U+cc11-cc13, U+cc15-cc1b, U+cc1d-cc20, U+cc23-cc27, U+cc2a-cc2b, U+cc2d, U+cc2f, U+cc31-cc37, U+cc3a, U+cc3c',
		'[20]': 'U+caf4-cb47, U+cb4a-cb90',
		'[21]':
			'U+ca4a-ca4b, U+ca4e-ca4f, U+ca51-ca53, U+ca55-ca5b, U+ca5d-ca60, U+ca62-ca83, U+ca85-cabb, U+cabe-cabf, U+cac1-cac3, U+cac5-cacb, U+cacd-cad0, U+cad2, U+cad4-cad8, U+cada-caf3',
		'[22]':
			'U+c996-c997, U+c99a-c99c, U+c99e-c9bf, U+c9c2-c9c3, U+c9c5-c9c7, U+c9c9-c9cf, U+c9d2, U+c9d4, U+c9d7-c9d8, U+c9db, U+c9de-c9df, U+c9e1-c9e3, U+c9e5-c9e6, U+c9e8-c9eb, U+c9ee-c9f0, U+c9f2-c9f7, U+c9f9-ca0b, U+ca0d-ca28, U+ca2a-ca49',
		'[23]':
			'U+c8e9-c8f4, U+c8f6-c8fb, U+c8fe-c8ff, U+c901-c903, U+c905-c90b, U+c90e-c910, U+c912-c917, U+c919-c92b, U+c92d-c94f, U+c951-c953, U+c955-c96b, U+c96d-c973, U+c975-c987, U+c98a-c98b, U+c98d-c98f, U+c991-c995',
		'[24]':
			'U+c841-c84b, U+c84d-c86f, U+c872-c873, U+c875-c877, U+c879-c87f, U+c882-c884, U+c887-c88a, U+c88d-c8c3, U+c8c5-c8df, U+c8e1-c8e8',
		'[25]':
			'U+c779-c77b, U+c77e-c782, U+c786, U+c78b, U+c78d, U+c78f, U+c792-c793, U+c795, U+c797, U+c799-c79f, U+c7a2, U+c7a7-c7ab, U+c7ae-c7bb, U+c7bd-c7c0, U+c7c2-c7c7, U+c7c9-c7dc, U+c7de-c7ff, U+c802-c803, U+c805-c807, U+c809, U+c80b-c80f, U+c812, U+c814, U+c817-c81b, U+c81e-c81f, U+c821-c823, U+c825-c82e, U+c830-c837, U+c839-c83b, U+c83d-c840',
		'[26]':
			'U+c6bb-c6bf, U+c6c2, U+c6c4, U+c6c6-c6cb, U+c6ce-c6cf, U+c6d1-c6d3, U+c6d5-c6db, U+c6dd-c6df, U+c6e1-c6e7, U+c6e9-c6eb, U+c6ed-c6ef, U+c6f1-c6f8, U+c6fa-c703, U+c705-c707, U+c709-c70b, U+c70d-c716, U+c718, U+c71a-c71f, U+c722-c723, U+c725-c727, U+c729-c734, U+c736-c73b, U+c73e-c73f, U+c741-c743, U+c745-c74b, U+c74e-c750, U+c752-c757, U+c759-c773, U+c776-c777',
		'[27]':
			'U+c5f5-c5fb, U+c5fe, U+c602-c605, U+c607, U+c609-c60f, U+c611-c61a, U+c61c-c623, U+c626-c627, U+c629-c62b, U+c62d, U+c62f-c632, U+c636, U+c638, U+c63a-c63f, U+c642-c643, U+c645-c647, U+c649-c652, U+c656-c65b, U+c65d-c65f, U+c661-c663, U+c665-c677, U+c679-c67b, U+c67d-c693, U+c696-c697, U+c699-c69b, U+c69d-c6a3, U+c6a6, U+c6a8, U+c6aa-c6af, U+c6b2-c6b3, U+c6b5-c6b7, U+c6b9-c6ba',
		'[28]':
			'U+c517-c527, U+c52a-c52b, U+c52d-c52f, U+c531-c538, U+c53a, U+c53c, U+c53e-c543, U+c546-c547, U+c54b, U+c54d-c552, U+c556, U+c55a-c55b, U+c55d, U+c55f, U+c562-c563, U+c565-c567, U+c569-c56f, U+c572, U+c574, U+c576-c57b, U+c57e-c57f, U+c581-c583, U+c585-c586, U+c588-c58b, U+c58e, U+c590, U+c592-c596, U+c599-c5b3, U+c5b6-c5b7, U+c5ba, U+c5be-c5c3, U+c5ca-c5cb, U+c5cd, U+c5cf, U+c5d2-c5d3, U+c5d5-c5d7, U+c5d9-c5df, U+c5e1-c5e2, U+c5e4, U+c5e6-c5eb, U+c5ef, U+c5f1-c5f3',
		'[29]':
			'U+c475-c4ef, U+c4f2-c4f3, U+c4f5-c4f7, U+c4f9-c4ff, U+c502-c50b, U+c50d-c516',
		'[30]':
			'U+c3d0-c3d7, U+c3da-c3db, U+c3dd-c3de, U+c3e1-c3ec, U+c3ee-c3f3, U+c3f5-c42b, U+c42d-c463, U+c466-c474',
		'[31]':
			'U+c32b-c367, U+c36a-c36b, U+c36d-c36f, U+c371-c377, U+c37a-c37b, U+c37e-c383, U+c385-c387, U+c389-c3cf',
		'[32]':
			'U+c26a-c26b, U+c26d-c26f, U+c271-c273, U+c275-c27b, U+c27e-c287, U+c289-c28f, U+c291-c297, U+c299-c29a, U+c29c-c2a3, U+c2a5-c2a7, U+c2a9-c2ab, U+c2ad-c2b3, U+c2b6, U+c2b8, U+c2ba-c2bb, U+c2bd-c2db, U+c2de-c2df, U+c2e1-c2e2, U+c2e5-c2ea, U+c2ee, U+c2f0, U+c2f2-c2f5, U+c2f7, U+c2fa-c2fb, U+c2fd-c2ff, U+c301-c307, U+c309-c30c, U+c30e-c312, U+c315-c323, U+c325-c328, U+c32a',
		'[33]':
			'U+c1bc-c1c3, U+c1c5-c1df, U+c1e1-c1fb, U+c1fd-c203, U+c205-c20c, U+c20e, U+c210-c217, U+c21a-c21b, U+c21d-c21e, U+c221-c227, U+c229-c22a, U+c22c, U+c22e, U+c230, U+c233-c24f, U+c251-c257, U+c259-c269',
		'[34]':
			'U+c101-c11b, U+c11f, U+c121-c123, U+c125-c12b, U+c12e, U+c132-c137, U+c13a-c13b, U+c13d-c13f, U+c141-c147, U+c14a, U+c14c-c153, U+c155-c157, U+c159-c15b, U+c15d-c166, U+c169-c16f, U+c171-c177, U+c179-c18b, U+c18e-c18f, U+c191-c193, U+c195-c19b, U+c19d-c19e, U+c1a0, U+c1a2-c1a4, U+c1a6-c1bb',
		'[35]':
			'U+c049-c057, U+c059-c05b, U+c05d-c05f, U+c061-c067, U+c069-c08f, U+c091-c0ab, U+c0ae-c0af, U+c0b1-c0b3, U+c0b5, U+c0b7-c0bb, U+c0be, U+c0c2-c0c7, U+c0ca-c0cb, U+c0cd-c0cf, U+c0d1-c0d7, U+c0d9-c0da, U+c0dc, U+c0de-c0e3, U+c0e5-c0eb, U+c0ed-c0f3, U+c0f6, U+c0f8, U+c0fa-c0ff',
		'[36]':
			'U+bfa7-bfaf, U+bfb1-bfc4, U+bfc6-bfcb, U+bfce-bfcf, U+bfd1-bfd3, U+bfd5-bfdb, U+bfdd-c048',
		'[37]': 'U+bf07, U+bf09-bf3f, U+bf41-bf4f, U+bf52-bf54, U+bf56-bfa6',
		'[38]':
			'U+be56, U+be58, U+be5c-be5f, U+be62-be63, U+be65-be67, U+be69-be74, U+be76-be7b, U+be7e-be7f, U+be81-be8e, U+be90, U+be92-bea7, U+bea9-becf, U+bed2-bed3, U+bed5-bed6, U+bed9-bee3, U+bee6-bf06',
		'[39]':
			'U+bdb0-bdd3, U+bdd5-bdef, U+bdf1-be0b, U+be0d-be0f, U+be11-be13, U+be15-be43, U+be46-be47, U+be49-be4b, U+be4d-be53',
		'[40]':
			'U+bd03, U+bd06, U+bd08, U+bd0a-bd0f, U+bd11-bd22, U+bd25-bd47, U+bd49-bd58, U+bd5a-bd7f, U+bd82-bd83, U+bd85-bd87, U+bd8a-bd8f, U+bd91-bd92, U+bd94, U+bd96-bd98, U+bd9a-bdaf',
		'[41]':
			'U+bc4e-bc83, U+bc86-bc87, U+bc89-bc8b, U+bc8d-bc93, U+bc96, U+bc98, U+bc9b-bc9f, U+bca2-bca3, U+bca5-bca7, U+bca9-bcb2, U+bcb4-bcbb, U+bcbe-bcbf, U+bcc1-bcc3, U+bcc5-bccc, U+bcce-bcd0, U+bcd2-bcd4, U+bcd6-bcf3, U+bcf7, U+bcf9-bcfb, U+bcfd-bd02',
		'[42]':
			'U+bb90-bba3, U+bba5-bbab, U+bbad-bbbf, U+bbc1-bbf7, U+bbfa-bbfb, U+bbfd-bbfe, U+bc01-bc07, U+bc09-bc0a, U+bc0e, U+bc10, U+bc12-bc13, U+bc17, U+bc19-bc1a, U+bc1e, U+bc20-bc23, U+bc26, U+bc28, U+bc2a-bc2c, U+bc2e-bc2f, U+bc32-bc33, U+bc35-bc37, U+bc39-bc3f, U+bc41-bc42, U+bc44, U+bc46-bc48, U+bc4a-bc4d',
		'[43]':
			'U+bae6-bafb, U+bafd-bb17, U+bb19-bb33, U+bb37, U+bb39-bb3a, U+bb3d-bb43, U+bb45-bb46, U+bb48, U+bb4a-bb4f, U+bb51-bb53, U+bb55-bb57, U+bb59-bb62, U+bb64-bb8f',
		'[44]':
			'U+ba30-ba37, U+ba3a-ba3b, U+ba3d-ba3f, U+ba41-ba47, U+ba49-ba4a, U+ba4c, U+ba4e-ba53, U+ba56-ba57, U+ba59-ba5b, U+ba5d-ba63, U+ba65-ba66, U+ba68-ba6f, U+ba71-ba73, U+ba75-ba77, U+ba79-ba84, U+ba86, U+ba88-baa7, U+baaa, U+baad-baaf, U+bab1-bab7, U+baba, U+babc, U+babe-bae5',
		'[45]':
			'U+b96e-b973, U+b976-b977, U+b979-b97b, U+b97d-b983, U+b986, U+b988, U+b98a-b98d, U+b98f-b9ab, U+b9ae-b9af, U+b9b1-b9b3, U+b9b5-b9bb, U+b9be, U+b9c0, U+b9c2-b9c7, U+b9ca-b9cb, U+b9cd, U+b9d2-b9d7, U+b9da, U+b9dc, U+b9df-b9e0, U+b9e2, U+b9e6-b9e7, U+b9e9-b9f3, U+b9f6, U+b9f8, U+b9fb-ba2f',
		'[46]':
			'U+b8bf-b8cb, U+b8cd-b8e0, U+b8e2-b8e7, U+b8ea-b8eb, U+b8ed-b8ef, U+b8f1-b8f7, U+b8fa, U+b8fc, U+b8fe-b903, U+b905-b917, U+b919-b91f, U+b921-b93b, U+b93d-b957, U+b95a-b95b, U+b95d-b95f, U+b961-b967, U+b969-b96c',
		'[47]':
			'U+b80d-b80f, U+b811-b817, U+b81a, U+b81c-b823, U+b826-b827, U+b829-b82b, U+b82d-b833, U+b836, U+b83a-b83f, U+b841-b85b, U+b85e-b85f, U+b861-b863, U+b865-b86b, U+b86e, U+b870, U+b872-b8af, U+b8b1-b8be',
		'[48]':
			'U+b74d-b75f, U+b761-b763, U+b765-b774, U+b776-b77b, U+b77e-b77f, U+b781-b783, U+b785-b78b, U+b78e, U+b792-b796, U+b79a-b79b, U+b79d-b7a7, U+b7aa, U+b7ae-b7b3, U+b7b6-b7c8, U+b7ca-b7eb, U+b7ee-b7ef, U+b7f1-b7f3, U+b7f5-b7fb, U+b7fe, U+b802-b806, U+b80a-b80b',
		'[49]':
			'U+b6a7-b6aa, U+b6ac-b6b0, U+b6b2-b6ef, U+b6f1-b727, U+b72a-b72b, U+b72d-b72e, U+b731-b737, U+b739-b73a, U+b73c-b743, U+b745-b74c',
		'[50]':
			'U+b605-b60f, U+b612-b617, U+b619-b624, U+b626-b69b, U+b69e-b6a3, U+b6a5-b6a6',
		'[51]':
			'U+b55f, U+b562-b583, U+b585-b59f, U+b5a2-b5a3, U+b5a5-b5a7, U+b5a9-b5b2, U+b5b5-b5ba, U+b5bd-b604',
		'[52]':
			'U+b4a5-b4b6, U+b4b8-b4bf, U+b4c1-b4c7, U+b4c9-b4db, U+b4de-b4df, U+b4e1-b4e2, U+b4e5-b4eb, U+b4ee, U+b4f0, U+b4f2-b513, U+b516-b517, U+b519-b51a, U+b51d-b523, U+b526, U+b528, U+b52b-b52f, U+b532-b533, U+b535-b537, U+b539-b53f, U+b541-b544, U+b546-b54b, U+b54d-b54f, U+b551-b55b, U+b55d-b55e',
		'[53]':
			'U+b3f8-b3fb, U+b3fd-b40f, U+b411-b417, U+b419-b41b, U+b41d-b41f, U+b421-b427, U+b42a-b42b, U+b42d-b44f, U+b452-b453, U+b455-b457, U+b459-b45f, U+b462-b464, U+b466-b46b, U+b46d-b47f, U+b481-b4a3',
		'[54]':
			'U+b342-b353, U+b356-b357, U+b359-b35b, U+b35d-b35e, U+b360-b363, U+b366, U+b368, U+b36a-b36d, U+b36f, U+b372-b373, U+b375-b377, U+b379-b37f, U+b381-b382, U+b384, U+b386-b38b, U+b38d-b3c3, U+b3c6-b3c7, U+b3c9-b3ca, U+b3cd-b3d3, U+b3d6, U+b3d8, U+b3da-b3f7',
		'[55]':
			'U+b27c-b283, U+b285-b28f, U+b292-b293, U+b295-b297, U+b29a-b29f, U+b2a1-b2a4, U+b2a7-b2a9, U+b2ab, U+b2ad-b2c7, U+b2ca-b2cb, U+b2cd-b2cf, U+b2d1-b2d7, U+b2da, U+b2dc, U+b2de-b2e3, U+b2e7, U+b2e9-b2ea, U+b2ef-b2f3, U+b2f6, U+b2f8, U+b2fa-b2fb, U+b2fd-b2fe, U+b302-b303, U+b305-b307, U+b309-b30f, U+b312, U+b316-b31b, U+b31d-b341',
		'[56]':
			'U+b1d6-b1e7, U+b1e9-b1fc, U+b1fe-b203, U+b206-b207, U+b209-b20b, U+b20d-b213, U+b216-b21f, U+b221-b257, U+b259-b273, U+b275-b27b',
		'[57]':
			'U+b120-b122, U+b126-b127, U+b129-b12b, U+b12d-b133, U+b136, U+b138, U+b13a-b13f, U+b142-b143, U+b145-b14f, U+b151-b153, U+b156-b157, U+b159-b177, U+b17a-b17b, U+b17d-b17f, U+b181-b187, U+b189-b18c, U+b18e-b191, U+b195-b1a7, U+b1a9-b1cb, U+b1cd-b1d5',
		'[58]':
			'U+b05f-b07b, U+b07e-b07f, U+b081-b083, U+b085-b08b, U+b08d-b097, U+b09b, U+b09d-b09f, U+b0a2-b0a7, U+b0aa, U+b0b0, U+b0b2, U+b0b6-b0b7, U+b0b9-b0bb, U+b0bd-b0c3, U+b0c6-b0c7, U+b0ca-b0cf, U+b0d1-b0df, U+b0e1-b0e4, U+b0e6-b107, U+b10a-b10b, U+b10d-b10f, U+b111-b112, U+b114-b117, U+b119-b11a, U+b11c-b11f',
		'[59]':
			'U+afac-afb7, U+afba-afbb, U+afbd-afbf, U+afc1-afc6, U+afca-afcc, U+afce-afd3, U+afd5-afe7, U+afe9-afef, U+aff1-b00b, U+b00d-b00f, U+b011-b013, U+b015-b01b, U+b01d-b027, U+b029-b043, U+b045-b047, U+b049, U+b04b, U+b04d-b052, U+b055-b056, U+b058-b05c, U+b05e',
		'[60]':
			'U+af03-af07, U+af09-af2b, U+af2e-af33, U+af35-af3b, U+af3e-af40, U+af44-af47, U+af4a-af5c, U+af5e-af63, U+af65-af7f, U+af81-afab',
		'[61]':
			'U+ae56-ae5b, U+ae5e-ae60, U+ae62-ae64, U+ae66-ae67, U+ae69-ae6b, U+ae6d-ae83, U+ae85-aebb, U+aebf, U+aec1-aec3, U+aec5-aecb, U+aece, U+aed0, U+aed2-aed7, U+aed9-aef3, U+aef5-af02',
		'[62]':
			'U+ad9c-ada3, U+ada5-adbf, U+adc1-adc3, U+adc5-adc7, U+adc9-add2, U+add4-addb, U+addd-addf, U+ade1-ade3, U+ade5-adf7, U+adfa-adfb, U+adfd-adff, U+ae02-ae07, U+ae0a, U+ae0c, U+ae0e-ae13, U+ae15-ae2f, U+ae31-ae33, U+ae35-ae37, U+ae39-ae3f, U+ae42, U+ae44, U+ae46-ae49, U+ae4b, U+ae4f, U+ae51-ae53, U+ae55',
		'[63]':
			'U+ace2-ace3, U+ace5-ace6, U+ace9-acef, U+acf2, U+acf4, U+acf7-acfb, U+acfe-acff, U+ad01-ad03, U+ad05-ad0b, U+ad0d-ad10, U+ad12-ad1b, U+ad1d-ad33, U+ad35-ad48, U+ad4a-ad4f, U+ad51-ad6b, U+ad6e-ad6f, U+ad71-ad72, U+ad77-ad7c, U+ad7e, U+ad80, U+ad82-ad87, U+ad89-ad8b, U+ad8d-ad8f, U+ad91-ad9b',
		'[64]':
			'U+ac25-ac2c, U+ac2e, U+ac30, U+ac32-ac37, U+ac39-ac3f, U+ac41-ac4c, U+ac4e-ac6f, U+ac72-ac73, U+ac75-ac76, U+ac79-ac7f, U+ac82, U+ac84-ac88, U+ac8a-ac8b, U+ac8d-ac8f, U+ac91-ac93, U+ac95-ac9b, U+ac9d-ac9e, U+aca1-aca7, U+acab, U+acad-acaf, U+acb1-acb7, U+acba-acbb, U+acbe-acc0, U+acc2-acc3, U+acc5-acdf',
		'[65]':
			'U+99df, U+99ed, U+99f1, U+99ff, U+9a01, U+9a08, U+9a0e-9a0f, U+9a19, U+9a2b, U+9a30, U+9a36-9a37, U+9a40, U+9a43, U+9a45, U+9a4d, U+9a55, U+9a57, U+9a5a-9a5b, U+9a5f, U+9a62, U+9a65, U+9a69-9a6a, U+9aa8, U+9ab8, U+9ad3, U+9ae5, U+9aee, U+9b1a, U+9b27, U+9b2a, U+9b31, U+9b3c, U+9b41-9b45, U+9b4f, U+9b54, U+9b5a, U+9b6f, U+9b8e, U+9b91, U+9b9f, U+9bab, U+9bae, U+9bc9, U+9bd6, U+9be4, U+9be8, U+9c0d, U+9c10, U+9c12, U+9c15, U+9c25, U+9c32, U+9c3b, U+9c47, U+9c49, U+9c57, U+9ce5, U+9ce7, U+9ce9, U+9cf3-9cf4, U+9cf6, U+9d09, U+9d1b, U+9d26, U+9d28, U+9d3b, U+9d51, U+9d5d, U+9d60-9d61, U+9d6c, U+9d72, U+9da9, U+9daf, U+9db4, U+9dc4, U+9dd7, U+9df2, U+9df8-9dfa, U+9e1a, U+9e1e, U+9e75, U+9e79, U+9e7d, U+9e7f, U+9e92-9e93, U+9e97, U+9e9d, U+9e9f, U+9ea5, U+9eb4-9eb5, U+9ebb, U+9ebe, U+9ec3, U+9ecd-9ece, U+9ed4, U+9ed8, U+9edb-9edc, U+9ede, U+9ee8, U+9ef4, U+9f07-9f08, U+9f0e, U+9f13, U+9f20, U+9f3b, U+9f4a-9f4b, U+9f4e, U+9f52, U+9f5f, U+9f61, U+9f67, U+9f6a, U+9f6c, U+9f77, U+9f8d, U+9f90, U+9f95, U+9f9c, U+ac02-ac03, U+ac05-ac06, U+ac09-ac0f, U+ac17-ac18, U+ac1b, U+ac1e-ac1f, U+ac21-ac23',
		'[94]':
			'U+3136, U+3138, U+313a-3140, U+3143-3144, U+3150, U+3152, U+3154-3156, U+3158-315b, U+315d-315f, U+3162, U+3164-318c, U+318e, U+3200-321b, U+3231, U+3239, U+3251-325a, U+3260-327b, U+327e-327f, U+328a-3290, U+3294, U+329e, U+32a5, U+3380-3384, U+3388-338b',
		'[95]':
			'U+2f7d, U+2f7f-2f8b, U+2f8e-2f90, U+2f92-2f97, U+2f99-2fa0, U+2fa2-2fa3, U+2fa5-2fa9, U+2fac-2fb1, U+2fb3-2fbc, U+2fc1-2fca, U+2fcd-2fd4, U+3003, U+3012-3019, U+301c, U+301e-3020, U+3036, U+3041, U+3043, U+3045, U+3047, U+3049, U+304e, U+3050, U+3052, U+3056, U+305a, U+305c, U+305e, U+3062, U+3065, U+306c, U+3070-307d, U+3080, U+3085, U+3087, U+308e, U+3090-3091, U+30a1, U+30a5, U+30a9, U+30ae, U+30b1-30b2, U+30b4, U+30b6, U+30bc-30be, U+30c2, U+30c5, U+30cc, U+30d2, U+30d4, U+30d8-30dd, U+30e4, U+30e6, U+30e8, U+30ee, U+30f0-30f2, U+30f4-30f6, U+3133, U+3135',
		'[99]':
			'U+81-82, U+84, U+a2-a5, U+a7-a8, U+aa, U+ac-ad, U+b1-b3, U+b6, U+b8-ba, U+bc-be, U+c0, U+c2, U+c6-cb, U+ce-d0, U+d4, U+d8-d9, U+db-dc, U+de-df, U+e6, U+eb, U+ee-f0, U+f4, U+f7-f9, U+fb, U+fe-ff, U+111, U+126-127, U+132-133, U+138, U+13f-142, U+149-14b, U+152-153, U+166-167, U+2bc, U+2c7, U+2d0, U+2d8-2d9, U+2db-2dd, U+391-394, U+396-3a1, U+3a3-3a9, U+3b2-3b6, U+3b8, U+3bc, U+3be-3c1, U+3c3-3c9, U+2010, U+2015-2016, U+2018-2019, U+201b, U+201f-2021, U+2025, U+2030, U+2033-2036, U+203c, U+203e, U+2042, U+2074, U+207a-207f, U+2081-2084, U+2109, U+2113, U+2116, U+2121, U+2126, U+212b, U+2153-2154',
		'[100]':
			'U+e8, U+2da, U+2160, U+2194, U+3054, U+3058, U+306d, U+3086, U+308d, U+30ac, U+30bb, U+30c4, U+30cd-30ce, U+30e2, U+3132, U+3146, U+3149, U+339d, U+4e3b, U+4f0a, U+4fdd, U+4fe1, U+5409, U+540c, U+5834, U+592a-592b, U+5b9a, U+5dde, U+5e0c, U+5e73, U+5f0f, U+60f3, U+653f, U+661f, U+662f, U+667a, U+683c, U+6b4c, U+6c11, U+767c, U+76ee, U+76f4, U+77f3, U+79d1, U+7a7a, U+7b2c, U+7d22, U+8207, U+8a00, U+8a71, U+9280, U+9580, U+958b, U+96c6, U+9762, U+98df, U+9ed1, U+ac2d, U+adc8, U+add3, U+af48, U+b014, U+b134-b135, U+b158, U+b2aa, U+b35f, U+b6a4, U+b9cf, U+bb63, U+bd23, U+be91, U+c29b, U+c3f4, U+c42c, U+c55c, U+c573, U+c58f, U+c78c, U+c7dd, U+c8f5, U+cad1, U+cc48, U+cf10, U+cf20, U+d03c, U+d07d, U+d2a0, U+d30e, U+d38d, U+d3a8, U+d3c8, U+d5e5, U+d5f9, U+d6e4, U+f90a, U+ff02, U+ff1c',
		'[101]':
			'U+3b1, U+2466, U+25a1, U+25a3, U+261c, U+3008-3009, U+305b, U+305d, U+3069, U+30a7, U+30ba, U+30cf, U+30ef, U+3151, U+3157, U+4e4b, U+4e5f, U+4e8c, U+4eca, U+4ed6, U+4f5b, U+50cf, U+5149, U+5165, U+5171, U+5229, U+529b, U+5316, U+539f, U+53f2, U+571f, U+5728, U+58eb, U+591c, U+5b78, U+5c11, U+5c55, U+5ddd, U+5e02, U+5fb7, U+60c5, U+610f, U+611f, U+6625, U+66f8, U+6797, U+679c, U+682a, U+6d2a, U+706b, U+7406, U+767b, U+76f8, U+77e5, U+7acb, U+898b, U+8a69, U+8def, U+8fd1, U+901a, U+90e8, U+91cd, U+975e, U+ae14, U+ae6c, U+aec0, U+afc7, U+afc9, U+b01c, U+b028, U+b308, U+b311, U+b314, U+b31c, U+b524, U+b560, U+b764, U+b920, U+b9e3, U+bd48, U+be7d, U+c0db, U+c231, U+c270, U+c2e3, U+c37d, U+c3ed, U+c530, U+c6a5, U+c6dc, U+c7a4, U+c954, U+c974, U+d000, U+d565, U+d667, U+d6c5, U+d79d, U+ff1e',
		'[102]':
			'U+131, U+2032, U+2465, U+2642, U+3048, U+3051, U+3083-3084, U+308f, U+30c0, U+30d1, U+30d3, U+30d6, U+30df, U+30e7, U+3153, U+4e16, U+4e8b, U+4ee5, U+5206, U+52a0, U+52d5, U+53e4, U+53ef, U+54c1, U+57ce, U+597d, U+5b8c, U+5ea6, U+5f8c, U+5f97, U+6210, U+6240, U+624b, U+6728, U+6bd4, U+7236, U+7269, U+7279, U+738b, U+7528, U+7530, U+767e, U+798f, U+8005, U+8a18, U+90fd, U+91cc, U+9577, U+9593, U+98a8, U+ac20, U+acf6, U+ad90, U+af5d, U+af80, U+afcd, U+aff0, U+b0a1, U+b0b5, U+b1fd, U+b2fc, U+b380, U+b51b, U+b584, U+b5b3, U+b8fd, U+b93c, U+b9f4, U+bb44, U+bc08, U+bc27, U+bc49, U+be55, U+be64, U+bfb0, U+bfc5, U+c178, U+c21f, U+c314, U+c4f1, U+c58d, U+c664, U+c698, U+c6a7, U+c6c1, U+c9ed, U+cac0, U+cacc, U+cad9, U+ccb5, U+cdcc, U+d0e4, U+d143, U+d320, U+d330, U+d54d, U+ff06, U+ff1f, U+ff5e',
		'[103]':
			'U+b4, U+20a9, U+20ac, U+2190, U+24d8, U+2502, U+2514, U+2592, U+25c7-25c8, U+2663, U+3060, U+3064, U+3081, U+3088, U+30a3, U+30a6, U+30aa, U+30b5, U+30c7, U+30ca-30cb, U+30d0, U+30e3, U+30e5, U+339e, U+4e09, U+4eac, U+4f5c, U+5167-5168, U+516c, U+51fa, U+5408, U+540d, U+591a, U+5b57, U+6211, U+65b9, U+660e, U+6642, U+6700, U+6b63, U+6e2f, U+7063, U+7532, U+793e, U+81ea, U+8272, U+82b1, U+897f, U+8eca, U+91ce, U+ac38, U+ad76, U+ae84, U+aecc, U+b07d, U+b0b1, U+b215, U+b2a0, U+b310, U+b3d7, U+b52a, U+b618, U+b775, U+b797, U+bcd5, U+bd59, U+be80, U+bea8, U+bed1, U+bee4-bee5, U+c060, U+c2ef, U+c329, U+c3dc, U+c597, U+c5bd, U+c5e5, U+c69c, U+c9d6, U+ca29, U+ca5c, U+ca84, U+cc39, U+cc3b, U+ce89, U+cee5, U+cf65, U+cf85, U+d058, U+d145, U+d22d, U+d325, U+d37d, U+d3ad, U+d769, U+ff0c',
		'[104]':
			'U+2161, U+2228, U+2299, U+2464, U+2517, U+2640, U+3042, U+304a, U+3053, U+3061, U+307f, U+3082, U+308c, U+3092, U+30a8, U+30ab, U+30ad, U+30b0, U+30b3, U+30b7, U+30c1, U+30c6, U+30c9, U+30d5, U+30d7, U+30de, U+30e0-30e1, U+30ec-30ed, U+4e0b, U+4e0d, U+4ee3, U+53f0, U+548c, U+5b89, U+5bb6, U+5c0f, U+611b, U+6771, U+6aa2, U+6bcd, U+6c34, U+6cd5, U+6d77, U+767d, U+795e, U+8ecd, U+9999, U+9ad8, U+ac07, U+ac1a, U+ac40, U+ad0c, U+ad88, U+ada4, U+ae01, U+ae65, U+aebd, U+aec4, U+afe8, U+b139, U+b205, U+b383, U+b38c, U+b42c, U+b461, U+b55c, U+b78f, U+b8fb, U+b9f7, U+bafc, U+bc99, U+bed8, U+bfcd, U+c0bf, U+c0f9, U+c167, U+c204, U+c20f, U+c22f, U+c258, U+c298, U+c2bc, U+c388, U+c501, U+c50c, U+c5b9, U+c5ce, U+c641, U+c648, U+c73d, U+ca50, U+ca61, U+cc4c, U+ceac, U+d0d4, U+d5f7, U+d6d7, U+ff1a',
		'[105]':
			'U+2103, U+2463, U+25c6, U+25cb, U+266c, U+3001, U+300a, U+3046, U+304c-304d, U+304f, U+3055, U+3059, U+3063, U+3066-3068, U+306f, U+3089, U+30b8, U+30bf, U+314f, U+4e0a, U+570b, U+5730, U+5916, U+5929, U+5c71, U+5e74, U+5fc3, U+601d, U+6027, U+63d0, U+6709, U+6734, U+751f, U+7684, U+82f1, U+9053, U+91d1, U+97f3, U+ac2f, U+ac4d, U+adc4, U+ade4, U+ae41, U+ae4d-ae4e, U+aed1, U+afb9, U+b0e0, U+b299, U+b365, U+b46c, U+b480, U+b4c8, U+b7b4, U+b819, U+b918, U+baab, U+bab9, U+be8f, U+bed7, U+c0ec, U+c19f, U+c1a5, U+c3d9, U+c464, U+c53d, U+c553, U+c570, U+c5cc, U+c633, U+c6a4, U+c7a3, U+c7a6, U+c886, U+c9d9-c9da, U+c9ec, U+ca0c, U+cc21, U+cd1b, U+cd78, U+cdc4, U+cef8, U+cfe4, U+d0a5, U+d0b5, U+d0ec, U+d15d, U+d188, U+d23c, U+d2ac, U+d729, U+d79b, U+ff01, U+ff08-ff09, U+ff5c',
		'[106]':
			'U+2039-203a, U+223c, U+25b3, U+25b7, U+25bd, U+25cf, U+266a, U+3002, U+300b, U+304b, U+3057, U+305f, U+306a-306b, U+307e, U+308a-308b, U+3093, U+30a2, U+30af, U+30b9, U+30c3, U+30c8, U+30e9-30eb, U+33a1, U+4e00, U+524d, U+5357, U+5b50, U+7121, U+884c, U+9751, U+ac94, U+aebe, U+aecd, U+af08, U+af41, U+af49, U+b010, U+b053, U+b109, U+b11b, U+b128, U+b154, U+b291, U+b2e6, U+b301, U+b385, U+b525, U+b5b4, U+b729, U+b72f, U+b738, U+b7ff, U+b837, U+b975, U+ba67, U+bb47, U+bc1f, U+bd90, U+bfd4, U+c27c, U+c324, U+c379, U+c3e0, U+c465, U+c53b, U+c58c, U+c610, U+c653, U+c6cd, U+c813, U+c82f, U+c999, U+c9e0, U+cac4, U+cad3, U+cbd4, U+cc10, U+cc22, U+ccb8, U+ccbc, U+cda5, U+ce84, U+cea3, U+cf67, U+cfe1, U+d241, U+d30d, U+d31c, U+d391, U+d401, U+d479, U+d5c9, U+d5db, U+d649, U+d6d4',
		'[107]':
			'U+b0, U+e9, U+2193, U+2462, U+260e, U+261e, U+300e-300f, U+3044, U+30a4, U+30fb-30fc, U+314d, U+5973, U+6545, U+6708, U+7537, U+ac89, U+ac9c, U+acc1, U+ad04, U+ad75, U+ad7d, U+ae45, U+ae61, U+af42, U+b0ab, U+b0af, U+b0b3, U+b12c, U+b194, U+b1a8, U+b220, U+b258, U+b284, U+b2ff, U+b315, U+b371, U+b3d4-b3d5, U+b460, U+b527, U+b534, U+b810, U+b818, U+b98e, U+ba55, U+bbac, U+bc0b, U+bc40, U+bca1, U+bccd, U+bd93, U+be54, U+be5a, U+bf08, U+bf50, U+bf55, U+bfdc, U+c0c0, U+c0d0, U+c0f4, U+c100, U+c11e, U+c170, U+c20d, U+c274, U+c290, U+c308, U+c369, U+c539, U+c587, U+c5ff, U+c6ec, U+c70c, U+c7ad, U+c7c8, U+c83c, U+c881, U+cb48, U+cc60, U+ce69, U+ce6b, U+ce75, U+cf04, U+cf08, U+cf55, U+cf70, U+cffc, U+d0b7, U+d1a8, U+d2c8, U+d384, U+d47c, U+d48b, U+d5dd, U+d5e8, U+d720, U+d759, U+f981',
		'[108]':
			'U+e0, U+e2, U+395, U+3b7, U+3ba, U+2460-2461, U+25a0, U+3010-3011, U+306e, U+30f3, U+314a, U+314c, U+5927, U+65b0, U+7e41, U+97d3, U+9ad4, U+ad49, U+ae0b, U+ae0d, U+ae43, U+ae5d, U+aecf, U+af3c, U+af64, U+afd4, U+b080, U+b084, U+b0c5, U+b10c, U+b1e8, U+b2ac, U+b36e, U+b451, U+b515, U+b540, U+b561, U+b6ab, U+b6b1, U+b72c, U+b730, U+b744, U+b800, U+b8ec, U+b8f0, U+b904, U+b968, U+b96d, U+b987, U+b9d9, U+bb36, U+bb49, U+bc2d, U+bc43, U+bcf6, U+bd89, U+be57, U+be61, U+bed4, U+c090, U+c130, U+c148, U+c19c, U+c2f9, U+c36c, U+c37c, U+c384, U+c3df, U+c575, U+c584, U+c660, U+c719, U+c816, U+ca4d, U+ca54, U+cabc, U+cb49, U+cc14, U+cff5, U+d004, U+d038, U+d0b4, U+d0d3, U+d0e0, U+d0ed, U+d131, U+d1b0, U+d31f, U+d33d, U+d3a0, U+d3ab, U+d514, U+d584, U+d6a1, U+d6cc, U+d749, U+d760, U+d799',
		'[109]':
			'U+24, U+60, U+3b9, U+3bb, U+3bd, U+2191, U+2606, U+300c-300d, U+3131, U+3134, U+3139, U+3141-3142, U+3148, U+3161, U+3163, U+321c, U+4eba, U+5317, U+ac31, U+ac77, U+ac9f, U+acb9, U+acf0-acf1, U+acfd, U+ad73, U+af3d, U+b00c, U+b04a, U+b057, U+b0c4, U+b188, U+b1cc, U+b214, U+b2db, U+b2ee, U+b304, U+b4ed, U+b518, U+b5bc, U+b625, U+b69c-b69d, U+b7ac, U+b801, U+b86c, U+b959, U+b95c, U+b985, U+ba48, U+bb58, U+bc0c, U+bc38, U+bc85, U+bc9a, U+bf40, U+c068, U+c0bd, U+c0cc, U+c12f, U+c149, U+c1e0, U+c22b, U+c22d, U+c250, U+c2fc, U+c300, U+c313, U+c370, U+c3d8, U+c557, U+c580, U+c5e3, U+c62e, U+c634, U+c6f0, U+c74d, U+c783, U+c78e, U+c796, U+c7bc, U+c92c, U+ca4c, U+cc1c, U+cc54, U+cc59, U+ce04, U+cf30, U+cfc4, U+d140, U+d321, U+d38c, U+d399, U+d54f, U+d587, U+d5d0, U+d6e8, U+d770',
		'[110]':
			'U+d7, U+ea, U+fc, U+2192, U+25bc, U+3000, U+3137, U+3145, U+315c, U+7f8e, U+ac13, U+ac71, U+ac90, U+acb8, U+ace7, U+ad7f, U+ae50, U+aef4, U+af34, U+afbc, U+b048, U+b09a, U+b0ad, U+b0bc, U+b113, U+b125, U+b141, U+b20c, U+b2d9, U+b2ed, U+b367, U+b369, U+b374, U+b3cb, U+b4ec, U+b611, U+b760, U+b81b, U+b834, U+b8b0, U+b8e1, U+b989, U+b9d1, U+b9e1, U+b9fa, U+ba4d, U+ba78, U+bb35, U+bb54, U+bbf9, U+bc11, U+bcb3, U+bd05, U+bd95, U+bdd4, U+be10, U+bed0, U+bf51, U+c0d8, U+c232, U+c2b7, U+c2eb, U+c378, U+c500, U+c52c, U+c549, U+c568, U+c598, U+c5c9, U+c61b, U+c639, U+c67c, U+c717, U+c78a, U+c80a, U+c90c-c90d, U+c950, U+c9e7, U+cbe4, U+cca9, U+cce4, U+cdb0, U+ce78, U+ce94, U+ce98, U+cf8c, U+d018, U+d034, U+d0f1, U+d1b1, U+d280, U+d2f8, U+d338, U+d380, U+d3b4, U+d610, U+d69f, U+d6fc, U+d758',
		'[111]':
			'U+e7, U+2022, U+203b, U+25c0, U+2605, U+2661, U+3147, U+318d, U+672c, U+8a9e, U+acaa, U+acbc, U+ad1c, U+ae4a, U+ae5c, U+b044, U+b054, U+b0c8-b0c9, U+b2a6, U+b2d0, U+b35c, U+b364, U+b428, U+b454, U+b465, U+b4b7, U+b4e3, U+b51c, U+b5a1, U+b784, U+b790, U+b7ab, U+b7f4, U+b82c, U+b835, U+b8e9, U+b8f8, U+b9d8, U+b9f9, U+ba5c, U+ba64, U+babd, U+bb18, U+bb3b, U+bbff, U+bc0d, U+bc45, U+bc97, U+bcbc, U+be45, U+be75, U+be7c, U+bfcc, U+c0b6, U+c0f7, U+c14b, U+c2b4, U+c30d, U+c4f8, U+c5bb, U+c5d1, U+c5e0, U+c5ee, U+c5fd, U+c606, U+c6c5, U+c6e0, U+c708, U+c81d, U+c820, U+c824, U+c878, U+c918, U+c96c, U+c9e4, U+c9f1, U+cc2e, U+cd09, U+cea1, U+cef5, U+cef7, U+cf64, U+cf69, U+cfe8, U+d035, U+d0ac, U+d230, U+d234, U+d2f4, U+d31d, U+d575, U+d578, U+d608, U+d614, U+d718, U+d751, U+d761, U+d78c, U+d790',
		'[112]':
			'U+2665, U+3160, U+4e2d, U+6587, U+65e5, U+ac12, U+ac14, U+ac16, U+ac81, U+ad34, U+ade0, U+ae54, U+aebc, U+af2c, U+afc0, U+afc8, U+b04c, U+b08c, U+b099, U+b0a9, U+b0ac, U+b0ae, U+b0b8, U+b123, U+b179, U+b2e5, U+b2f7, U+b4c0, U+b531, U+b538, U+b545, U+b550, U+b5a8, U+b6f0, U+b728, U+b73b, U+b7ad, U+b7ed, U+b809, U+b864, U+b86d, U+b871, U+b9bf, U+b9f5, U+ba40, U+ba4b, U+ba58, U+ba87, U+baac, U+bbc0, U+bc16, U+bc34, U+bd07, U+bd99, U+be59, U+bfd0, U+c058, U+c0e4, U+c0f5, U+c12d, U+c139, U+c228, U+c529, U+c5c7, U+c635, U+c637, U+c735, U+c77d, U+c787, U+c789, U+c8c4, U+c989, U+c98c, U+c9d0, U+c9d3, U+cc0c, U+cc99, U+cd0c, U+cd2c, U+cd98, U+cda4, U+ce59, U+ce60, U+ce6d, U+cea0, U+d0d0-d0d1, U+d0d5, U+d14d, U+d1a4, U+d29c, U+d2f1, U+d301, U+d39c, U+d3bc, U+d4e8, U+d540, U+d5ec, U+d640, U+d750',
		'[113]':
			'U+5e, U+25b2, U+25b6, U+314e, U+ac24, U+ace1, U+ace4, U+ae68, U+af2d, U+b0d0, U+b0e5, U+b150, U+b155, U+b193, U+b2c9, U+b2dd, U+b3c8, U+b3fc, U+b410, U+b458, U+b4dd, U+b5a0, U+b5a4, U+b5bb, U+b7b5, U+b838, U+b840, U+b86f, U+b8f9, U+b960, U+b9e5, U+bab8, U+bb50, U+bc1d, U+bc24-bc25, U+bca8, U+bcbd, U+bd04, U+bd10, U+bd24, U+be48, U+be5b, U+be68, U+c05c, U+c12c, U+c140, U+c15c, U+c168, U+c194, U+c219, U+c27d, U+c2a8, U+c2f1, U+c2f8, U+c368, U+c554-c555, U+c559, U+c564, U+c5d8, U+c5fc, U+c625, U+c65c, U+c6b1, U+c728, U+c794, U+c84c, U+c88c, U+c8e0, U+c8fd, U+c998, U+c9dd, U+cc0d, U+cc30, U+ceec, U+cf13, U+cf1c, U+cf5c, U+d050, U+d07c, U+d0a8, U+d134, U+d138, U+d154, U+d1f4, U+d2bc, U+d329, U+d32c, U+d3d0, U+d3f4, U+d3fc, U+d56b, U+d5cc, U+d600-d601, U+d639, U+d6c8, U+d754, U+d765',
		'[114]':
			'U+3c-3d, U+2026, U+24d2, U+314b, U+ac11, U+acf3, U+ad74, U+ad81, U+adf9, U+ae34, U+af43, U+afb8, U+b05d, U+b07c, U+b110, U+b118, U+b17c, U+b180, U+b18d, U+b192, U+b2cc, U+b355, U+b378, U+b4a4, U+b4ef, U+b78d, U+b799, U+b7a9, U+b7fd, U+b807, U+b80c, U+b839, U+b9b4, U+b9db, U+ba3c, U+bab0, U+bba4, U+bc94, U+be4c, U+c154, U+c1c4, U+c26c, U+c2ac, U+c2ed, U+c4f4, U+c55e, U+c561, U+c571, U+c5b5, U+c5c4, U+c654-c655, U+c695, U+c6e8, U+c6f9, U+c724, U+c751, U+c775, U+c7a0, U+c7c1, U+c874, U+c880, U+c9d5, U+c9f8, U+cabd, U+cc29, U+cc2c, U+cca8, U+ccab, U+ccd0, U+ce21, U+ce35, U+ce7c, U+ce90, U+cee8, U+cef4, U+cfe0, U+d070, U+d0b9, U+d0c1, U+d0c4, U+d0c8, U+d15c, U+d1a1, U+d2c0, U+d300, U+d314, U+d3ed, U+d478, U+d480, U+d48d, U+d508, U+d53d, U+d5e4, U+d611, U+d61c, U+d68d, U+d6a8, U+d798',
		'[115]':
			'U+23, U+25, U+5f, U+a9, U+ac08, U+ac78, U+aca8, U+acac, U+ace8, U+ad70, U+adc0, U+addc, U+b137, U+b140, U+b208, U+b290, U+b2f5, U+b3c5, U+b3cc, U+b420, U+b429, U+b529, U+b530, U+b77d, U+b79c, U+b7a8, U+b7c9, U+b7f0, U+b7fc, U+b828, U+b860, U+b9ad, U+b9c1, U+b9c9, U+b9dd-b9de, U+b9e8, U+ba38-ba39, U+babb, U+bc00, U+bc8c, U+bca0, U+bca4, U+bcd1, U+bcfc, U+bd09, U+bdf0, U+be60, U+c0ad, U+c0b4, U+c0bc, U+c190, U+c1fc, U+c220, U+c288, U+c2b9, U+c2f6, U+c528, U+c545, U+c558, U+c5bc, U+c5d4, U+c600, U+c644, U+c6c0, U+c6c3, U+c721, U+c798, U+c7a1, U+c811, U+c838, U+c871, U+c904, U+c990, U+c9dc, U+cc38, U+cc44, U+cca0, U+cd1d, U+cd95, U+cda9, U+ce5c, U+cf00, U+cf58, U+d150, U+d22c, U+d305, U+d328, U+d37c, U+d3f0, U+d551, U+d5a5, U+d5c8, U+d5d8, U+d63c, U+d64d, U+d669, U+d734, U+d76c',
		'[116]':
			'U+26, U+2b, U+3e, U+40, U+7e, U+ac01, U+ac19, U+ac1d, U+aca0, U+aca9, U+acb0, U+ad8c, U+ae09, U+ae38, U+ae40, U+aed8, U+b09c, U+b0a0, U+b108, U+b204, U+b298, U+b2d8, U+b2eb-b2ec, U+b2f4, U+b313, U+b358, U+b450, U+b4e0, U+b54c, U+b610, U+b780, U+b78c, U+b791, U+b8e8, U+b958, U+b974, U+b984, U+b9b0, U+b9bc-b9bd, U+b9ce, U+ba70, U+bbfc, U+bc0f, U+bc15, U+bc1b, U+bc31, U+bc95, U+bcc0, U+bcc4, U+bd81, U+bd88, U+c0c8, U+c11d, U+c13c, U+c158, U+c18d, U+c1a1, U+c21c, U+c4f0, U+c54a, U+c560, U+c5b8, U+c5c8, U+c5f4, U+c628, U+c62c, U+c678, U+c6cc, U+c808, U+c810, U+c885, U+c88b, U+c900, U+c988, U+c99d, U+c9c8, U+cc3d-cc3e, U+cc45, U+cd08, U+ce20, U+cee4, U+d074, U+d0a4, U+d0dd, U+d2b9, U+d3b8, U+d3c9, U+d488, U+d544, U+d559, U+d56d, U+d588, U+d615, U+d648, U+d655, U+d658, U+d65c',
		'[117]':
			'U+d, U+48, U+7c, U+ac10, U+ac15, U+ac74, U+ac80, U+ac83, U+acc4, U+ad11, U+ad50, U+ad6d, U+adfc, U+ae00, U+ae08, U+ae4c, U+b0a8, U+b124, U+b144, U+b178, U+b274, U+b2a5, U+b2e8, U+b2f9, U+b354, U+b370, U+b418, U+b41c, U+b4f1, U+b514, U+b798, U+b808, U+b824-b825, U+b8cc, U+b978, U+b9d0, U+b9e4, U+baa9, U+bb3c, U+bc18, U+bc1c, U+bc30, U+bc84, U+bcf5, U+bcf8, U+bd84, U+be0c, U+be14, U+c0b0, U+c0c9, U+c0dd, U+c124, U+c2dd, U+c2e4, U+c2ec, U+c54c, U+c57c-c57d, U+c591, U+c5c5-c5c6, U+c5ed, U+c608, U+c640, U+c6b8, U+c6d4, U+c784, U+c7ac, U+c800-c801, U+c9c1, U+c9d1, U+cc28, U+cc98, U+cc9c, U+ccad, U+cd5c, U+cd94, U+cd9c, U+cde8, U+ce68, U+cf54, U+d0dc, U+d14c, U+d1a0, U+d1b5, U+d2f0, U+d30c, U+d310, U+d398, U+d45c, U+d50c, U+d53c, U+d560, U+d568, U+d589, U+d604, U+d6c4, U+d788',
		'[118]':
			'U+39, U+49, U+4d-4e, U+a0, U+ac04, U+ac1c, U+ac70, U+ac8c, U+acbd, U+acf5, U+acfc, U+ad00, U+ad6c, U+adf8, U+b098, U+b0b4, U+b294, U+b2c8, U+b300, U+b3c4, U+b3d9, U+b4dc, U+b4e4, U+b77c, U+b7ec, U+b85d, U+b97c, U+b9c8, U+b9cc, U+ba54, U+ba74, U+ba85, U+baa8, U+bb34, U+bb38, U+bbf8, U+bc14, U+bc29, U+bc88, U+bcf4, U+bd80, U+be44, U+c0c1, U+c11c, U+c120, U+c131, U+c138, U+c18c, U+c218, U+c2b5, U+c2e0, U+c544, U+c548, U+c5b4, U+c5d0, U+c5ec, U+c5f0, U+c601, U+c624, U+c694, U+c6a9, U+c6b0, U+c6b4, U+c6d0, U+c704, U+c720, U+c73c, U+c740, U+c744, U+c74c, U+c758, U+c77c, U+c785, U+c788, U+c790-c791, U+c7a5, U+c804, U+c815, U+c81c, U+c870, U+c8fc, U+c911, U+c9c4, U+ccb4, U+ce58, U+ce74, U+d06c, U+d0c0, U+d130, U+d2b8, U+d3ec, U+d504, U+d55c, U+d569, U+d574, U+d638, U+d654, U+d68c',
		'[119]':
			'U+20-22, U+27-2a, U+2c-38, U+3a-3b, U+3f, U+41-47, U+4a-4c, U+4f-5d, U+61-7b, U+7d, U+a1, U+ab, U+ae, U+b7, U+bb, U+bf, U+2013-2014, U+201c-201d, U+2122, U+ac00, U+ace0, U+ae30, U+b2e4, U+b85c, U+b9ac, U+c0ac, U+c2a4, U+c2dc, U+c774, U+c778, U+c9c0, U+d558',
	},
	fonts: {
		normal: {
			'400': {
				'[2]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.2.woff2',
				'[3]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.3.woff2',
				'[4]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.4.woff2',
				'[5]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.5.woff2',
				'[6]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.6.woff2',
				'[7]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.7.woff2',
				'[8]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.8.woff2',
				'[9]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.9.woff2',
				'[10]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.10.woff2',
				'[11]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.11.woff2',
				'[12]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.12.woff2',
				'[13]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.13.woff2',
				'[14]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.14.woff2',
				'[15]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.15.woff2',
				'[16]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.16.woff2',
				'[17]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.17.woff2',
				'[18]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.18.woff2',
				'[19]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.19.woff2',
				'[20]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.20.woff2',
				'[21]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.21.woff2',
				'[22]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.22.woff2',
				'[23]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.23.woff2',
				'[24]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.24.woff2',
				'[25]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.25.woff2',
				'[26]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.26.woff2',
				'[27]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.27.woff2',
				'[28]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.28.woff2',
				'[29]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.29.woff2',
				'[30]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.30.woff2',
				'[31]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.31.woff2',
				'[32]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.32.woff2',
				'[33]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.33.woff2',
				'[34]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.34.woff2',
				'[35]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.35.woff2',
				'[36]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.36.woff2',
				'[37]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.37.woff2',
				'[38]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.38.woff2',
				'[39]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.39.woff2',
				'[40]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.40.woff2',
				'[41]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.41.woff2',
				'[42]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.42.woff2',
				'[43]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.43.woff2',
				'[44]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.44.woff2',
				'[45]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.45.woff2',
				'[46]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.46.woff2',
				'[47]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.47.woff2',
				'[48]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.48.woff2',
				'[49]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.49.woff2',
				'[50]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.50.woff2',
				'[51]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.51.woff2',
				'[52]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.52.woff2',
				'[53]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.53.woff2',
				'[54]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.54.woff2',
				'[55]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.55.woff2',
				'[56]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.56.woff2',
				'[57]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.57.woff2',
				'[58]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.58.woff2',
				'[59]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.59.woff2',
				'[60]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.60.woff2',
				'[61]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.61.woff2',
				'[62]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.62.woff2',
				'[63]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.63.woff2',
				'[64]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.64.woff2',
				'[65]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.65.woff2',
				'[94]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.94.woff2',
				'[95]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.95.woff2',
				'[99]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.99.woff2',
				'[100]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.100.woff2',
				'[101]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.101.woff2',
				'[102]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.102.woff2',
				'[103]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.103.woff2',
				'[104]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.104.woff2',
				'[105]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.105.woff2',
				'[106]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.106.woff2',
				'[107]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.107.woff2',
				'[108]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.108.woff2',
				'[109]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.109.woff2',
				'[110]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.110.woff2',
				'[111]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.111.woff2',
				'[112]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.112.woff2',
				'[113]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.113.woff2',
				'[114]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.114.woff2',
				'[115]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.115.woff2',
				'[116]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.116.woff2',
				'[117]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.117.woff2',
				'[118]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.118.woff2',
				'[119]':
					'https://fonts.gstatic.com/s/stylish/v25/m8JSjfhPYriQkk7-foiRYr5LBQTwuLLyUZJAC6M3P8sGXg.119.woff2',
			},
		},
	},
	subsets: ['korean'],
});

export const fontFamily = 'Stylish' as const;

type Variants = {
	normal: {
		weights: '400';
		subsets: 'korean';
	};
};

export const loadFont = <T extends keyof Variants>(
	style?: T,
	options?: {
		weights?: Variants[T]['weights'][];
		subsets?: Variants[T]['subsets'][];
		document?: Document;
		ignoreTooManyRequestsWarning?: boolean;
	},
) => {
	return loadFonts(getInfo(), style, options);
};
