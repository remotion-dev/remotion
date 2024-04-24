import {cpSync, existsSync, mkdirSync, writeFileSync} from 'fs';
import path from 'path';

// /etc/pki/pkcs11.txt
export const nssConfigFile = () => {
	return `
library=libnsssysinit.so
name=NSS Internal PKCS #11 Module
parameters=configdir='sql:/tmp/.pki/nssdb'  certPrefix='' keyPrefix='' secmod='secmod.db' flags= updatedir='' updateCertPrefix='' updateKeyPrefix='' updateid='' updateTokenDescription=''
NSS=Flags=internal,moduleDBOnly,critical trustOrder=75 cipherOrder=100 slotParams=(1={slotFlags=[RSA,DSA,DH,RC2,RC4,DES,RANDOM,SHA1,MD5,MD2,SSL,TLS,AES,Camellia,SEED,SHA256,SHA512] askpw=any timeout=30})
  `.trim();
};

const TARGET_DIR = '/tmp/.pki/nssdb';
const TARGET_FILE = path.join(TARGET_DIR, 'pkcs11.txt');
const TARGET_CERT_DB = path.join(TARGET_DIR, 'cert9.db');
const TARGET_KEY_DB = path.join(TARGET_DIR, 'key4.db');

export const initNss = () => {
	if (!existsSync(TARGET_DIR)) {
		mkdirSync(TARGET_DIR, {recursive: true});
	}

	if (!existsSync(TARGET_FILE)) {
		const nssConfig = nssConfigFile();
		writeFileSync(TARGET_FILE, nssConfig);
	}

	if (!existsSync(TARGET_CERT_DB)) {
		cpSync('/opt/nss/cert9.db', TARGET_CERT_DB);
	}

	if (!existsSync(TARGET_KEY_DB)) {
		cpSync('/opt/nss/key4.db', TARGET_KEY_DB);
	}

	console.log('Written!');
};
