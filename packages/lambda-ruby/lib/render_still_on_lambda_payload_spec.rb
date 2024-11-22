require_relative 'render_still_on_lambda_payload'
require 'json'

# Call get_render_media_on_lambda with sample data
payload = get_render_still_on_lambda_payload(
  bucket_name: nil,
  composition: "still-helloworld",
  download_behavior: {
    type: "play-in-browser",
  },
  input_props: {
    message: "Hello from props!",
  }
)

# Print as JSON
puts JSON.generate(payload)
