import copy
import json
import unittest
from pathlib import Path
from prepare_clips import clip_specs


class ClipTests(unittest.TestCase):
    def setUp(self):
        self.pack = json.loads((Path(__file__).parent.parent / "content/barca-2018-opening.json").read_text())

    def test_all_six_clips_cover_the_action_with_two_seconds_of_context(self):
        specs = clip_specs(self.pack)
        self.assertEqual(len(specs), 6)
        self.assertEqual(specs[0], ("match_640_646", 638, 646))
        for card, (_, start, end) in zip(self.pack["cards"], specs):
            self.assertEqual(start, card["evidence"]["startSeconds"] - 2)
            self.assertEqual(end, card["evidence"]["endSeconds"])

    def test_rejects_wrong_source_and_out_of_bounds_ranges(self):
        for field, value in [("sourceId", "different-recording"), ("endSeconds", 99999), ("startSeconds", -1)]:
            pack = copy.deepcopy(self.pack)
            pack["cards"][0]["evidence"][field] = value
            with self.assertRaises(ValueError):
                clip_specs(pack)

    def test_lead_in_clamps_at_zero(self):
        self.pack["cards"][0]["evidence"].update(startSeconds=1, endSeconds=4)
        self.assertEqual(clip_specs(self.pack)[0], ("match_1_4", 0, 4))

if __name__ == "__main__":
    unittest.main()
