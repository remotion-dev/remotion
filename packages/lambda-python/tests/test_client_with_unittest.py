# test_with_unittest.py

from unittest import TestCase


class TestRemotionClient(TestCase):
    def test_always_passes(self):
        self.assertTrue(True)

    def test_always_fails(self):
        self.assertTrue(False)
