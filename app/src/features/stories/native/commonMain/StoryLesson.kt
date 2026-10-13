package com.arenavoca.stories

enum class StoryStage { READ, RECOGNISE, RECALL, USE, SUMMARY }

/** A single optional attempt. Reading never counts as an answer or a learned phrase. */
class StoryLesson(val story: SportStory) {
    var stage = StoryStage.READ; private set
    var panelIndex = 0; private set
    var recognitionChecked = false; private set
    var recognitionCorrect = false; private set
    var recognitionSelection = ""; private set
    var recallChecked = false; private set
    var recallCorrect = false; private set
    var recallResponse = ""; private set
    var hintUsed = false; private set
    var response = ""; private set
    var modelRevealed = false; private set
    var reflection = ""; private set
    val panel: StoryPanel get() = story.panels[panelIndex]
    val canContinue: Boolean get() = when (stage) {
        StoryStage.READ -> true
        StoryStage.RECOGNISE -> recognitionChecked
        StoryStage.RECALL -> recallChecked
        StoryStage.USE -> modelRevealed && reflection.isNotEmpty()
        StoryStage.SUMMARY -> false
    }

    fun previousPanel(): Boolean {
        if (stage != StoryStage.READ || panelIndex == 0) return false
        panelIndex--; return true
    }

    fun advance(): Boolean {
        if (!canContinue) return false
        when (stage) {
            StoryStage.READ -> if (panelIndex < story.panels.lastIndex) panelIndex++ else stage = StoryStage.RECOGNISE
            StoryStage.RECOGNISE -> stage = StoryStage.RECALL
            StoryStage.RECALL -> stage = StoryStage.USE
            StoryStage.USE -> stage = StoryStage.SUMMARY
            StoryStage.SUMMARY -> return false
        }
        return true
    }

    fun checkRecognition(choice: String): Boolean {
        if (stage != StoryStage.RECOGNISE || recognitionChecked || choice !in story.choices) return false
        recognitionSelection = choice
        recognitionCorrect = choice == story.recognitionAnswer
        recognitionChecked = true
        return true
    }

    fun showHint(): Boolean {
        if (stage != StoryStage.RECALL || recallChecked) return false
        hintUsed = true; return true
    }

    fun checkRecall(answer: String): Boolean {
        if (stage != StoryStage.RECALL || recallChecked || answer.isBlank() || answer.length > 80) return false
        recallResponse = answer.trim()
        recallCorrect = answer.trim().lowercase().trimEnd('.', '!', '?') == story.recallAnswer
        recallChecked = true
        return true
    }

    fun revealModel(answer: String): Boolean {
        if (stage != StoryStage.USE || modelRevealed || answer.isBlank() || answer.length > 280) return false
        response = answer.trim(); modelRevealed = true; return true
    }

    fun reflect(needsPractice: Boolean): Boolean {
        if (stage != StoryStage.USE || !modelRevealed) return false
        reflection = if (needsPractice) "Practise this again" else "Ready to try elsewhere"
        return true
    }

    val recognitionSummary: String get() = if (recognitionCorrect) "Recognise · understood the story" else "Recognise · reviewed the explanation"
    val recallSummary: String get() = when {
        !recallCorrect -> "Recall · reviewed the missing word"
        hintUsed -> "Recall · remembered with a hint"
        else -> "Recall · remembered without a hint"
    }
}
