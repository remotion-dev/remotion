require_relative 'sdk'
require_relative 's3_output_provider'
require 'json'

# Create a test instance of the RemotionLambda::Client
client = RemotionLambda::Client.new(
  function_name: 'test-function',
  serve_url: 'https://example.com',
  region: 'us-east-1'
)

# Call get_render_media_on_lambda with sample data
payload = client.get_render_media_on_lambda_payload(
  codec: "h264",
  metadata: {
    Author: "Lunar"
  },
  bucket_name: nil,
  composition: "react-svg",
  webhook: {
    customData: {
      hi: "there",
    },
    secret: "abc",
    url: "https://example.com",
  },
  download_behavior: {
    fileName: "hi",
    type: "download",
  },
  input_props: {
    hi: "there",
  }
)

# Print as JSON
puts JSON.generate(payload)
