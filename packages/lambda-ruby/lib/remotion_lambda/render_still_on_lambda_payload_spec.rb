require_relative 'render_still_on_lambda_payload'
require 'json'

payload = get_render_still_on_lambda_payload(
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
