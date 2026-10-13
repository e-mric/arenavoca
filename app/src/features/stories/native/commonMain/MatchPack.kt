package com.arenavoca.stories

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

@Serializable
data class MatchSource(val id: String, val title: String, val youtubeUrl: String, val durationSeconds: Int, val sha256: String)

@Serializable
data class MatchAnalysis(val speechModel: String, val language: String, val analyzedStartSeconds: Int, val analyzedEndSeconds: Int, val method: String, val limitations: List<String>)

@Serializable
data class MatchCard(val id: String, val title: String, val spanish: String, val english: String, val hint: String, val artwork: String, val evidence: MatchEvidence)

@Serializable
data class MatchStory(
    val id: String, val title: String, val cardIds: List<String>, val targets: List<String>,
    val sceneSpanish: List<String>, val sceneEnglish: List<String>,
    val recognitionPrompt: String, val recognitionHelp: String, val choices: List<String>,
    val recognitionAnswer: String, val recognitionExplanation: String,
    val recallPrompt: String, val recallAnswer: String, val recallHint: String,
    val usePrompt: String, val useHelp: String, val modelAnswer: String, val transfer: String
)

@Serializable
data class MatchPack(val version: Int, val source: MatchSource, val analysis: MatchAnalysis, val cards: List<MatchCard>, val stories: List<MatchStory>) {
    fun validate(): MatchPack {
        require(version == 1 && source.id.isNotBlank() && source.title.isNotBlank())
        require(source.sha256.matches(Regex("[a-f0-9]{64}")))
        require(source.durationSeconds > 0 && cards.size in 1..30 && stories.size in 1..10)
        require(analysis.language.isNotBlank() && analysis.speechModel.isNotBlank())
        require(analysis.analyzedStartSeconds >= 0 && analysis.analyzedEndSeconds <= source.durationSeconds)
        require(analysis.analyzedStartSeconds < analysis.analyzedEndSeconds)
        require(cards.map { it.id }.toSet().size == cards.size && stories.map { it.id }.toSet().size == stories.size)
        for (card in cards) {
            val evidence = card.evidence
            require(card.id.isNotBlank() && card.spanish.isNotBlank() && card.english.isNotBlank())
            require(evidence.sourceId == source.id)
            require(evidence.startSeconds >= analysis.analyzedStartSeconds && evidence.endSeconds <= analysis.analyzedEndSeconds)
            require(evidence.commentaryStartSeconds >= analysis.analyzedStartSeconds && evidence.commentaryEndSeconds <= analysis.analyzedEndSeconds)
            require(evidence.reviewStatus == "AI checked · Spanish review pending")
        }
        for (story in stories) {
            require(story.cardIds.size == 3 && story.cardIds.toSet().size == 3)
            require(story.cardIds.all { id -> cards.any { it.id == id } })
            require(story.sceneSpanish.size == 3 && story.sceneEnglish.size == 3)
            require(story.sceneSpanish.all { it.isNotBlank() } && story.sceneEnglish.all { it.isNotBlank() })
            require(story.choices.size >= 2 && story.choices.toSet().size == story.choices.size)
            require(story.recognitionAnswer in story.choices && story.recallAnswer.isNotBlank())
            require(story.recallPrompt.contains("___") && story.usePrompt.isNotBlank())
            val selected = story.cardIds.map { id -> cards.single { it.id == id } }
            require(selected.zipWithNext().all { (a, b) -> a.evidence.startSeconds <= b.evidence.startSeconds })
        }
        return this
    }

    fun lesson(storyId: String): SportStory? {
        val story = stories.find { it.id == storyId } ?: return null
        val panels = story.cardIds.mapIndexed { index, id ->
            val card = cards.single { it.id == id }
            StoryPanel(card.title, story.sceneSpanish[index], story.sceneEnglish[index], card.artwork, card.evidence)
        }
        return SportStory(story.id, "football", story.title, story.targets, panels,
            story.recognitionPrompt, story.recognitionHelp, story.choices, story.recognitionAnswer, story.recognitionExplanation,
            story.recallPrompt, story.recallAnswer, story.recallHint, story.usePrompt, story.useHelp,
            story.modelAnswer, story.transfer, source.title)
    }

    /** No automatic viewing-history assumption: reveal requires a deliberate choice. */
    fun cardsAt(recordingSeconds: Int) = cards.filter { it.evidence.endSeconds <= recordingSeconds }

    companion object {
        fun decode(raw: String): MatchPack = Json.decodeFromString<MatchPack>(raw).validate()
    }
}

object MatchCatalog { val pack: MatchPack by lazy { MatchPack.decode(matchPackJson) } }
