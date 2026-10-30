def get_compositions_payload(
  serve_url:,
  input_props: {},
  env_variables: {},
  chromium_options: {},
  log_level: 'info',
  bucket_name: nil,
  force_path_style: false,
  timeout_in_milliseconds: 30000,
  offthread_video_cache_size_in_bytes: nil,
  media_cache_size_in_bytes: nil,
  preferred_effect_backend: 'auto'
)
  payload = {
    "type" => "compositions",
    "version" => VERSION,
    "chromiumOptions" => chromium_options,
    "logLevel" => log_level,
    "inputProps" => {
      "type" => "payload",
      "payload" => JSON.generate(input_props)
    },
    "envVariables" => env_variables,
    "timeoutInMilliseconds" => timeout_in_milliseconds,
    "serveUrl" => serve_url,
    "bucketName" => bucket_name,
    "offthreadVideoCacheSizeInBytes" => offthread_video_cache_size_in_bytes,
    "mediaCacheSizeInBytes" => media_cache_size_in_bytes,
    "preferredEffectBackend" => preferred_effect_backend,
    "forcePathStyle" => force_path_style
  }

  payload
end
