package com.arenavoca.tvlearning

import com.arenavoca.recap.PracticeCatalog
import com.arenavoca.recap.Phrase
import com.arenavoca.recap.Quiz
import com.arenavoca.stories.MatchCatalog

/** Authored original sequence; times are recording milliseconds, never wall-clock time. */
data class TvMoment(val phrase: Phrase, val endMs: Int, val title: String, val artwork: String, val startMs: Int = 0) {
    val phraseId get() = phrase.id
}

data class TvSequence(
    val id: String, val title: String, val description: String,
    val resource: String, val sourceOffsetSeconds: Int, val durationMs: Int,
    val moments: List<TvMoment>,
) {
    fun quiz(savedIds: List<String>): Quiz? {
        val targets = moments.filter { it.phraseId in savedIds }.map { it.phrase }
        return targets.takeIf { it.isNotEmpty() }?.let { Quiz(id, it, moments.map { moment -> moment.phrase }) }
    }
    companion object {
        val demo = TvSequence("original-football", "Blue vs Amber · Illustrated demo",
            "An original illustrated sequence · 3 learning moments", "tv_football", 0, 36_000,
            listOf("pass", "shot", "save").mapIndexed { i, id ->
                TvMoment(PracticeCatalog.phrases.single { it.id == id }, listOf(8_000, 20_000, 28_000)[i],
                    listOf("The pass", "The shot", "The save")[i], "action_$id", listOf(0, 8_000, 20_000)[i])
            })
        val alba by lazy {
            val cards = MatchCatalog.pack.cards.filter { it.id in listOf("alba-run", "alba-cutback", "coutinho-goal") }
            TvSequence("barca-2018-alba", "Barcelona–Madrid · 2018",
                "Recording 13:28–14:04 · Prepared match analysis", "tv_alba", 808, 36_000,
                cards.map { card ->
                    TvMoment(Phrase(card.id, "football", card.spanish, card.english, card.hint),
                        (card.evidence.endSeconds - 808) * 1000, card.title, card.artwork,
                        ((card.evidence.startSeconds - 2 - 808) * 1000).coerceAtLeast(0))
                })
        }
    }
}

/** Learning cannot issue playback commands. The player supplies its observed position. */
class TvLearning(val sequence: TvSequence = TvSequence.demo) {
    var positionMs = 0
        private set
    var selected: TvMoment? = null
        private set
    var translated = false
        private set
    val available get() = sequence.moments.filter { it.endMs <= positionMs }

    fun observe(position: Int) { positionMs = position.coerceIn(0, sequence.durationMs) }
    fun open(id: String): Boolean {
        val moment = available.find { it.phraseId == id } ?: return false
        selected = moment
        translated = false
        return true
    }
    fun flip() { if (selected != null) translated = !translated }
    fun openSaved(id: String, savedIds: List<String>): Boolean {
        if (id !in savedIds) return false
        selected = sequence.moments.find { it.phraseId == id } ?: return false
        translated = false
        return true
    }
    fun close() { selected = null; translated = false }
}
