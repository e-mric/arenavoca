package com.arenavoca.stories

/** A short local excerpt; never controls the immersive match player. */
data class MatchReplay(val fileName: String, val startSeconds: Int, val endSeconds: Int) {
    val durationSeconds: Int get() = endSeconds - startSeconds
    val recordingRange: String get() = "${clock(startSeconds)}–${clock(endSeconds)}"
    private fun clock(seconds: Int) = "${seconds / 60}:${(seconds % 60).toString().padStart(2, '0')}"
    companion object {
        fun from(evidence: MatchEvidence): MatchReplay = MatchReplay(
            "match_${evidence.startSeconds}_${evidence.endSeconds}",
            (evidence.startSeconds - 2).coerceAtLeast(0), evidence.endSeconds
        )
    }
}
