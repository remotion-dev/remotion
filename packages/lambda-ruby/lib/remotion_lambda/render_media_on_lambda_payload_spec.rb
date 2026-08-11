require_relative 'render_media_on_lambda_payload'
require 'json'

raise "Expected overwrite to default to false in v4" unless resolve_overwrite(nil, "4.0.0") == false
raise "Expected overwrite to default to true in v5" unless resolve_overwrite(nil, "5.0.0") == true
raise "Expected an explicit false value to be preserved" unless resolve_overwrite(false, "5.0.0") == false

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

raise "Expected the current SDK to default overwrite to false" unless payload[:overwrite] == false

# Print as JSON
puts JSON.generate(payload)
