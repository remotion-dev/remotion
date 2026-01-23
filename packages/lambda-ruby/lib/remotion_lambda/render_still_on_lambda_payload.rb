require_relative 'version'

def get_render_still_on_lambda_payload(
  bucket_name: nil,
  composition: nil,
  delete_after: nil,
  download_behavior: nil,
  env_variables: {},
  force_height: nil,
  force_path_style: false,
  force_width: nil,
  api_key: nil,
  license_key: nil,
  image_format: "jpeg",
  input_props: {},
  jpeg_quality: 80,
  storage_class: nil,
  log_level: "info",
  max_retries: 1,
  metadata: {},
  offthread_video_threads: nil,
  offthread_video_cache_size_in_bytes: nil,
  media_cache_size_in_bytes: nil,
  out_name: nil,
  overwrite: false,
  privacy: "public",
  scale: 1,
  serve_url: "testbed-v6",
  timeout_in_milliseconds: 30000,
  chromium_options: {},
  frame: 0,
  is_production: nil
)

if api_key != nil
  warn "[DEPRECATED] The 'api_key' parameter is deprecated and will be removed in a future version. Please use 'license_key' instead."
end

payload = {
    composition: composition,
    chromiumOptions: chromium_options,
    deleteAfter: delete_after,
    downloadBehavior: download_behavior,
    envVariables: env_variables,
    forceHeight: force_height,
    forcePathStyle: force_path_style,
    forceWidth: force_width,
    licenseKey: license_key || api_key,
    imageFormat: image_format,
    inputProps: {
      type: "payload",
      payload: JSON.generate(input_props)
    },
    jpegQuality: jpeg_quality,
    storageClass: storage_class,
    logLevel: log_level,
    maxRetries: max_retries,
    offthreadVideoCacheSizeInBytes: offthread_video_cache_size_in_bytes,
    mediaCacheSizeInBytes: media_cache_size_in_bytes,
    offthreadVideoThreads: offthread_video_threads,
    outName: out_name,
    privacy: privacy,
    scale: scale,
    serveUrl: serve_url,
    timeoutInMilliseconds: timeout_in_milliseconds,
    type: "still",
    version: VERSION,
    bucketName: bucket_name,
    attempt: 1,
    streamed: false,
    frame: frame,
    isProduction: is_production
  }
  payload
end
