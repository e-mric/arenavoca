package com.arenavoca.stories

/** Prepared illustrations reuse source-backed phrases; never generated during playback. */
object AlbaComic {
    private val ids = listOf("alba-run", "alba-cutback", "coutinho-goal")
    val cards get() = ids.map { id -> MatchCatalog.pack.cards.single { it.id == id } }
    fun artwork(cardId: String): String? = when (cardId) {
        "alba-run" -> "comic_alba_run"
        "alba-cutback" -> "comic_alba_cutback"
        "coutinho-goal" -> "comic_alba_goal"
        else -> null
    }
    fun available(recordingSeconds: Int) = cards.filter { it.evidence.endSeconds <= recordingSeconds }
}
