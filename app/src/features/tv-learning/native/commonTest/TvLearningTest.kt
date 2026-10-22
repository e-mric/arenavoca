package com.arenavoca.tvlearning

import kotlin.test.*

class TvLearningTest {
    @Test fun momentsUnlockOnlyAtTheObservedEndOfEachAction() {
        val state = TvLearning()
        assertFalse(state.open("pass"))
        state.observe(7_999)
        assertTrue(state.available.isEmpty())
        state.observe(8_000)
        assertEquals(listOf("pass"), state.available.map { it.phraseId })
        assertFalse(state.open("shot"))
        state.observe(20_000)
        assertEquals(2, state.available.size)
        state.observe(28_000)
        assertEquals(3, state.available.size)
    }
    @Test fun readingAndFlippingStayPinnedAsPlaybackAdvancesOrSeeks() {
        val state = TvLearning()
        state.observe(8_000)
        assertTrue(state.open("pass"))
        state.flip()
        state.observe(29_000)
        assertEquals("pass", state.selected?.phraseId)
        assertTrue(state.translated)
        state.observe(0)
        assertTrue(state.available.isEmpty())
        assertFalse(state.open("save"))
        assertEquals("pass", state.selected?.phraseId)
        state.close()
        assertEquals(0, state.positionMs)
        assertNull(state.selected)
    }
    @Test fun allThreeMomentsReuseMobileVocabulary() {
        assertEquals(listOf("pass", "shot", "save"), TvSequence.demo.moments.map { it.phrase.id })
        assertTrue(TvSequence.demo.moments.all { it.endMs < TvSequence.demo.durationMs })
    }
    @Test fun savedCardsCanBeRevisitedWithoutUnlockingFutureMoments() {
        val state = TvLearning()
        assertFalse(state.openSaved("shot", listOf("pass")))
        assertTrue(state.openSaved("pass", listOf("pass")))
        assertEquals("pass", state.selected?.phraseId)
        assertTrue(state.available.isEmpty())
        assertEquals(0, state.positionMs)
    }
    @Test fun albaCardsMatchSourceWindowsAndNeverMixWithTheDemo() {
        val sequence = TvSequence.alba
        assertEquals(listOf("alba-run", "alba-cutback", "coutinho-goal"), sequence.moments.map { it.phraseId })
        assertEquals(listOf(6_000, 9_000, 14_000), sequence.moments.map { it.endMs })
        val state = TvLearning(sequence)
        state.observe(8_999)
        assertFalse(state.open("alba-cutback"))
        assertFalse(state.open("pass"))
        state.observe(9_000)
        assertTrue(state.open("alba-cutback"))
        assertEquals("Alba pasa el balón hacia atrás.", state.selected?.phrase?.spanish)
        assertFalse(state.openSaved("pass", listOf("pass")))
    }
    @Test fun replayRangesStayWithinTheirOwnMediaAndEndAtUnlockTime() {
        for (sequence in listOf(TvSequence.demo, TvSequence.alba)) {
            sequence.moments.forEach {
                assertTrue(it.startMs >= 0)
                assertTrue(it.startMs < it.endMs)
                assertTrue(it.endMs <= sequence.durationMs)
            }
        }
        val cutback = TvSequence.alba.moments.single { it.phraseId == "alba-cutback" }
        assertEquals(4_000, cutback.startMs) // Recording 13:32, including two-second lead-in.
        assertEquals(9_000, cutback.endMs)
    }
    @Test fun recallUsesOnlySavedCardsFromTheCurrentMatch() {
        val sequence = TvSequence.alba
        assertNull(sequence.quiz(listOf("pass")))
        val quiz = sequence.quiz(listOf("alba-cutback"))!!
        assertEquals(1, quiz.total)
        assertEquals("Alba pasa el balón hacia atrás.", quiz.question!!.prompt)
        assertTrue(quiz.answer("Alba passes the ball back."))
        assertTrue(quiz.feedback!!.correct)
    }
}
