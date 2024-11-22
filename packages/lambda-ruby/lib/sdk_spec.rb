require_relative 'sdk'
require_relative 's3_output_provider'
require 'json'

# Create a test instance of the RemotionLambda::Client
client = RemotionLambda::Client.new(
  function_name: 'test-function',
  serve_url: 'https://example.com',
  region: 'us-east-1'
)

# Sample data
render_id = "abcdef"
bucket_name = "remotion-render"

# Call get_render_progress_payload with sample data
payload = client.get_render_progress_payload(
  render_id: render_id,
  bucket_name: bucket_name,
  s3_output_provider: RemotionLambda::S3OutputProvider.new(
    access_key_id: 'accessKeyId',
    endpoint: 'https://s3.us-east-1.amazonaws.com',
    region: 'us-east-1',
    secret_access_key: 'secretAccessKey'
  )
)

# Print as JSON
puts JSON.generate(payload)
