require 'remotion_lambda'
require 'remotion_lambda/render_media_on_lambda_payload'
require 'remotion_lambda/render_progress_payload'

client = RemotionLambda::Client.new(
  region: 'eu-central-1',
)  

function_name = ENV.fetch('REMOTION_APP_FUNCTION_NAME')

payload = get_render_media_on_lambda_payload(
  composition: "still-helloworld",
  download_behavior: {
    type: "play-in-browser",
  },
  codec: "h264",
  input_props: {
    message: "Hello from props!",
  }
)

res = client.render_media_on_lambda(function_name, payload)
puts res
while true
  render_progress_payload = get_render_progress_payload(
    render_id: res["renderId"],
    bucket_name: res["bucketName"],
  )
  progress = client.get_render_progress(function_name, render_progress_payload)
  puts progress["overallProgress"]
  break if progress["done"]
  break if progress["fatalErrorEncountered"]
  sleep 1
end

