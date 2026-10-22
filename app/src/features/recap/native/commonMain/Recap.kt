package com.arenavoca.recap

import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

@Serializable
data class Phrase(val id: String, val sport: String, val spanish: String, val english: String, val hint: String)

object PracticeCatalog {
    val phrases = listOf(
        Phrase("pass", "football", "El jugador pasa el balón.", "The player passes the ball.", "Pasa describes the action of passing."),
        Phrase("shot", "football", "El jugador dispara.", "The player shoots.", "Dispara describes taking a shot."),
        Phrase("save", "football", "El portero para el balón.", "The goalkeeper saves the ball.", "El portero is the goalkeeper; para means stops here."),
        Phrase("overtake", "f1", "El piloto adelanta.", "The driver overtakes.", "Adelanta describes moving ahead of another driver."),
        Phrase("brake", "f1", "El piloto frena.", "The driver brakes.", "Frena describes slowing down using the brakes."),
        Phrase("pits", "f1", "El piloto entra en boxes.", "The driver enters the pits.", "Entra en boxes means enters the pit area.")
    )
    fun forSport(sport: String) = phrases.filter { it.sport == sport }
}

@Serializable
data class WatchedSession(val id: String, val title: String, val sport: String, val example: Boolean = false, val imported: Boolean = false, val playedOn: String? = null)
@Serializable
data class RecapResult(val sessionId: String, val correct: Int, val total: Int)
@Serializable
private data class SavedProgress(
    val version: Int = 1,
    val sessions: List<WatchedSession> = emptyList(),
    val saved: Map<String, List<String>> = emptyMap(),
    val results: List<RecapResult> = emptyList(),
)

/** Shared rules only. Each platform supplies storage; no video or microphone dependency. */
class RecapLibrary(initialJson: String = "") {
    private val json = Json { ignoreUnknownKeys = true }
    private var progress = SavedProgress()
    var warning: String = ""
        private set
    init {
        if (initialJson.isNotBlank()) {
            try {
                val loaded = json.decodeFromString<SavedProgress>(initialJson)
                require(loaded.version == 1 && loaded.sessions.size <= 100)
                require(loaded.sessions.map { it.id }.distinct().size == loaded.sessions.size)
                require(loaded.sessions.all { it.id.isNotBlank() && it.title.isNotBlank() && it.title.length <= 100 && it.sport in listOf("football", "f1") && (it.playedOn == null || isEventDate(it.playedOn)) })
                require(loaded.saved.all { (id, phrases) ->
                    val session = loaded.sessions.find { it.id == id }
                    session != null && phrases.distinct().size == phrases.size && phrases.all { phrase -> PracticeCatalog.forSport(session.sport).any { it.id == phrase } }
                })
                require(loaded.results.size <= 20 && loaded.results.all { it.total in 1..3 && it.correct in 0..it.total && loaded.sessions.any { session -> session.id == it.sessionId } })
                progress = loaded
            } catch (_: Exception) { warning = "Saved practice could not be read. Your original data has not been overwritten." }
        }
    }
    fun sessions(): List<WatchedSession> = progress.sessions.reversed()
    fun results(): List<RecapResult> = progress.results.toList()
    fun exportProgress(): String = json.encodeToString(progress)
    fun phrases(sport: String): List<Phrase> = PracticeCatalog.forSport(sport)
    fun savedPhraseIds(sessionId: String): List<String> = progress.saved[sessionId]?.toList() ?: emptyList()
    fun importRecap(raw: String): ImportResult {
        val transfer = try { parseRecap(raw) } catch (_: Exception) {
            return ImportResult(null, "This recap could not be imported. Use an ArenaVoca export with supported phrases. Your saved progress is unchanged.")
        }
        val id = "import:${transfer.sport}:${transfer.sourceId}"
        val existing = progress.sessions.find { it.id == id }
        if (existing != null && existing.example != transfer.example) return ImportResult(null, "This recap conflicts with the saved session. Your saved progress is unchanged.")
        if (existing == null && progress.sessions.size >= 100) return ImportResult(null, "Your collection has reached its 100-session limit. No progress was changed.")
        val session = existing ?: WatchedSession(id, transfer.title.trim(), transfer.sport, transfer.example, true, transfer.playedOn)
        val selected = (savedPhraseIds(id) + transfer.phraseIds).distinct()
        progress = progress.copy(
            sessions = if (existing == null) progress.sessions + session else progress.sessions,
            saved = progress.saved + (id to selected),
        )
        return ImportResult(session, "${selected.size} saved phrases ready to practise. Existing progress has been kept.")
    }
    fun createSession(title: String, sport: String, playedOn: String? = null): WatchedSession? {
        if (playedOn != null && !isEventDate(playedOn)) return null
        val clean = title.trim()
        if (clean.isEmpty() || clean.length > 100 || sport !in listOf("football", "f1") || progress.sessions.size >= 100) return null
        val session = WatchedSession("session-${progress.sessions.size + 1}", clean, sport, playedOn = playedOn)
        progress = progress.copy(sessions = progress.sessions + session)
        return session
    }
    fun loadExample(sport: String): WatchedSession? {
        if (sport !in listOf("football", "f1")) return null
        val id = if (sport == "football") "football-example" else "race-example"
        progress.sessions.find { it.id == id }?.let { return it }
        if (progress.sessions.size >= 100) return null
        val session = WatchedSession(id, if (sport == "football") "A night of football" else "Race weekend", sport, true)
        progress = progress.copy(sessions = progress.sessions + session,
            saved = progress.saved + (id to phrases(sport).map { it.id }))
        return session
    }
    fun save(sessionId: String, phraseId: String): Boolean {
        val session = progress.sessions.find { it.id == sessionId } ?: return false
        if (phrases(session.sport).none { it.id == phraseId }) return false
        progress = progress.copy(saved = progress.saved + (sessionId to (savedPhraseIds(sessionId) + phraseId).distinct()))
        return true
    }
    fun remove(sessionId: String, phraseId: String) {
        if (progress.sessions.none { it.id == sessionId }) return
        progress = progress.copy(saved = progress.saved + (sessionId to savedPhraseIds(sessionId).filterNot { it == phraseId }))
    }
    fun startQuiz(sessionId: String): Quiz? {
        val session = progress.sessions.find { it.id == sessionId } ?: return null
        val selected = savedPhraseIds(sessionId).mapNotNull { id -> phrases(session.sport).find { it.id == id } }
        return selected.takeIf { it.isNotEmpty() }?.let { Quiz(sessionId, it, phrases(session.sport)) }
    }
    fun record(quiz: Quiz): Boolean {
        if (!quiz.complete || quiz.recorded || progress.sessions.none { it.id == quiz.sessionId }) return false
        progress = progress.copy(results = (progress.results + RecapResult(quiz.sessionId, quiz.correct, quiz.total)).takeLast(20))
        quiz.recorded = true
        return true
    }
}

