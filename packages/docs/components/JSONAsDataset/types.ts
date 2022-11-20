

interface MetadataType {
  cover_url?: string;
  project_url: string;
}

interface AfterCreditType {
  name: string;
  source_type: string;
  metadata: MetadataType,
  isSingle?: boolean,
}


export {
  MetadataType,
  AfterCreditType
}