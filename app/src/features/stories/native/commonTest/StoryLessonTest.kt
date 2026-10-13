package com.arenavoca.stories

import kotlin.test.*

class StoryLessonTest {
    private fun toRecognition(story: SportStory = StoryCatalog.stories.first()) = StoryLesson(story).apply { repeat(3) { assertTrue(advance()) } }
    private fun toRecall() = toRecognition().apply { checkRecognition(story.recognitionAnswer); advance() }

    @Test fun readingIsOrderedAndAssessmentsCannotBeSkipped() {
        val lesson = StoryLesson(StoryCatalog.stories.first())
        assertFalse(lesson.previousPanel())
        assertFalse(lesson.checkRecognition(lesson.story.recognitionAnswer))
        lesson.advance(); assertEquals(1, lesson.panelIndex)
        lesson.previousPanel(); assertEquals(0, lesson.panelIndex)
        repeat(3) { lesson.advance() }
        assertEquals(StoryStage.RECOGNISE, lesson.stage)
        assertFalse(lesson.advance())
        assertFalse(lesson.checkRecognition("invented answer"))
        assertFalse(lesson.checkRecall("pasa"))
    }

    @Test fun firstAnswerIsFinalAndEachSportHasItsOwnAnswers() {
        for (story in StoryCatalog.stories) {
            val lesson = toRecognition(story)
            assertTrue(lesson.checkRecognition(story.choices.first { it != story.recognitionAnswer }))
            assertFalse(lesson.recognitionCorrect)
            assertFalse(lesson.checkRecognition(story.recognitionAnswer))
            lesson.advance()
            assertFalse(lesson.advance())
            assertTrue(lesson.checkRecall("  ${story.recallAnswer.uppercase()}.  "))
            assertTrue(lesson.recallCorrect)
            assertFalse(lesson.checkRecall("wrong"))
            assertEquals(story.recallAnswer, lesson.story.recallAnswer)
        }
        assertNull(StoryCatalog.forSport("tennis"))
        assertEquals("boxes", StoryCatalog.forSport("f1")?.recallAnswer)
    }

    @Test fun hintsAreDistinguishedFromUnassistedRecall() {
        val lesson = toRecall()
        assertFalse(lesson.checkRecall("   "))
        assertFalse(lesson.checkRecall("a".repeat(81)))
        lesson.showHint(); lesson.checkRecall("pasa")
        assertEquals("Recall · remembered with a hint", lesson.recallSummary)
        assertFalse(lesson.showHint())
        val unassisted = toRecall().apply { checkRecall("pasa") }
        assertEquals("Recall · remembered without a hint", unassisted.recallSummary)
        val missed = toRecall().apply { checkRecall("dispara") }
        assertEquals("Recall · reviewed the missing word", missed.recallSummary)
    }

    @Test fun personalAnswerRequiresResponseAndReflectionButIsNeverAutoScored() {
        val lesson = toRecall().apply { checkRecall("pasa"); advance() }
        assertFalse(lesson.advance())
        assertFalse(lesson.reflect(false))
        assertFalse(lesson.revealModel("  "))
        assertFalse(lesson.revealModel("x".repeat(281)))
        assertTrue(lesson.revealModel("Necesitamos descansar."))
        assertEquals("Necesitamos descansar.", lesson.response)
        assertFalse(lesson.revealModel("Replace my first response"))
        assertFalse(lesson.advance())
        lesson.reflect(true); assertTrue(lesson.advance())
        assertEquals(StoryStage.SUMMARY, lesson.stage)
        assertFalse(lesson.advance())
        assertFalse(lesson.reflect(false))
        assertEquals("Practise this again", lesson.reflection)
        val fresh = StoryLesson(lesson.story)
        assertFalse(fresh.hintUsed); assertFalse(fresh.recognitionChecked)
        assertEquals("", fresh.response)
    }
}
