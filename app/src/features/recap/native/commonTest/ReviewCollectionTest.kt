package com.arenavoca.recap

import kotlin.test.*

class ReviewCollectionTest {
    @Test fun eventsSortByGameDateAndKeepUnknownDatesLast() {
        val library = RecapLibrary()
        library.createSession("Older match", "football", "2017-03-04")
        library.createSession("Newest match", "football", "2026-10-01")
        library.createSession("Undated match", "football")
        library.createSession("Test circuit", "f1", "2026-10-02")
        library.loadExample("football")
        val entries = reviewEvents(library, "football")
        assertEquals(listOf("Newest match", "Barcelona vs Madrid", "Older match", "Undated match"), entries.map { it.title })
        assertEquals("6 cards · 2 stories", entries[1].summary)
        assertEquals("Repasemos el partido", entries[1].action)
        assertEquals("28 October 2018", eventDateLabel(entries[1].playedOn))
        assertEquals("Date not set", eventDateLabel(entries.last().playedOn))
        assertEquals(listOf("Marina Bay", "Test circuit"), reviewEvents(library, "f1").map { it.title })
        assertEquals("Repasemos la carrera", reviewEvents(library, "f1").first().action)
    }
    @Test fun generalPracticeDoesNotInventARaceAndCountsFollowSavedCards() {
        val library = RecapLibrary().apply { loadExample("f1") }
        assertEquals(listOf("Marina Bay"), reviewEvents(library, "f1").map { it.title })
        assertEquals(0, reviewEvents(library, "f1").first().cardCount)
        assertNotNull(reviewEvents(library, "f1").first().sourceUrl)
        val race = library.createSession("Circuit test fixture", "f1", "2024-02-29")!!
        library.save(race.id, "pits")
        assertEquals("1 card", reviewEvents(library, "f1").last().summary)
        val restored = RecapLibrary(library.exportProgress())
        assertEquals("2024-02-29", restored.sessions().first().playedOn)
        assertEquals("1 card", reviewEvents(restored, "f1").last().summary)
    }
    @Test fun liveEventsLeadHistoryButOldRecordingsNeverBecomeLive() {
        val library = RecapLibrary()
        library.createSession("Later dated session", "football", "2026-10-21")
        val live = ReviewEvent("live-fixture", "Live match fixture", "football", "2026-10-20", 2, 0, isLive = true)
        val race = live.copy(id = "race-fixture", sport = "f1")
        val entries = reviewEvents(library, "football", listOf(live, race))
        assertEquals(live, entries.first())
        assertEquals(1, entries.count { it.isLive })
        assertFalse(reviewEvents(library, "football").any { it.isLive })
        assertEquals(2, entries.first().cardCount)
    }
    @Test fun legacySessionsStayReadableAndInvalidDatesCannotEnterHistory() {
        val library = RecapLibrary("""{"version":1,"sessions":[{"id":"old","title":"Imported race","sport":"f1"}]}""")
        assertEquals(1, library.sessions().size)
        assertNull(library.sessions().single().playedOn)
        for (date in listOf("2023-02-29", "2024-04-31", "2024-00-01", "not-a-date")) {
            assertNull(library.createSession("Bad date", "football", date))
        }
        assertTrue(isEventDate("2000-02-29"))
        assertFalse(isEventDate("1900-02-29"))
    }
}