data class QuizQuestion(val phraseId: String, val prompt: String, val choices: List<String>) {
    fun visualChoices(): List<VisualChoice> = choices.map { answer ->
        val phrase = PracticeCatalog.phrases.single { it.english == answer }
        VisualChoice(answer, "action_${phrase.id}", phrase.english)
    }
}
data class AnswerFeedback(val correct: Boolean, val answer: String, val explanation: String)

/** A question can be answered once, then explicitly advanced. No timer or playback control. */
class Quiz internal constructor(val sessionId: String, private val targets: List<Phrase>, private val vocabulary: List<Phrase>) {
    var index: Int = 0
        private set
    var correct: Int = 0
        private set
    var feedback: AnswerFeedback? = null
        private set
    internal var recorded = false
    private val missed = mutableListOf<Phrase>()
    val total: Int get() = targets.size
    val complete: Boolean get() = index >= total
    val question: QuizQuestion? get() {
        if (complete) return null
        val phrase = targets[index]
        val options = (listOf(phrase.english) + vocabulary.filterNot { it.id == phrase.id }.map { it.english }.distinct().take(2))
        val rotation = (index + 1) % options.size
        return QuizQuestion(phrase.id, phrase.spanish, options.drop(rotation) + options.take(rotation))
    }
    fun answer(choice: String): Boolean {
        if (complete || feedback != null || question?.choices?.contains(choice) != true) return false
        val phrase = targets[index]
        val right = choice == phrase.english
        if (right) correct++ else missed.add(phrase)
        feedback = AnswerFeedback(right, phrase.english, phrase.hint)
        return true
    }
    fun next(): Boolean {
        if (complete || feedback == null) return false
        index++
        feedback = null
        return true
    }
    fun retryMistakes(): Quiz? = if (complete && missed.isNotEmpty()) Quiz(sessionId, missed.toList(), vocabulary) else null
}
