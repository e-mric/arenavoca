package com.arenavoca.recap

import kotlin.test.*

class RecapTransferTest {
    private val football = """{"kind":"arenavoca-recap","version":1,"sourceId":"match-1","title":"Match one","sport":"football","phraseIds":["pass"],"example":false}"""
    @Test fun importedRecapCreatesOnlySavedQuestionsAndSurvivesRestart() {
        val library = RecapLibrary()
        val session = library.importRecap(football).session!!
        assertTrue(session.imported); assertFalse(session.example)
        assertEquals(listOf("pass"), library.savedPhraseIds(session.id))
        assertEquals(1, library.startQuiz(session.id)!!.total)
        val restored = RecapLibrary(library.exportProgress())
        assertEquals(session, restored.sessions().single())
        assertEquals("pass", restored.startQuiz(session.id)!!.question!!.phraseId)
    }
    @Test fun repeatedImportsMergeWithoutLosingLocalSavesOrScores() {
        val library = RecapLibrary()
        val session = library.importRecap(football).session!!
        val quiz = library.startQuiz(session.id)!!
        quiz.answer("The player passes the ball."); quiz.next(); library.record(quiz)
        library.save(session.id, "save")
        library.importRecap(football.replace("[\"pass\"]", "[\"pass\",\"shot\"]"))
        library.importRecap(football)
        assertEquals(1, library.sessions().size)
        assertEquals(listOf("pass", "save", "shot"), library.savedPhraseIds(session.id))
        assertEquals(1, library.results().size)
    }
    @Test fun rejectsMalformedOversizedUnsupportedAndMixedSportImportsAtomically() {
        val library = RecapLibrary().apply { loadExample("football") }
        val before = library.exportProgress()
        val invalid = listOf("broken", " ".repeat(32_769), football.replace(":1,", ":99,"),
            football.replace("arenavoca-recap", "other"), football.replace("pass", "overtake"),
            football.replace("[\"pass\"]", "[]"), football.replace("[\"pass\"]", "[\"pass\",\"pass\"]"),
            football.replace("match-1", "../../file"), football.replace("Match one", "x".repeat(101)),
            football.replace("football", "tennis"))
        invalid.forEach { raw ->
            assertNull(library.importRecap(raw).session)
            assertEquals(before, library.exportProgress())
        }
    }
    @Test fun sportsAndSampleIdentityStaySeparate() {
        val library = RecapLibrary()
        val match = library.importRecap(football).session!!
        val race = library.importRecap(football.replace("football", "f1").replace("pass", "overtake")).session!!
        assertNotEquals(match.id, race.id)
        assertEquals("overtake", library.startQuiz(race.id)!!.question!!.phraseId)
        assertNull(library.importRecap(football.replace("false", "true")).session)
        val sample = library.importRecap(football.replace("match-1", "sample-1").replace("false", "true")).session!!
        assertTrue(sample.example)
    }
    @Test fun fullLibraryRejectsNewImportsButCanMergeExistingOnes() {
        val library = RecapLibrary()
        val imported = library.importRecap(football).session!!
        repeat(99) { library.createSession("Match $it", "football") }
        assertNull(library.importRecap(football.replace("match-1", "match-2")).session)
        assertEquals(imported, library.importRecap(football).session)
        assertEquals(100, library.sessions().size)
    }
}
