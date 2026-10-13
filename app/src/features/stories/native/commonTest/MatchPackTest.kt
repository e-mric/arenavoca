package com.arenavoca.stories

import kotlin.test.*

class MatchPackTest {
    @Test fun actualMatchContentHasEvidenceAndUsesExistingLearningLoop() {
        val pack = MatchCatalog.pack
        assertEquals(6, pack.cards.size)
        assertEquals(2, pack.stories.size)
        assertEquals("barca-2018-full", pack.source.id)
        assertEquals("en", pack.analysis.language)
        for (story in pack.stories) {
            val lesson = StoryLesson(pack.lesson(story.id)!!)
            assertEquals(pack.source.title, lesson.story.sourceTitle)
            assertEquals("From the recording · AI checked", lesson.story.provenanceLabel)
            assertTrue(lesson.story.panels.all { it.evidence != null })
            repeat(3) { lesson.advance() }
            assertTrue(lesson.checkRecognition(lesson.story.recognitionAnswer))
            lesson.advance(); lesson.checkRecall(lesson.story.recallAnswer); lesson.advance()
            lesson.revealModel("Me gusta el fútbol."); lesson.reflect(false); lesson.advance()
            assertEquals(StoryStage.SUMMARY, lesson.stage)
            assertTrue(lesson.recognitionCorrect && lesson.recallCorrect)
        }
        assertNull(pack.lesson("unknown"))
        assertTrue(StoryCatalog.stories.all { it.sourceTitle == null && it.panels.all { panel -> panel.evidence == null } })
    }

    @Test fun recordingPositionSuppressesFutureEventsAndKeepsBoundaryInclusive() {
        val pack = MatchCatalog.pack
        assertTrue(pack.cardsAt(639).isEmpty())
        assertEquals(listOf("bale-run"), pack.cardsAt(646).map { it.id })
        assertFalse(pack.cardsAt(821).any { it.id == "coutinho-goal" })
        assertEquals(6, pack.cardsAt(822).size)
        assertEquals("13:34–13:37", pack.cards.single { it.id == "alba-cutback" }.evidence.recordingRange)
    }

    @Test fun malformedOrUngroundedContentIsRejected() {
        val pack = MatchCatalog.pack
        assertFails { pack.copy(version = 2).validate() }
        assertFails { pack.copy(cards = pack.cards + pack.cards.first()).validate() }
        assertFails { pack.copy(source = pack.source.copy(id = "other-match")).validate() }
        assertFails { pack.copy(analysis = pack.analysis.copy(analyzedEndSeconds = 700)).validate() }
        assertFails { pack.copy(stories = listOf(pack.stories.first().copy(cardIds = listOf("missing", "bale-cross", "benzema-volley")))).validate() }
        assertFails { pack.copy(stories = listOf(pack.stories.first().copy(cardIds = pack.stories.first().cardIds.reversed()))).validate() }
        assertFails { pack.cards.first().evidence.copy(commentarySummary = "") }
        assertFails { pack.cards.first().evidence.copy(visualObservation = "") }
        assertFails { pack.cards.first().evidence.copy(frameSeconds = listOf(630, 644)) }
        assertFails { pack.cards.first().evidence.copy(frameSeconds = listOf(644, 642)) }
        assertFails { MatchPack.decode("{\"version\":1}") }
    }

    @Test fun commentaryAnalysisCanFollowActionWithoutMovingEventTimes() {
        val evidence = MatchCatalog.pack.cards.single { it.id == "alba-cutback" }.evidence
        assertTrue(evidence.commentaryEndSeconds > evidence.endSeconds)
        assertEquals(814, evidence.startSeconds)
        assertEquals(817, evidence.endSeconds)
        assertEquals("AI checked · Spanish review pending", evidence.reviewStatus)
    }
}
