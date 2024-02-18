let chromiumDisableWebSecurity = false;
let ignoreCertificateErrors = false;
let headlessMode = true;

export const getChromiumDisableWebSecurity = () => chromiumDisableWebSecurity;
export const setChromiumDisableWebSecurity = (should: boolean) => {
	chromiumDisableWebSecurity = should;
};

export const getIgnoreCertificateErrors = () => ignoreCertificateErrors;
export const setChromiumIgnoreCertificateErrors = (should: boolean) => {
	ignoreCertificateErrors = should;
};

export const getChromiumHeadlessMode = () => headlessMode;
export const setChromiumHeadlessMode = (should: boolean) => {
	headlessMode = should;
};
