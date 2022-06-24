// From https://calculator.aws/pricing/2.0/meteredUnitMaps/lambda/USD/current/lambda.json

import type {AwsRegion} from './aws-regions';

export const pricing: {
	[key in AwsRegion]: {
		'Lambda Duration': {
			rateCode: string;
			price: string;
		};
		'Lambda Duration-Provisioned': {
			rateCode: string;
			price: string;
		};
		'Lambda Provisioned-Concurrency': {
			rateCode: string;
			price: string;
		};
		'Lambda Requests': {
			rateCode: string;
			price: string;
		};
		'Lambda Duration-ARM': {
			rateCode: string;
			price: string;
		};
		'Lambda Requests-ARM': {
			rateCode: string;
			price: string;
		};
		'Lambda Storage-Duration': {
			rateCode: string;
			price: string;
		};
		'Lambda Storage-Duration-ARM': {
			rateCode: string;
			price: string;
		};
	};
} = {
	'ap-south-1': {
		'Lambda Duration': {
			rateCode: 'PHDF9YNAFR3HDSR8.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000166667',
		},
		'Lambda Duration-ARM': {
			rateCode: '69Y7TUFYEF9HAV59.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000133334',
		},
		'Lambda Duration-Provisioned': {
			rateCode: 'QKVFMCSDP4AVPEE7.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000104966',
		},
		'Lambda Provisioned-Concurrency': {
			rateCode: 'ATX3ZXV9GDMQWKUN.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000044985',
		},
		'Lambda Requests': {
			rateCode: 'VPGUBFQ4KNZKMKGJ.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000002000',
		},
		'Lambda Requests-ARM': {
			rateCode: 'RYFSQRRXQ4R9CK7A.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000002000',
		},
		'Lambda Storage-Duration': {
			rateCode: 'QHWU5Q6JSUS532X2.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000000352',
		},
		'Lambda Storage-Duration-ARM': {
			rateCode: '2K94HT2ACCBDSE8U.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000000352',
		},
	},
	'ap-southeast-1': {
		'Lambda Duration': {
			rateCode: '67ZV6RMYY72YSRDC.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000166667',
		},
		'Lambda Duration-ARM': {
			rateCode: 'KSD76ZR243WEPWRS.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000133334',
		},
		'Lambda Duration-Provisioned': {
			rateCode: 'Z43QGMUZW4S2XN34.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000121313',
		},
		'Lambda Provisioned-Concurrency': {
			rateCode: 'A4HTACA65772T7MD.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000051991',
		},
		'Lambda Requests': {
			rateCode: '36D3E7396ZKUSWWW.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000002000',
		},
		'Lambda Requests-ARM': {
			rateCode: 'V5T5H5YEU5SUN3C2.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000002000',
		},
		'Lambda Storage-Duration': {
			rateCode: '8FAV96E74NWR9SG9.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000000370',
		},
		'Lambda Storage-Duration-ARM': {
			rateCode: 'M49Z5B8UP2XTPTGN.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000000370',
		},
	},
	'ap-southeast-2': {
		'Lambda Duration': {
			rateCode: '4NX7CSSF3DVPXWBT.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000166667',
		},
		'Lambda Duration-ARM': {
			rateCode: 'KDEJ26SV7QK2N7DW.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000133334',
		},
		'Lambda Duration-Provisioned': {
			rateCode: 'NBPYMYTJX2CTM4AJ.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000122173',
		},
		'Lambda Provisioned-Concurrency': {
			rateCode: '3MZN5YQ2PU7VCFH8.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000052360',
		},
		'Lambda Requests': {
			rateCode: 'ZW6UHD4Q6EPUCZWU.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000002000',
		},
		'Lambda Requests-ARM': {
			rateCode: '92KS5FMQEEJ39ACN.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000002000',
		},
		'Lambda Storage-Duration': {
			rateCode: 'D4HFHSGASZ38KWED.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000000370',
		},
		'Lambda Storage-Duration-ARM': {
			rateCode: 'ATH88NV3HBJ3ZTTG.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000000370',
		},
	},
	'ap-northeast-1': {
		'Lambda Duration': {
			rateCode: 'FSYUV9NMNDEXRJ5H.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000166667',
		},
		'Lambda Duration-ARM': {
			rateCode: 'ZSE7CMBEBTMPH8ET.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000133334',
		},
		'Lambda Duration-Provisioned': {
			rateCode: 'CQ446M27PP4V4UVB.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000125615',
		},
		'Lambda Provisioned-Concurrency': {
			rateCode: 'ZVA2Z6TTQNFCXFSU.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000053835',
		},
		'Lambda Requests': {
			rateCode: '3BE8DYKG4FYSZGDW.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000002000',
		},
		'Lambda Requests-ARM': {
			rateCode: 'AA4Q79463N2JQHZA.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000002000',
		},
		'Lambda Storage-Duration': {
			rateCode: 'E7BUD4C7BEJ3ED26.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000000370',
		},
		'Lambda Storage-Duration-ARM': {
			rateCode: '8DSSBVMYVUE4A85P.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000000370',
		},
	},
	'eu-central-1': {
		'Lambda Duration': {
			rateCode: 'S4ZKFHQ6B28FBYVW.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000166667',
		},
		'Lambda Duration-ARM': {
			rateCode: '6PPNGCBXY95TENXZ.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000133334',
		},
		'Lambda Duration-Provisioned': {
			rateCode: '6963ZK4U22NHS35G.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000117011',
		},
		'Lambda Provisioned-Concurrency': {
			rateCode: 'SADU4Z93G2F3QPA2.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000050147',
		},
		'Lambda Requests': {
			rateCode: 'CKZQ3D25MV9ET243.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000002000',
		},
		'Lambda Requests-ARM': {
			rateCode: 'UVYYDZQ83GKQ2K6C.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000002000',
		},
		'Lambda Storage-Duration': {
			rateCode: 'TSJKCMGTDRNVXPB4.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000000367',
		},
		'Lambda Storage-Duration-ARM': {
			rateCode: 'WSN3KKEEPF26JZR5.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000000367',
		},
	},
	'eu-west-1': {
		'Lambda Duration': {
			rateCode: 'SGGKTWDV7PGMPPSJ.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000166667',
		},
		'Lambda Duration-ARM': {
			rateCode: 'KXNSA7NBRHBHXXPS.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000133334',
		},
		'Lambda Duration-Provisioned': {
			rateCode: 'ZS4KB9WXZA5FWZ7A.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000108407',
		},
		'Lambda Provisioned-Concurrency': {
			rateCode: 'BP8P7CBMNM86SRMW.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000046460',
		},
		'Lambda Requests': {
			rateCode: 'B5V2RNHAWGVJBZD3.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000002000',
		},
		'Lambda Requests-ARM': {
			rateCode: 'DV2YFXRNHNJFTDP3.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000002000',
		},
		'Lambda Storage-Duration': {
			rateCode: '83UZGV2B4WAZRJSR.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000000340',
		},
		'Lambda Storage-Duration-ARM': {
			rateCode: '83UZGV2B4WAZRJSR.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000000340',
		},
	},
	'eu-west-2': {
		'Lambda Duration': {
			rateCode: 'RP9RSZYUC96SQ4G2.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000166667',
		},
		'Lambda Duration-ARM': {
			rateCode: 'VGMFG9KJ58Z2FK83.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000133334',
		},
		'Lambda Duration-Provisioned': {
			rateCode: 'W62XX94KDFQQKBSD.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000112709',
		},
		'Lambda Provisioned-Concurrency': {
			rateCode: '6DB7ZBYMK456XGDS.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000048304',
		},
		'Lambda Requests': {
			rateCode: 'NDYBVXT3KB548Z2A.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000002000',
		},
		'Lambda Requests-ARM': {
			rateCode: 'D4TPQYY66DKTZWX9.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000002000',
		},
		'Lambda Storage-Duration': {
			rateCode: 'N5RQX23Q92PY74R5.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000000358',
		},
		'Lambda Storage-Duration-ARM': {
			rateCode: 'N5RQX23Q92PY74R5.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000000358',
		},
	},
	'us-east-2': {
		'Lambda Duration': {
			rateCode: 'TG3M4CAGBA3NYQBH.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000166667',
		},
		'Lambda Duration-ARM': {
			rateCode: '72SBSFWPMDTH8S3J.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000133334',
		},
		'Lambda Duration-Provisioned': {
			rateCode: 'ZZF88MXYPS4DGSEZ.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000097222',
		},
		'Lambda Provisioned-Concurrency': {
			rateCode: 'BMKCD2ZCEYKTYYCB.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000041667',
		},
		'Lambda Requests': {
			rateCode: 'GU2ZS9HVP6QTQ7KE.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000002000',
		},
		'Lambda Requests-ARM': {
			rateCode: 'K7BX6567RJ67A2KE.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000002000',
		},
		'Lambda Storage-Duration': {
			rateCode: 'CVY5JH8RFRXMP92N.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000000309',
		},
		'Lambda Storage-Duration-ARM': {
			rateCode: 'CH6HMM86MH4K8KCS.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000000309',
		},
	},
	'us-east-1': {
		'Lambda Duration': {
			rateCode: '3BYZH4NKJN8TJUQ6.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000166667',
		},
		'Lambda Duration-ARM': {
			rateCode: 'CHGDQQ3YSPF93CBA.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000133334',
		},
		'Lambda Duration-Provisioned': {
			rateCode: '8RKHZ54QB9XA3Y9F.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000097222',
		},
		'Lambda Provisioned-Concurrency': {
			rateCode: 'ZA4ZDREWFS9UEMSC.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000041667',
		},
		'Lambda Requests': {
			rateCode: 'ZEA64MMVK5QRB5TC.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000002000',
		},
		'Lambda Requests-ARM': {
			rateCode: 'DMJPKNDPVRPMG2E7.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000002000',
		},
		'Lambda Storage-Duration': {
			rateCode: 'NTZU6AKMUBV2U895.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000000309',
		},
		'Lambda Storage-Duration-ARM': {
			rateCode: 'B3C4NH7C3BXVK5KQ.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000000309',
		},
	},
	'us-west-2': {
		'Lambda Duration': {
			rateCode: 'XCU6U9G4FCKZQWG9.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000166667',
		},
		'Lambda Duration-ARM': {
			rateCode: 'T3BEHFG5V4TZDT76.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000133334',
		},
		'Lambda Duration-Provisioned': {
			rateCode: 'MP7NQ6MSH3HNCZP6.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000097222',
		},
		'Lambda Provisioned-Concurrency': {
			rateCode: '67MDK2GR6PRT8GW8.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000041667',
		},
		'Lambda Requests': {
			rateCode: 'ZWHFK83WS2P4WZR6.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000002000',
		},
		'Lambda Requests-ARM': {
			rateCode: '6SKZPR8753NAAQ4W.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000002000',
		},
		'Lambda Storage-Duration': {
			rateCode: 'HXET4S4G5F9Y7FP6.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000000309',
		},
		'Lambda Storage-Duration-ARM': {
			rateCode: 'N9TMQ3FMNJR97GYZ.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000000309',
		},
	},
};
