from unittest import TestCase

from remotion_lambda.models import RenderMediaParams, Download, Webhook
from remotion_lambda.remotionclient import RemotionClient


class TestRemotionClient(TestCase):
    def test_remotion_construct_request(self):
        client = RemotionClient(region="us-east-1",
                                serve_url="testbed",
                                function_name="remotion-render")
        render_params = RenderMediaParams(
            composition="react-svg",
            input_props={
                'hi': 'there'
            },
            metadata={
                "Author": "Lunar"
            },
            download_behavior=Download(type="download", fileName="hi"),
            webhook=Webhook(
                url="https://example.com", secret="abc", customData=dict(hi="there"))
        )

        self.assertEqual(client.region, "us-east-1")
        self.assertIsNotNone(render_params)
        self.assertIsNotNone(render_params.input_props)
        print(client.construct_render_request(
            render_params=render_params, render_type="video-or-audio"))
