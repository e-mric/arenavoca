package com.arenavoca.mobile

import android.net.Uri
import android.widget.VideoView
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.Alignment
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.viewinterop.AndroidView
import androidx.compose.ui.unit.dp
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import androidx.lifecycle.compose.LocalLifecycleOwner
import com.arenavoca.stories.MatchEvidence
import com.arenavoca.stories.MatchReplay

/** Only the selected card owns a player. Disposing it releases video and audio. */
@Composable internal fun MatchReplayView(evidence: MatchEvidence, artwork: String, active: Boolean, compact: Boolean = false, onActive: (Boolean) -> Unit) {
    val replay = remember(evidence) { MatchReplay.from(evidence) }
    val context = LocalContext.current
    val resource = remember(replay) { context.resources.getIdentifier(replay.fileName, "raw", context.packageName) }
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        if (!active || resource == 0) {
            Box {
                SportArtwork(artwork)
                if (compact && resource != 0) OutlinedButton(onClick = { onActive(true) }, modifier = Modifier.align(Alignment.BottomEnd).padding(8.dp).testTag("watch-${replay.fileName}"),
                    colors = ButtonDefaults.outlinedButtonColors(containerColor = PlaymakerCream)) { Text("Replay") }
            }
        } else {
            key(replay.fileName) { LocalReplayPlayer(resource, replay.fileName) }
        }
        if (!compact || active) Text("Actual match · ${replay.durationSeconds}s · Recording ${replay.recordingRange}", style = MaterialTheme.typography.labelMedium)
        if (resource == 0) {
            Text("Replay isn't included in this build. You can still learn with the illustration.", style = MaterialTheme.typography.bodySmall)
        } else if (!compact || active) {
            TextButton(onClick = { onActive(!active) }, modifier = Modifier.testTag("watch-${replay.fileName}")) {
                Text(if (active) "Show illustration" else "Watch match moment")
            }
        }
    }
}

@Composable internal fun LocalReplayPlayer(resource: Int, fileName: String, stadium: Boolean = false, trailingControl: (@Composable RowScope.() -> Unit)? = null) {
    val context = LocalContext.current
    val lifecycle = LocalLifecycleOwner.current.lifecycle
    var status by remember { mutableStateOf("Loading replay…") }
    var ready by remember { mutableStateOf(false) }
    var frameVisible by remember { mutableStateOf(false) }
    var playing by remember { mutableStateOf(false) }
    var playRequested by remember { mutableStateOf(true) }
    var ended by remember { mutableStateOf(false) }
    var failed by remember { mutableStateOf(false) }
    val view = remember { VideoView(context) }
    var progress by remember { mutableFloatStateOf(0f) }
    LaunchedEffect(view) {
        while (true) {
            if (ready && view.duration > 0) progress = (view.currentPosition.toFloat() / view.duration).coerceIn(0f, 1f)
            kotlinx.coroutines.delay(100)
        }
    }
    DisposableEffect(view, lifecycle) {
        view.setOnPreparedListener {
            ready = true; playing = playRequested && lifecycle.currentState.isAtLeast(Lifecycle.State.RESUMED)
            status = if (playing) "Loading replay…" else "Replay paused"
            if (playing) view.start()
        }
        view.setOnInfoListener { _, what, _ ->
            if (what == android.media.MediaPlayer.MEDIA_INFO_VIDEO_RENDERING_START) {
                frameVisible = true
                if (playing) status = "Playing match moment"
            }
            false
        }
        view.setOnCompletionListener { playRequested = false; playing = false; ended = true; status = "Replay finished" }
        view.setOnErrorListener { _, _, _ ->
            ready = false; failed = true; playing = false; status = "Replay couldn't play. Try again."
            true
        }
        view.setVideoURI(Uri.parse("android.resource://${context.packageName}/$resource"))
        val observer = LifecycleEventObserver { _, event ->
            if (event == Lifecycle.Event.ON_PAUSE) {
                playRequested = false
                if (playing) view.pause()
                playing = false; status = if (ended) "Replay finished" else "Replay paused"
            }
        }
        lifecycle.addObserver(observer)
        onDispose { lifecycle.removeObserver(observer); view.stopPlayback() }
    }
    Box(Modifier.fillMaxWidth().aspectRatio(16f / 9f).background(Color.Black).testTag("replay-video-$fileName"),
        contentAlignment = Alignment.Center) {
        AndroidView(factory = { view }, modifier = Modifier.matchParentSize())
        if (!frameVisible && !failed) {
            Text("Loading replay…", color = Color.White, modifier = Modifier.background(PlaymakerInk).padding(12.dp))
        }
    }
    if (stadium) LinearProgressIndicator(progress = { if (ended) 1f else progress }, modifier = Modifier.fillMaxWidth(), color = PlaymakerBlue, trackColor = Color(0xFFDAD5FF))
    Text(status, style = MaterialTheme.typography.bodySmall, color = if (stadium) Color.White else MaterialTheme.colorScheme.onSurface, modifier = Modifier.testTag("replay-status"))
    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        Button(onClick = {
            if (playing) { playRequested = false; view.pause(); playing = false; status = "Replay paused" }
            else { playRequested = true; if (ended) { view.seekTo(0); ended = false }; view.start(); playing = true; status = "Playing match moment" }
        }, enabled = ready) { Text(if (stadium) { if (playing) "Pausar" else if (ended) "Repetir" else "Continuar" }
            else if (playing) "Pause replay" else if (ended) "Replay again" else "Play replay") }
        if (failed) TextButton(onClick = {
            failed = false; frameVisible = false; playRequested = true; status = "Loading replay…"
            view.setVideoURI(Uri.parse("android.resource://${context.packageName}/$resource"))
        }) { Text("Retry replay") }
        trailingControl?.invoke(this)
    }
}
