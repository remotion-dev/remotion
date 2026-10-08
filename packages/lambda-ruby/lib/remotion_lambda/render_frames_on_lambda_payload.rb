require_relative 'render_media_on_lambda_payload'

def get_render_frames_on_lambda_payload(
  image_format: 'png',
  jpeg_quality: nil,
  output_prefix: nil,
  image_sequence_pattern: nil,
  **options
)
  unless ['png', 'jpeg'].include?(image_format)
    raise ArgumentError, 'image_format must be "png" or "jpeg".'
  end
  if !jpeg_quality.nil? && image_format != 'jpeg'
    raise ArgumentError, 'jpeg_quality can only be passed with image_format: "jpeg".'
  end

  payload = get_render_media_on_lambda_payload(
    **options,
    codec: nil,
    image_format: image_format,
    jpeg_quality: jpeg_quality.nil? ? 80 : jpeg_quality,
    muted: true,
    out_name: nil,
    number_of_gif_loops: nil,
    download_behavior: options[:download_behavior] || {type: 'play-in-browser'}
  )
  payload[:output] = {
    type: 'sequence',
    outputPrefix: output_prefix,
    imageSequencePattern: image_sequence_pattern
  }
  payload
end
