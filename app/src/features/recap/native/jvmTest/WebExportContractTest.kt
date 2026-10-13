package com.arenavoca.recap

import kotlin.test.*

class WebExportContractTest {
    @Test fun readsTheSameFixturesThatTheWebExporterProduces() {
        val library = RecapLibrary()
        for ((sport, phrase) in listOf("football" to "pass", "f1" to "overtake")) {
            val raw = javaClass.getResource("/$sport.json")!!.readText()
            val session = library.importRecap(raw).session!!
            assertEquals(sport, session.sport)
            assertEquals(phrase, library.startQuiz(session.id)!!.question!!.phraseId)
            assertEquals(1, library.startQuiz(session.id)!!.total)
        }
        assertEquals(2, library.sessions().size)
    }
}
