from unittest import TestCase
from unittest.mock import patch

from remotion_lambda.models import RenderMediaParams, ShouldDownload, Webhook
from remotion_lambda.remotionclient import RemotionClient
from remotion_lambda.exception import RemotionInvalidArgumentException


class TestRemotionClient(TestCase):
    def test_overwrite_defaults_to_false_in_v4(self):
        render_params = RenderMediaParams()

        self.assertFalse(render_params.serialize_params()['overwrite'])

    @patch('remotion_lambda.models.VERSION', '5.0.0')
    def test_overwrite_defaults_to_true_in_v5(self):
        render_params = RenderMediaParams()

        self.assertTrue(render_params.serialize_params()['overwrite'])

    @patch('remotion_lambda.models.VERSION', '5.0.0')
    def test_explicit_false_overwrite_is_preserved_in_v5(self):
        render_params = RenderMediaParams(overwrite=False)

        self.assertFalse(render_params.serialize_params()['overwrite'])

    def test_remotion_construct_request(self):
        client = RemotionClient(
            region="us-east-1", serve_url="testbed", function_name="remotion-render"
        )
        render_params = RenderMediaParams(
            composition="react-svg",
            input_props={'hi': 'there'},
            metadata={"Author": "Lunar"},
            download_behavior=ShouldDownload(type="download", fileName="hi"),
            webhook=Webhook(
                url="https://example.com", secret="abc", customData=dict(hi="there")
            ),
        )

        self.assertEqual(client.region, "us-east-1")
        self.assertIsNotNone(render_params)
        self.assertIsNotNone(render_params.input_props)
        print(
            client.construct_render_request(
                render_params=render_params, render_type="video-or-audio"
            )
        )

    def test_remotion_construct_request_illegal_argument(self):
       with self.assertRaises(RemotionInvalidArgumentException):
        client = RemotionClient(
            region="us-east-1", serve_url="", function_name=""
        )
