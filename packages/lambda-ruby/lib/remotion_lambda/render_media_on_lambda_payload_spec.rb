require_relative 'render_media_on_lambda_payload'
require 'json'

# Call get_render_media_on_lambda with sample data
payload = get_render_media_on_lambda_payload(
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
