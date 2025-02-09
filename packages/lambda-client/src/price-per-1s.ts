// From https://calculator.aws/pricing/2.0/meteredUnitMaps/lambda/USD/current/lambda.json

import type {AwsRegion} from './regions';

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
	'af-south-1': {
		'Lambda Duration-Provisioned': {
			rateCode: 'X7CK6KFXNWY9RF6Z.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000129000',
		},
		'Lambda Provisioned-Concurrency': {
			rateCode: 'R7SEQT2WRDVFV6ZA.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000055300',
		},
		'Lambda Requests': {
			rateCode: 'BNQXHCKJQCQXPHE8.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000002700',
		},
		'Lambda Requests-ARM': {
			rateCode: 'XPFR3MTP3RW5GRTN.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000002700',
		},
		'Lambda Storage-Duration': {
			rateCode: '4BP2EZTC4F4EHEEZ.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000000404',
		},
		'Lambda Storage-Duration-ARM': {
			rateCode: 'XGW8AHN7KTN5TCH5.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000000404',
		},
		'Lambda Duration': {
			rateCode: 'Z6UGBG979PFHQNPH.JRTCKXETXF.CUKFZ388N3',
			price: '0.0000221000',
		},
		'Lambda Duration-ARM': {
			rateCode: '2PW46FQRKMQMYQVF.JRTCKXETXF.6NBUNBXSC3',
			price: '0.0000176800',
		},
	},
	'ap-east-1': {
		'Lambda Duration-Provisioned': {
			rateCode: 'G5524SRW6HD6742P.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000133358',
		},
		'Lambda Provisioned-Concurrency': {
			rateCode: 'YY2W7HU5HZERD9YH.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000057153',
		},
		'Lambda Requests': {
			rateCode: '68H82NC62DFBNEVM.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000002800',
		},
		'Lambda Requests-ARM': {
			rateCode: '5JXCX35TH2MPMFMW.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000002800',
		},
		'Lambda Storage-Duration': {
			rateCode: 'FAUSK48UZ8QQK3JS.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000000407',
		},
		'Lambda Storage-Duration-ARM': {
			rateCode: 'G7RNUCJ8FY236XS9.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000000407',
		},
		'Lambda Duration': {
			rateCode: 'Y3J9NSBFENB45VFD.JRTCKXETXF.CUKFZ388N3',
			price: '0.0000229200',
		},
		'Lambda Duration-ARM': {
			rateCode: '79GRE5UQB86PEDTE.JRTCKXETXF.6NBUNBXSC3',
			price: '0.0000183000',
		},
	},
	'ap-south-1': {
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
		'Lambda Duration': {
			rateCode: 'PHDF9YNAFR3HDSR8.JRTCKXETXF.CUKFZ388N3',
			price: '0.0000166667',
		},
		'Lambda Duration-ARM': {
			rateCode: '69Y7TUFYEF9HAV59.JRTCKXETXF.6NBUNBXSC3',
			price: '0.0000133334',
		},
	},
	'ap-northeast-3': {
		'Lambda Duration-Provisioned': {
			rateCode: 'UZWTTB7ZV7B2GMG5.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000125615',
		},
		'Lambda Provisioned-Concurrency': {
			rateCode: '8ZQGQZJZS48NB28R.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000053835',
		},
		'Lambda Requests': {
			rateCode: '89U8ZQR2ZV45HXWY.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000002000',
		},
		'Lambda Requests-ARM': {
			rateCode: 'FPS5FM45229RTFBT.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000002000',
		},
		'Lambda Storage-Duration': {
			rateCode: 'CU95TW3FKNQFD844.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000000370',
		},
		'Lambda Storage-Duration-ARM': {
			rateCode: 'XZJM3HMZSZCJ84TM.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000000370',
		},
		'Lambda Duration': {
			rateCode: 'HQWXQQHHTTTVSUH2.JRTCKXETXF.CUKFZ388N3',
			price: '0.0000166667',
		},
		'Lambda Duration-ARM': {
			rateCode: '92C8Z466WVKPRP7S.JRTCKXETXF.6NBUNBXSC3',
			price: '0.0000133334',
		},
	},
	'ap-northeast-2': {
		'Lambda Duration-Provisioned': {
			rateCode: 'GX89TXD63W6NZ626.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000119592',
		},
		'Lambda Provisioned-Concurrency': {
			rateCode: 'UP7EY8NNX8VZF5MD.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000051254',
		},
		'Lambda Requests': {
			rateCode: 'NFXH9EUGP7BUPE4A.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000002000',
		},
		'Lambda Requests-ARM': {
			rateCode: '4KD96CKPZF9FJUJ9.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000002000',
		},
		'Lambda Storage-Duration': {
			rateCode: 'QYHWMM7W2MAR34MK.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000000352',
		},
		'Lambda Storage-Duration-ARM': {
			rateCode: '6XSCMH79E2EPRAA3.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000000352',
		},
		'Lambda Duration': {
			rateCode: 'AW8K7Q9ZMMBBP9W6.JRTCKXETXF.CUKFZ388N3',
			price: '0.0000166667',
		},
		'Lambda Duration-ARM': {
			rateCode: 'Y9MYZCDTMAKCDR6D.JRTCKXETXF.6NBUNBXSC3',
			price: '0.0000133334',
		},
	},
	'ap-southeast-4': {
		'Lambda Storage-Duration': {
			rateCode: 'VVJE4FEKRZE6DRJK.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000000370',
		},
		'Lambda Requests-ARM': {
			rateCode: 'UH8TQNRPPRZ9TJ4V.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000002000',
		},
		'Lambda Provisioned-Concurrency': {
			rateCode: '2EC2UBFH6KGNHV2T.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000052360',
		},
		'Lambda Duration-ARM': {
			rateCode: 'QVV5SPACJCKHAF8A.JRTCKXETXF.6NBUNBXSC3',
			price: '0.0000133334',
		},
		'Lambda Requests': {
			rateCode: 'VXJTSR9CJSBFXG5K.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000002000',
		},
		'Lambda Storage-Duration-ARM': {
			rateCode: '29EUHTVHTD7D8THR.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000000370',
		},
		'Lambda Duration': {
			rateCode: 'H6FQK2WA7RDQ5V8X.JRTCKXETXF.CUKFZ388N3',
			price: '0.0000166667',
		},
		'Lambda Duration-Provisioned': {
			rateCode: 'YYP8U36M9AE5T6D2.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000122173',
		},
	},
	'ap-southeast-5': {
		'Lambda Storage-Duration-ARM': {
			rateCode: 'Q54DCNPEP5HDZ72X.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000000333',
		},
		'Lambda Storage-Duration': {
			rateCode: 'Q54DCNPEP5HDZ72X.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000000333',
		},
		'Lambda Requests-ARM': {
			rateCode: 'F9T53VWVKRT6G32X.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000001800',
		},
		'Lambda Provisioned-Concurrency': {
			rateCode: '72ETGRTGNSDZG7ZS.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000046791',
		},
		'Lambda Duration-ARM': {
			rateCode: 'JZF5EBXY9YXH6KJZ.JRTCKXETXF.6NBUNBXSC3',
			price: '0.0000120000',
		},
		'Lambda Requests': {
			rateCode: 'GVB4MJBFXA3BX4M6.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000001800',
		},
		'Lambda Duration': {
			rateCode: 'D9T9NECWKTB5WH67.JRTCKXETXF.CUKFZ388N3',
			price: '0.0000150000',
		},
		'Lambda Duration-Provisioned': {
			rateCode: 'BWUE5MJNG4QYHA76.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000109181',
		},
	},
	'ap-southeast-1': {
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
		'Lambda Duration': {
			rateCode: '67ZV6RMYY72YSRDC.JRTCKXETXF.CUKFZ388N3',
			price: '0.0000166667',
		},
		'Lambda Duration-ARM': {
			rateCode: 'KSD76ZR243WEPWRS.JRTCKXETXF.6NBUNBXSC3',
			price: '0.0000133334',
		},
	},
	'ap-southeast-2': {
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
		'Lambda Duration': {
			rateCode: '4NX7CSSF3DVPXWBT.JRTCKXETXF.CUKFZ388N3',
			price: '0.0000166667',
		},
		'Lambda Duration-ARM': {
			rateCode: 'KDEJ26SV7QK2N7DW.JRTCKXETXF.6NBUNBXSC3',
			price: '0.0000133334',
		},
	},
	'ap-northeast-1': {
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
		'Lambda Duration': {
			rateCode: 'FSYUV9NMNDEXRJ5H.JRTCKXETXF.CUKFZ388N3',
			price: '0.0000166667',
		},
		'Lambda Duration-ARM': {
			rateCode: 'ZSE7CMBEBTMPH8ET.JRTCKXETXF.6NBUNBXSC3',
			price: '0.0000133334',
		},
	},
	'ca-central-1': {
		'Lambda Duration-Provisioned': {
			rateCode: 'ZMDUKS3D6V7QJFQT.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000108407',
		},
		'Lambda Provisioned-Concurrency': {
			rateCode: '9M447J8E9CJSZFKY.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000046460',
		},
		'Lambda Requests': {
			rateCode: 'XM5KDGVKY9KYJWCG.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000002000',
		},
		'Lambda Requests-ARM': {
			rateCode: 'B22EKFMS5UB7E4DB.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000002000',
		},
		'Lambda Storage-Duration': {
			rateCode: 'WFVQTPK4SQ6UGEPT.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000000340',
		},
		'Lambda Storage-Duration-ARM': {
			rateCode: 'Y9JGD8ASN2SPS7QA.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000000340',
		},
		'Lambda Duration': {
			rateCode: 'KS26AK5FJMDYPXSF.JRTCKXETXF.CUKFZ388N3',
			price: '0.0000166667',
		},
		'Lambda Duration-ARM': {
			rateCode: 'WH7JAAY3UGC8KHEC.JRTCKXETXF.6NBUNBXSC3',
			price: '0.0000133334',
		},
	},
	'eu-central-1': {
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
		'Lambda Duration': {
			rateCode: 'S4ZKFHQ6B28FBYVW.JRTCKXETXF.CUKFZ388N3',
			price: '0.0000166667',
		},
		'Lambda Duration-ARM': {
			rateCode: '6PPNGCBXY95TENXZ.JRTCKXETXF.6NBUNBXSC3',
			price: '0.0000133334',
		},
	},
	'eu-west-1': {
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
			rateCode: 'N6RU8DUAHRJJA9F9.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000000340',
		},
		'Lambda Duration': {
			rateCode: 'SGGKTWDV7PGMPPSJ.JRTCKXETXF.CUKFZ388N3',
			price: '0.0000166667',
		},
		'Lambda Duration-ARM': {
			rateCode: 'KXNSA7NBRHBHXXPS.JRTCKXETXF.6NBUNBXSC3',
			price: '0.0000133334',
		},
	},
	'eu-west-2': {
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
			rateCode: '555FJ99JDKUE4USZ.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000000358',
		},
		'Lambda Duration': {
			rateCode: 'RP9RSZYUC96SQ4G2.JRTCKXETXF.CUKFZ388N3',
			price: '0.0000166667',
		},
		'Lambda Duration-ARM': {
			rateCode: 'VGMFG9KJ58Z2FK83.JRTCKXETXF.6NBUNBXSC3',
			price: '0.0000133334',
		},
	},
	'eu-south-1': {
		'Lambda Duration-Provisioned': {
			rateCode: 'CQ3MCSJ8KUN9AG4M.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000113827',
		},
		'Lambda Provisioned-Concurrency': {
			rateCode: 'WCTG35VUU2JTG398.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000048783',
		},
		'Lambda Requests': {
			rateCode: 'EE6A5VEB3PCF9VKU.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000002300',
		},
		'Lambda Requests-ARM': {
			rateCode: 'K9DMCWXXQT7TQSWX.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000002300',
		},
		'Lambda Storage-Duration': {
			rateCode: 'J6URR2UHKJHADCJR.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000000357',
		},
		'Lambda Storage-Duration-ARM': {
			rateCode: '95QW2EH2JTEV5PB8.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000000357',
		},
		'Lambda Duration': {
			rateCode: 'SWU8SVYB8U6S2RXR.JRTCKXETXF.CUKFZ388N3',
			price: '0.0000195172',
		},
		'Lambda Duration-ARM': {
			rateCode: 'SKKKJURRUZNWWKF9.JRTCKXETXF.6NBUNBXSC3',
			price: '0.0000156138',
		},
	},
	'eu-west-3': {
		'Lambda Duration-Provisioned': {
			rateCode: '8XRAXPBUT4QZ92DT.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000113569',
		},
		'Lambda Provisioned-Concurrency': {
			rateCode: 'HYMBKMJZP76PZ7UF.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000048673',
		},
		'Lambda Requests': {
			rateCode: '6GFK8TZW8U8G9MUB.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000002000',
		},
		'Lambda Requests-ARM': {
			rateCode: 'BVPQ9WHBE3SM65K7.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000002000',
		},
		'Lambda Storage-Duration': {
			rateCode: 'N7HW6RPFWJVEX3VW.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000000358',
		},
		'Lambda Storage-Duration-ARM': {
			rateCode: 'ZWPEJYBW22R8KWS7.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000000358',
		},
		'Lambda Duration': {
			rateCode: '7V27U9PFRJGUDWJ8.JRTCKXETXF.CUKFZ388N3',
			price: '0.0000166667',
		},
		'Lambda Duration-ARM': {
			rateCode: 'RUA4GEMXYRH9896Q.JRTCKXETXF.6NBUNBXSC3',
			price: '0.0000133334',
		},
	},
	'eu-north-1': {
		'Lambda Duration-Provisioned': {
			rateCode: 'PK4HANPQ3MKK2P4F.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000103245',
		},
		'Lambda Provisioned-Concurrency': {
			rateCode: 'C8CESGBREP8BBMUZ.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000044248',
		},
		'Lambda Requests': {
			rateCode: 'KERWZD8CJ22SEZWT.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000002000',
		},
		'Lambda Requests-ARM': {
			rateCode: 'R3N9VPKCMSVAJDEH.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000002000',
		},
		'Lambda Storage-Duration': {
			rateCode: 'D5P7WQ6NGY6MNGPU.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000000323',
		},
		'Lambda Storage-Duration-ARM': {
			rateCode: 'M5U4DY9KUQ5P8XRV.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000000323',
		},
		'Lambda Duration': {
			rateCode: '7N49FRQMXS49C2QS.JRTCKXETXF.CUKFZ388N3',
			price: '0.0000166667',
		},
		'Lambda Duration-ARM': {
			rateCode: 'VRFJ836X75T58FNT.JRTCKXETXF.6NBUNBXSC3',
			price: '0.0000133334',
		},
	},
	'me-south-1': {
		'Lambda Duration-Provisioned': {
			rateCode: '55WKNBUF5TE92NZJ.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000119251',
		},
		'Lambda Provisioned-Concurrency': {
			rateCode: 'RPTP77J75VAKQZD9.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000051108',
		},
		'Lambda Requests': {
			rateCode: 'EMZ8YZDPGWMDYZNK.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000002500',
		},
		'Lambda Requests-ARM': {
			rateCode: 'KY96C7U4EB95UXGK.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000002500',
		},
		'Lambda Storage-Duration': {
			rateCode: 'DBA83XQ3BXSW7T3A.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000000374',
		},
		'Lambda Storage-Duration-ARM': {
			rateCode: '9PH9MHPV4V4MQNRH.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000000374',
		},
		'Lambda Duration': {
			rateCode: 'N7S38YMSMVSPHNAH.JRTCKXETXF.CUKFZ388N3',
			price: '0.0000206667',
		},
		'Lambda Duration-ARM': {
			rateCode: 'R3C6YVZV7TF52KUE.JRTCKXETXF.6NBUNBXSC3',
			price: '0.0000165334',
		},
	},
	'sa-east-1': {
		'Lambda Duration-Provisioned': {
			rateCode: 'VENWZ787B7TGFR3E.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000154867',
		},
		'Lambda Provisioned-Concurrency': {
			rateCode: '8CC33XHRZVTNGE2A.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000066372',
		},
		'Lambda Requests': {
			rateCode: '7TZ969MZND3Z6HD7.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000002000',
		},
		'Lambda Requests-ARM': {
			rateCode: 'D9Z54P78JUX2Y552.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000002000',
		},
		'Lambda Storage-Duration': {
			rateCode: '9FNFNSCFQFX6C5GU.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000000586',
		},
		'Lambda Storage-Duration-ARM': {
			rateCode: 'A5QYMYNMDQHDWHTP.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000000586',
		},
		'Lambda Duration': {
			rateCode: 'JNXN2GCNDMDR7JAF.JRTCKXETXF.CUKFZ388N3',
			price: '0.0000166667',
		},
		'Lambda Duration-ARM': {
			rateCode: 'HTQZ78UWV8DFX49Y.JRTCKXETXF.6NBUNBXSC3',
			price: '0.0000133334',
		},
	},
	'us-east-1': {
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

		'Lambda Duration': {
			rateCode: 'TG3M4CAGBA3NYQBH.JRTCKXETXF.CUKFZ388N3',
			price: '0.0000166667',
		},
		'Lambda Duration-ARM': {
			rateCode: '72SBSFWPMDTH8S3J.JRTCKXETXF.6NBUNBXSC3',
			price: '0.0000133334',
		},
	},
	'us-east-2': {
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

		'Lambda Duration': {
			rateCode: '3BYZH4NKJN8TJUQ6.JRTCKXETXF.CUKFZ388N3',
			price: '0.0000166667',
		},
		'Lambda Duration-ARM': {
			rateCode: 'CHGDQQ3YSPF93CBA.JRTCKXETXF.6NBUNBXSC3',
			price: '0.0000133334',
		},
	},
	'us-west-1': {
		'Lambda Duration-Provisioned': {
			rateCode: 'X79AKVS7VZDNBZ9U.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000114430',
		},
		'Lambda Provisioned-Concurrency': {
			rateCode: 'QP9Q8TWYNJX4PDBS.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000049041',
		},
		'Lambda Requests': {
			rateCode: 'YY4C5XTAZNQPB6J6.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000002000',
		},
		'Lambda Requests-ARM': {
			rateCode: 'EQE7YY7WBWZFB46G.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000002000',
		},
		'Lambda Storage-Duration': {
			rateCode: '59PHF9Z3ZAYD2XW9.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000000370',
		},
		'Lambda Storage-Duration-ARM': {
			rateCode: 'TGG4EG7U2Y6WABH7.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000000370',
		},
		'Lambda Duration': {
			rateCode: '46GNEXAQAPS9YGE2.JRTCKXETXF.CUKFZ388N3',
			price: '0.0000166667',
		},
		'Lambda Duration-ARM': {
			rateCode: 'XVFAA23C65JJZNNW.JRTCKXETXF.6NBUNBXSC3',
			price: '0.0000133334',
		},
	},
	'eu-central-2': {
		'Lambda Storage-Duration': {
			rateCode: '4JZ5N4HUYM6K333N.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000000441',
		},
		'Lambda Requests-ARM': {
			rateCode: 'VUQUVJRYRZKGXHKX.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000002200',
		},
		'Lambda Provisioned-Concurrency': {
			rateCode: 'YYM4DVFSJ5APJDUG.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000055162',
		},
		'Lambda Duration-ARM': {
			rateCode: 'EZZMW8SEEDT6E2G5.JRTCKXETXF.6NBUNBXSC3',
			price: '0.0000146667',
		},
		'Lambda Requests': {
			rateCode: '8FY96CH95ZA8NU5C.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000002200',
		},
		'Lambda Storage-Duration-ARM': {
			rateCode: 'TMSMVCZ6FWXCBNM5.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000000441',
		},
		'Lambda Duration': {
			rateCode: 'U6YRFNVKQZTX8VF2.JRTCKXETXF.CUKFZ388N3',
			price: '0.0000183334',
		},
		'Lambda Duration-Provisioned': {
			rateCode: '594VMK9T4PANJ2TK.JRTCKXETXF.6YS6EN2CT7',
			price: '0.0000128712',
		},
	},
	'us-west-2': {
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
		'Lambda Duration': {
			rateCode: 'XCU6U9G4FCKZQWG9.JRTCKXETXF.CUKFZ388N3',
			price: '0.0000166667',
		},
		'Lambda Duration-ARM': {
			rateCode: 'T3BEHFG5V4TZDT76.JRTCKXETXF.6NBUNBXSC3',
			price: '0.0000133334',
		},
	},
};
