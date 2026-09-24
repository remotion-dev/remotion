export type Label = { id: string; label: string };

const removeUsbIdentifier = (label: string) => {
  return label.replace(/\(\w{4}:\w{4}\)/, "").trim();
};

const removeBuiltIn = (label: string) => {
  return label.replace(/\(Built-in\)/, "").trim();
};

const removeVirtual = (label: string) => {
  return label.replace(/\(Virtual\)/, "").trim();
};
const removeMdevice = (label: string) => {
  return label.replace(/\(m-de:vice\)/, "").trim();
};

const takeStringInBraces = (label: string): string => {
  const match = label.match(/\((.*)\)/);
  if (!match) {
    return label;
  }

  if (match[1] === "Bluetooth") {
    return label.replace(/\(Bluetooth\)/, "").trim();
  }

  return match[1] as string;
};

const removeLeadingNumber = (label: string) => {
  return label.replace(/^\d+- /, "").trim();
};

export const formatDeviceLabel = (label: string) => {
  const withoutUsb = removeUsbIdentifier(label);
  const withoutBuiltIn = removeBuiltIn(withoutUsb);
  const withoutVirtual = removeVirtual(withoutBuiltIn);
  const withoutDevice = removeMdevice(withoutVirtual);
  const stringFromBraces = takeStringInBraces(withoutDevice);
  const withoutLeadingNumber = removeLeadingNumber(stringFromBraces);

  return withoutLeadingNumber;
};
