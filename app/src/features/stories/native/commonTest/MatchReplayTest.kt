package com.arenavoca.stories

import kotlin.test.*

class MatchReplayTest {
    @Test fun excerptsIncludeLeadInButNeverExtendPastTheEvidence() {
        val pack = MatchCatalog.pack
        val clips = pack.cards.map { MatchReplay.from(it.evidence) }
        assertEquals(6, clips.map { it.fileName }.toSet().size)
        pack.cards.zip(clips).forEach { (card, clip) ->
            assertEquals(card.evidence.startSeconds - 2, clip.startSeconds)
            assertEquals(card.evidence.endSeconds, clip.endSeconds)
            assertTrue(clip.durationSeconds in 4..9)
        }
        assertEquals("match_640_646", clips.first().fileName)
        assertEquals("10:38–10:46", clips.first().recordingRange)
    }
    @Test fun aMomentAtTheStartNeverSeeksBeforeTheRecording() {
        val evidence = MatchCatalog.pack.cards.first().evidence.copy(startSeconds = 0, endSeconds = 3, frameSeconds = listOf(0, 1, 2))
        val clip = MatchReplay.from(evidence)
        assertEquals(0, clip.startSeconds)
        assertEquals(3, clip.durationSeconds)
    }
}
