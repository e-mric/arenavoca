import unittest
from prepare_match import recording_segments


class TimestampTests(unittest.TestCase):
    def test_offsets_segments_and_words_without_altering_source(self):
        raw = [{"start": 1.2, "end": 3.5, "text": "A pass", "words": [{"start": 1.2, "end": 1.4, "word": "A"}]}]
        actual = recording_segments(raw, 187)
        self.assertEqual(188.2, actual[0]["start"])
        self.assertEqual(190.5, actual[0]["end"])
        self.assertEqual(188.4, actual[0]["words"][0]["end"])
        self.assertEqual(1.2, raw[0]["start"])
        self.assertEqual("A pass", actual[0]["text"])

    def test_silent_or_wordless_segments_remain_valid(self):
        self.assertEqual([], recording_segments([], 187))
        self.assertEqual([], recording_segments([{"start": 0, "end": 1}], 10)[0]["words"])


if __name__ == "__main__":
    unittest.main()
