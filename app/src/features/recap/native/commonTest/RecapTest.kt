package com.arenavoca.recap

import kotlin.test.*

class RecapTest {
    private fun library() = RecapLibrary().apply { loadExample("football"); loadExample("f1") }
    @Test fun savingIsIdempotentAndScopedToTheWatchedSession() {
        val library = RecapLibrary()
        val session = library.createSession("Clásico", "football")!!
        library.save(session.id, "pass"); library.save(session.id, "pass")
        assertEquals(listOf("pass"), library.savedPhraseIds(session.id))
        assertEquals(emptyList(), library.savedPhraseIds("race-example"))
    }
    @Test fun emptyLibraryDoesNotInventWatchedGamesOrQuestions() {
        val library = RecapLibrary()
        assertTrue(library.sessions().isEmpty())
        val session = library.createSession("My match", "football")!!
        assertNull(library.startQuiz(session.id))
        assertNull(library.startQuiz("unknown"))
    }
    @Test fun unsupportedSportBlankTitleAndCrossSportSavesAreRejected() {
        val library = library()
        assertNull(library.createSession("  ", "football"))
        assertNull(library.createSession("Match", "tennis"))
        assertFalse(library.save("football-example", "overtake"))
        assertFalse(library.save("unknown", "pass"))
        assertFalse(library.save("football-example", "unknown"))
    }
    @Test fun exampleSessionsAreClearlyLabelledAndIdempotent() {
        val library = library()
        assertTrue(library.loadExample("football")!!.example)
        assertEquals(2, library.sessions().size)
    }
    @Test fun quizOnlyAsksSavedPhrasesInTheSelectedSession() {
        val library = library()
        library.remove("football-example", "shot"); library.remove("football-example", "save")
        val quiz = library.startQuiz("football-example")!!
        assertEquals(1, quiz.total)
        assertEquals("pass", quiz.question!!.phraseId)
        assertEquals(3, quiz.question!!.choices.distinct().size)
        assertFalse(quiz.question!!.choices.any { it.contains("driver") })
    }
    @Test fun answerIsNotRevealedUntilAValidChoiceAndCannotBeScoredTwice() {
        val quiz = library().startQuiz("football-example")!!
        assertNull(quiz.feedback)
        assertFalse(quiz.next())
        assertFalse(quiz.answer("nonsense"))
        assertNull(quiz.feedback)
        assertTrue(quiz.answer("The player passes the ball."))
        assertTrue(quiz.feedback!!.correct)
        assertFalse(quiz.answer("The player passes the ball."))
        assertEquals(1, quiz.correct)
    }
    @Test fun completedAttemptRecordsOnceAndRetryContainsOnlyMistakes() {
        val library = library()
        val quiz = library.startQuiz("football-example")!!
        assertFalse(library.record(quiz))
        val wrong = quiz.question!!.choices.first { it != "The player passes the ball." }
        quiz.answer(wrong); quiz.next()
        quiz.answer("The player shoots."); quiz.next()
        quiz.answer("The goalkeeper saves the ball."); quiz.next()
        assertTrue(quiz.complete)
        assertNull(quiz.question)
        assertEquals(2, quiz.correct)
        assertTrue(library.record(quiz)); assertFalse(library.record(quiz))
        val retry = quiz.retryMistakes()!!
        assertEquals(1, retry.total)
        assertEquals("pass", retry.question!!.phraseId)
        retry.answer("The player passes the ball."); retry.next()
        assertNull(retry.retryMistakes())
        assertFalse(quiz.next())
    }
    @Test fun progressRoundTripsAcrossPlatformsAndKeepsSportsSeparate() {
        val original = library()
        original.remove("football-example", "shot")
        val restored = RecapLibrary(original.exportProgress())
        assertEquals(original.sessions(), restored.sessions())
        assertEquals(listOf("pass", "save"), restored.savedPhraseIds("football-example"))
        assertEquals(3, restored.savedPhraseIds("race-example").size)
        assertTrue(restored.warning.isEmpty())
    }
    @Test fun damagedAndFutureProgressFailSafely() {
        for (raw in listOf("broken", "{\"version\":99}", "{\"saved\":{\"unknown\":[\"pass\"]}}")) {
            val library = RecapLibrary(raw)
            assertTrue(library.sessions().isEmpty())
            assertTrue(library.warning.isNotEmpty())
        }
    }
    @Test fun removingLastPhraseProducesNoQuizAndAnExistingQuizStaysPinned() {
        val library = library()
        val quiz = library.startQuiz("football-example")!!
        library.savedPhraseIds("football-example").forEach { library.remove("football-example", it) }
        assertNull(library.startQuiz("football-example"))
        assertEquals(3, quiz.total)
    }
}
