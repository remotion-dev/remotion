require_relative 'sdk'
require 'json'

# Create a test instance of the RemotionLambda::Client
client = RemotionLambda::Client.new(
  function_name: 'test-function',
  serve_url: 'https://example.com',
  region: 'us-east-1'
)

# Sample data
render_id = "test-render-123"
bucket_name = "my-test-bucket"

# Call get_render_progress_payload with sample data
payload = client.get_render_progress_payload(render_id, bucket_name)

# Print as JSON
puts JSON.generate(payload)
