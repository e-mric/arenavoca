package com.arenavoca.recap

import kotlin.test.*

class VisualPracticeTest {
    @Test fun illustrationsFollowTheActualAnswerOrderInBothSports() {
        for (sport in listOf("football", "f1")) {
            val library = RecapLibrary()
            val session = library.loadExample(sport)!!
            val quiz = library.startQuiz(session.id)!!
            while (!quiz.complete) {
                val question = quiz.question!!
                val visual = question.visualChoices()
                assertEquals(question.choices, visual.map { it.answer })
                assertEquals(3, visual.map { it.artwork }.distinct().size)
                visual.forEach { choice ->
                    val phrase = library.phrases(sport).single { "action_${it.id}" == choice.artwork }
                    assertEquals(phrase.english, choice.answer)
                    assertEquals(phrase.english, choice.imageDescription)
                }
                val right = visual.single { it.artwork == "action_${question.phraseId}" }
                assertTrue(quiz.answer(right.answer))
                assertEquals(true, quiz.feedback?.correct)
                quiz.next()
            }
            assertEquals(3, quiz.correct)
        }
    }
}
