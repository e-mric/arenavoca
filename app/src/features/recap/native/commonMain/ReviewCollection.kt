package com.arenavoca.recap

import com.arenavoca.stories.MatchCatalog

/** ISO event dates sort independently of when a session was added or imported. */
fun isEventDate(value: String): Boolean {
    if (!Regex("[0-9]{4}-[0-9]{2}-[0-9]{2}").matches(value)) return false
    val year = value.take(4).toInt()
    val month = value.substring(5, 7).toInt()
    val day = value.takeLast(2).toInt()
    if (year !in 1900..9999 || month !in 1..12) return false
    val leap = year % 4 == 0 && (year % 100 != 0 || year % 400 == 0)
    val days = listOf(31, if (leap) 29 else 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31)
    return day in 1..days[month - 1]
}

fun eventDateLabel(value: String?): String {
    if (value == null || !isEventDate(value)) return "Date not set"
    val months = listOf("January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December")
    return "${value.takeLast(2).toInt()} ${months[value.substring(5, 7).toInt() - 1]} ${value.take(4)}"
}

data class ReviewEvent(val id: String, val title: String, val sport: String, val playedOn: String?,
    val cardCount: Int, val storyCount: Int, val session: WatchedSession? = null, val sourceUrl: String? = null, val isLive: Boolean = false) {
    val summary get() = "$cardCount ${if (cardCount == 1) "card" else "cards"}" +
        if (storyCount > 0) " · $storyCount ${if (storyCount == 1) "story" else "stories"}" else ""
    val action get() = if (sport == "f1") "Repasemos la carrera" else "Repasemos el partido"
}

/** Only real source packs or user sessions belong in event history. Undated sessions sort last. */
fun reviewEvents(library: RecapLibrary, sport: String, liveEvents: List<ReviewEvent> = emptyList()): List<ReviewEvent> {
    val pack = MatchCatalog.pack
    val prepared = if (sport == "football") listOf(ReviewEvent(pack.source.id, pack.source.title, "football",
        pack.source.playedOn, pack.cards.size, pack.stories.size)) else if (sport == "f1") listOf(ReviewEvent("singapore-2026", "Marina Bay", "f1", "2026-10-11",
        0, 0, sourceUrl = "https://www.youtube.com/watch?v=ohgEehLtucc")) else emptyList()
    val sessions = library.sessions().filter { it.sport == sport && !it.example }.map {
        ReviewEvent(it.id, it.title, it.sport, it.playedOn, library.savedPhraseIds(it.id).size, 0, it)
    }
    val live = liveEvents.filter { it.sport == sport && it.isLive }
    return (live + prepared + sessions).distinctBy { it.id }
        .sortedWith(compareByDescending<ReviewEvent> { it.isLive }.thenByDescending { it.playedOn ?: "" })
}
