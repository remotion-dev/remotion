def get_render_progress_payload(
  render_id:,
  bucket_name:,
  force_path_style: false,
  log_level: 'info',
  s3_output_provider: nil
)
  payload = {
    "type" => "status",
    "renderId" => render_id,
    "bucketName" => bucket_name,
    "version" => VERSION,
    "forcePathStyle" => force_path_style,
    "logLevel" => log_level,
    "s3OutputProvider" => s3_output_provider
  }

  payload
end
