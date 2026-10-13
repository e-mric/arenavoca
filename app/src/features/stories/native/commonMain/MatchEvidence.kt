package com.arenavoca.stories

import kotlinx.serialization.Serializable

/** Recording positions are distinct from the scorebug's match clock. */
@Serializable
data class MatchEvidence(
    val sourceId: String,
    val startSeconds: Int,
    val endSeconds: Int,
    val commentarySummary: String,
    val visualObservation: String,
    val frameSeconds: List<Int>,
    val matchClock: String,
    val commentaryStartSeconds: Int,
    val commentaryEndSeconds: Int,
    val reviewStatus: String = "AI checked · Spanish review pending"
) {
    init {
        require(sourceId.isNotBlank())
        require(startSeconds >= 0 && endSeconds > startSeconds)
        require(commentarySummary.isNotBlank() && visualObservation.isNotBlank())
        require(commentaryStartSeconds >= 0 && commentaryEndSeconds > commentaryStartSeconds)
        require(frameSeconds.size >= 2 && frameSeconds.zipWithNext().all { (a, b) -> a < b })
        require(frameSeconds.all { it in startSeconds..endSeconds })
    }
    val recordingRange: String get() = "${time(startSeconds)}–${time(endSeconds)}"
    private fun time(seconds: Int) = "${seconds / 60}:${(seconds % 60).toString().padStart(2, '0')}"
}
