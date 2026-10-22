package com.arenavoca.tv

import android.net.Uri
import android.media.MediaPlayer
import android.widget.VideoView
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import androidx.lifecycle.compose.LocalLifecycleOwner
import androidx.tv.material3.Text
import com.arenavoca.tvlearning.TvMoment
import com.arenavoca.tvlearning.TvSequence
import kotlinx.coroutines.delay

/** Separate silent excerpt player. It never receives or commands the main match player. */
@Composable internal fun TvReplayPanel(sequence: TvSequence, moment: TvMoment, entryFocus: FocusRequester, closeLabel: String, onClose: () -> Unit) {
    val context = LocalContext.current
    val lifecycle = LocalLifecycleOwner.current.lifecycle
    val resource = remember(sequence) { context.resources.getIdentifier(sequence.resource, "raw", context.packageName) }
    val view = remember(moment.phraseId) { VideoView(context).apply { isFocusable = false; setAudioFocusRequest(android.media.AudioManager.AUDIOFOCUS_NONE) } }
    var mediaPlayer by remember { mutableStateOf<MediaPlayer?>(null) }
    var ready by remember { mutableStateOf(false) }
    var playing by remember { mutableStateOf(false) }
    var ended by remember { mutableStateOf(false) }
    var failed by remember { mutableStateOf(false) }
    var requested by remember { mutableStateOf(true) }
    val status = if (failed) "Replay unavailable" else if (!ready) "Loading replay…" else if (ended) "Replay finished" else if (playing) "Replay playing · muted" else "Replay paused · muted"
    DisposableEffect(view, lifecycle) {
        view.setOnPreparedListener { media ->
            mediaPlayer = media
            media.setVolume(0f, 0f)
            media.setOnSeekCompleteListener {
                ready = true
                if (requested && lifecycle.currentState.isAtLeast(Lifecycle.State.RESUMED)) { view.start(); playing = true }
            }
            if (moment.startMs > 0) media.seekTo(moment.startMs.toLong(), MediaPlayer.SEEK_CLOSEST)
            else { ready = true; if (requested && lifecycle.currentState.isAtLeast(Lifecycle.State.RESUMED)) { view.start(); playing = true } }
        }
        view.setOnCompletionListener { playing = false; requested = false; ended = true }
        view.setOnErrorListener { _, _, _ -> failed = true; playing = false; ready = false; true }
        view.setVideoURI(Uri.parse("android.resource://${context.packageName}/$resource"))
        val observer = LifecycleEventObserver { _, event ->
            if (event == Lifecycle.Event.ON_PAUSE) { requested = false; view.pause(); playing = false }
        }
        lifecycle.addObserver(observer)
        onDispose { lifecycle.removeObserver(observer); view.stopPlayback(); mediaPlayer = null }
    }
    LaunchedEffect(view) {
        while (true) {
            if (ready && playing && view.currentPosition >= moment.endMs) {
                view.pause(); playing = false; requested = false; ended = true
            }
            delay(50)
        }
    }
    Text("Replay · ${moment.title}", color = Navy, fontSize = 21.sp)
    AndroidView(factory = { view }, modifier = Modifier.fillMaxWidth().aspectRatio(16f / 9f).background(Color.Black).testTag("tv-replay-video"))
    Text(moment.phrase.spanish, color = Navy, fontSize = 21.sp)
    Text(status, color = Navy, fontSize = 14.sp, modifier = Modifier.testTag("tv-replay-status"))
    TvAction(if (failed) "Retry replay" else if (playing) "Pause replay" else if (ended) "Replay again" else "Play replay",
        Modifier.testTag("tv-replay-toggle"), ready || failed) {
        if (failed) { failed = false; ended = false; requested = true; view.setVideoURI(Uri.parse("android.resource://${context.packageName}/$resource")) }
        else if (playing) { requested = false; view.pause(); playing = false }
        else if (ended) {
            requested = true; ended = false; ready = false; mediaPlayer?.seekTo(moment.startMs.toLong(), MediaPlayer.SEEK_CLOSEST)
        } else { requested = true; view.start(); playing = true }
    }
    TvAction(closeLabel, Modifier.focusRequester(entryFocus).testTag("close-tv-replay"), onClick = onClose)
}
