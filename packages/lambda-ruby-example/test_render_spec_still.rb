require 'remotion_lambda/sdk'
require 'remotion_lambda/render_still_on_lambda_payload'

client = RemotionLambda::Client.new(
  region: 'eu-central-1',
)  

function_name = ENV.fetch('REMOTION_APP_FUNCTION_NAME')

payload = get_render_still_on_lambda_payload(
  composition: "still-helloworld",
  download_behavior: {
    type: "play-in-browser",
  },
  input_props: {
    message: "Hello from props!",
  }
)

res = client.render_still_on_lambda(function_name, payload)
puts res
