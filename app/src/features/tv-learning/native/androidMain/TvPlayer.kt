package com.arenavoca.tv

import android.content.Context
import android.net.Uri
import android.widget.VideoView
import androidx.compose.runtime.*
import com.arenavoca.tvlearning.TvSequence

/** Sole playback authority. Cards never receive this adapter. */
internal class TvPlayer(context: Context, private val sequence: TvSequence, initialPosition: Int = 0) {
    val view = VideoView(context).apply { isFocusable = false; isFocusableInTouchMode = false }
    var ready by mutableStateOf(false)
        private set
    var playing by mutableStateOf(false)
        private set
    var ended by mutableStateOf(false)
        private set
    var failed by mutableStateOf(false)
        private set
    private val resumePosition = initialPosition.coerceIn(0, sequence.durationMs)
    private val resource = context.resources.getIdentifier(sequence.resource, "raw", context.packageName)
    private val uri = Uri.parse("android.resource://${context.packageName}/$resource")
    init {
        view.setOnPreparedListener { media ->
            if (resumePosition > 0) {
                ended = resumePosition >= sequence.durationMs
                media.setOnSeekCompleteListener { ready = true }
                view.seekTo(resumePosition.coerceAtMost((sequence.durationMs - 100).coerceAtLeast(0)))
            } else ready = true
        }
        view.setOnCompletionListener { playing = false; ended = true }
        view.setOnErrorListener { _, _, _ -> failed = true; playing = false; ready = false; true }
        view.setVideoURI(uri)
    }
    val position get() = if (ended) sequence.durationMs else if (ready) view.currentPosition else resumePosition
    fun play() { if (ready && !ended) { view.start(); playing = true } }
    fun pause() { if (ready) view.pause(); playing = false }
    fun toggle() { if (playing) pause() else play() }
    fun restart() { if (ready) { ended = false; view.seekTo(0); view.start(); playing = true } }
    fun retry() { failed = false; ended = false; view.setVideoURI(uri) }
    fun release() { view.stopPlayback() }
}
