from unittest import TestCase

from remotion_lambda_sdk.models import RenderParams
from remotion_lambda_sdk.remotionclient import RemotionClient

# python -m pip install boto3


class TestRemotionClient(TestCase):
    def test_remotion_construct_request(self):
        client = RemotionClient(region="us-east-1",
                                serve_url="testbed",
                                function_name="remotion-render")
        render_params = RenderParams(
            composition="react-svg",
            data={
                'hi': 'there'
            },
        )

        self.assertEqual(client.region, "us-east-1")
        self.assertIsNotNone(render_params)
        self.assertIsNotNone(render_params.data)
        print(client.construct_render_request(render_params=render_params))


""" 
    def test_remotion_progress_construct_request(self):
        client = RemotionClient(region="us-east-1",
                                serve_url="testbed",
                                function_name="remotion-render")
        render_params = RenderParams(
            composition="remotion-render",
            data={
                'hi': 'there'
            },
        )
        self.assertEqual(client.region, "us-east-1")
        self.assertIsNotNone(render_params)
        self.assertIsNotNone(render_params.data)
 """
