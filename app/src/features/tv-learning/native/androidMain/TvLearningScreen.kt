package com.arenavoca.tv

import android.view.KeyEvent as AndroidKey
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.focusable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.Alignment
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.key.*
import androidx.compose.ui.input.InputMode
import androidx.compose.ui.platform.LocalInputModeManager
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.semantics.*
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.tv.material3.*
import com.arenavoca.recap.*
import com.arenavoca.tvlearning.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

internal val Cream = Color(0xFFFFF8EE)
internal val Navy = Color(0xFF17234E)
internal val Blue = Color(0xFF2855FF)
internal val Lavender = Color(0xFFE8E1FA)
private enum class TvView { Watch, Controls, Moments, Saved, Card, Practice, About, Comic, Replay }

@Composable internal fun TvLearningScreen(learning: TvLearning, player: TvPlayer) {
    val context = LocalContext.current
    val storage = remember { context.getSharedPreferences("tv-learning", 0) }
    val sequence = learning.sequence
    var savedIds by remember { mutableStateOf((storage.getStringSet("saved-${sequence.id}", emptySet()) ?: emptySet())
        .filter { id -> sequence.moments.any { it.phraseId == id } }.toSet()) }
    var revision by remember { mutableIntStateOf(0) }
    var view by remember { mutableStateOf(TvView.Watch) }
    var replayMoment by remember { mutableStateOf<TvMoment?>(null) }
    var replayReturn by remember { mutableStateOf(TvView.Card) }
    var comicSelectedId by remember { mutableStateOf<String?>(null) }
    var notice by remember { mutableStateOf("") }
    var saving by remember { mutableStateOf(false) }
    var quiz by remember { mutableStateOf<Quiz?>(null) }
    var invitation by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()
    val inputMode = LocalInputModeManager.current
    val watchFocus = remember { FocusRequester() }
    val entryFocus = remember { FocusRequester() }
    LaunchedEffect(player) {
        while (true) {
            val position = player.position
            if (position != learning.positionMs) { learning.observe(position); revision++ }
            delay(200)
        }
    }
    @Suppress("UNUSED_VARIABLE") val observedRevision = revision
    val latest = learning.available.lastOrNull()?.phraseId
    LaunchedEffect(latest) {
        if (latest != null) { invitation = true; delay(5_000); invitation = false }
    }
    LaunchedEffect(view, player.ready, quiz?.index, quiz?.feedback) {
        inputMode.requestInputMode(InputMode.Keyboard)
        if (view == TvView.Watch) watchFocus.requestFocus() else entryFocus.requestFocus()
    }
    fun watch() { learning.close(); comicSelectedId = null; quiz = null; view = TvView.Watch; notice = ""; revision++ }
    BackHandler(view != TvView.Watch) { if (view == TvView.Replay) view = replayReturn else watch() }
    fun save(id: String) {
        if (saving) return
        saving = true
        scope.launch {
            val updated = savedIds + id
            val success = withContext(Dispatchers.IO) { storage.edit().putStringSet("saved-${sequence.id}", updated).commit() }
            if (success) { savedIds = updated; notice = "Saved on this TV" }
            else notice = "Couldn't save. Try again."
            saving = false
        }
    }
    val panel = view !in listOf(TvView.Watch, TvView.Controls)
    MaterialTheme(colorScheme = lightColorScheme(primary = Blue, onPrimary = Color.White,
        background = Navy, onBackground = Cream, surface = Cream, onSurface = Navy)) {
        Box(Modifier.fillMaxSize().background(Navy).testTag("tv-root")) {
            Row(Modifier.fillMaxSize()) {
                BoxWithConstraints(Modifier.weight(if (panel) .72f else 1f).fillMaxHeight().testTag("video-area"), contentAlignment = Alignment.Center) {
                    val videoWidth = minOf(maxWidth, maxHeight * (16f / 9f))
                    // Keep this AndroidView in the same composition position when a panel opens.
                    AndroidView(factory = { player.view }, modifier = Modifier.width(videoWidth).aspectRatio(16f / 9f).testTag("match-video"))
                }
                if (panel) {
                    Column(Modifier.weight(.28f).fillMaxHeight().background(Cream).testTag("learning-panel")
                        .verticalScroll(rememberScrollState()).padding(20.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
                        when (view) {
                            TvView.Replay -> key(replayMoment!!.phraseId) { TvReplayPanel(sequence, replayMoment!!, entryFocus, if (replayReturn == TvView.Comic) "Back to comic" else "Back to card") { view = replayReturn } }
                            TvView.Comic -> TvComicPanel(sequence.sourceOffsetSeconds + learning.positionMs / 1000, entryFocus, comicSelectedId, { comicSelectedId = it },
                                onReplay = { id -> replayMoment = sequence.moments.single { it.phraseId == id }; replayReturn = TvView.Comic; view = TvView.Replay },
                                onClose = { watch() })
                            TvView.Card -> {
                                val selected = learning.selected!!
                                Text("${sequence.moments.indexOf(selected) + 1} / ${sequence.moments.size}", color = Navy, fontSize = 14.sp)
                                Artwork(selected.artwork, Modifier.fillMaxWidth().aspectRatio(1.15f))
                                Text(if (learning.translated) selected.phrase.english else selected.phrase.spanish,
                                    color = Navy, fontSize = 23.sp, lineHeight = 29.sp, fontWeight = FontWeight.Bold,
                                    modifier = Modifier.testTag("card-phrase"))
                                Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                                    TvAction(if (learning.translated) "Spanish" else "Meaning", Modifier.weight(1f).focusRequester(entryFocus).testTag("flip")) {
                                        learning.flip(); revision++
                                    }
                                    TvAction(if (selected.phraseId in savedIds) "Saved" else "Save", Modifier.weight(1f).testTag("save"), !saving) { save(selected.phraseId) }
                                }
                                if (notice.isNotBlank()) Text(notice, color = Navy, fontSize = 13.sp,
                                    modifier = Modifier.semantics { liveRegion = LiveRegionMode.Polite })
                                TvAction("Replay moment", Modifier.testTag("replay-moment")) {
                                    replayMoment = selected; replayReturn = TvView.Card; view = TvView.Replay
                                }
                                TvAction("Close card", Modifier.testTag("close-card")) { watch() }
                            }
                            TvView.Moments, TvView.Saved -> {
                                val saved = view == TvView.Saved
                                Text(if (saved) "Saved moments" else "Match moments", color = Navy, fontSize = 24.sp, fontWeight = FontWeight.Bold)
                                val moments = if (saved) sequence.moments.filter { it.phraseId in savedIds } else learning.available
                                if (moments.isEmpty()) Text(if (saved) "Save a card to revisit it here." else "Your moments will appear after the action.", color = Navy, fontSize = 17.sp)
                                moments.forEachIndexed { index, moment ->
                                    TvAction(moment.title, Modifier.fillMaxWidth().then(if (index == 0) Modifier.focusRequester(entryFocus) else Modifier)
                                        .testTag("moment-${moment.phraseId}"), artwork = moment.artwork) {
                                        if (saved) learning.openSaved(moment.phraseId, savedIds.toList()) else learning.open(moment.phraseId)
                                        notice = ""; view = TvView.Card; revision++
                                    }
                                }
                                if (saved && moments.isNotEmpty()) TvAction("Practise saved", Modifier.testTag("practice")) {
                                    quiz = sequence.quiz(savedIds.toList()); view = TvView.Practice
                                }
                                TvAction("Back to match", if (moments.isEmpty()) Modifier.focusRequester(entryFocus) else Modifier) { watch() }
                            }
                            TvView.Practice -> {
                                val attempt = quiz!!
                                Text("Match recap", color = Navy, fontSize = 24.sp, fontWeight = FontWeight.Bold)
                                if (attempt.complete) {
                                    Text("${attempt.correct} / ${attempt.total}", color = Navy, fontSize = 32.sp)
                                    TvAction("Done", Modifier.focusRequester(entryFocus)) { watch() }
                                } else {
                                    Text(attempt.question!!.prompt, color = Navy, fontSize = 22.sp)
                                    if (attempt.feedback == null) attempt.question!!.choices.forEachIndexed { index, answer ->
                                        TvAction(answer, if (index == 0) Modifier.focusRequester(entryFocus) else Modifier) { attempt.answer(answer); revision++ }
                                    } else {
                                        Text(attempt.feedback!!.answer, color = Navy, fontSize = 19.sp)
                                        TvAction("Next", Modifier.focusRequester(entryFocus)) { attempt.next(); revision++ }
                                    }
                                }
                            }
                            TvView.About -> {
                                Text(sequence.title, color = Navy, fontSize = 23.sp, fontWeight = FontWeight.Bold)
                                Text(sequence.description, color = Navy, fontSize = 16.sp)
                                Text("Prepared cards · Spanish awaits review", color = Navy, fontSize = 16.sp)
                                Text("Select opens controls. Back returns to the match. Saves stay on this TV; phone sync isn't connected.", color = Navy, fontSize = 16.sp)
                                TvAction("Back to match", Modifier.focusRequester(entryFocus)) { watch() }
                            }
                            else -> Unit
                        }
                    }
                }
            }
            if (view == TvView.Watch) {
                Box(Modifier.fillMaxSize().focusRequester(watchFocus).onKeyEvent { event ->
                    val opens = event.nativeKeyEvent.keyCode in listOf(AndroidKey.KEYCODE_DPAD_CENTER, AndroidKey.KEYCODE_ENTER,
                        AndroidKey.KEYCODE_DPAD_UP, AndroidKey.KEYCODE_DPAD_DOWN, AndroidKey.KEYCODE_DPAD_LEFT, AndroidKey.KEYCODE_DPAD_RIGHT)
                    if (opens && event.type == KeyEventType.KeyUp) { view = TvView.Controls; true } else opens
                }.focusable().testTag("watch-surface").semantics { contentDescription = "Match. Select to show controls" })
                if (invitation) Text("New moment", color = Navy, fontSize = 17.sp, fontWeight = FontWeight.Bold,
                    modifier = Modifier.align(Alignment.BottomEnd).padding(32.dp).background(Cream, RoundedCornerShape(24.dp))
                        .padding(horizontal = 22.dp, vertical = 14.dp).testTag("new-moment").semantics { liveRegion = LiveRegionMode.Polite })
                if (player.failed || !player.ready || player.ended || !player.playing) {
                    Text(if (player.failed) "Video unavailable · Select to retry" else if (!player.ready) "Loading match…"
                        else if (player.ended) "Match finished · Select for moments" else "Paused · Select for controls",
                        color = Navy, fontSize = 17.sp, modifier = Modifier.align(Alignment.BottomStart).padding(32.dp)
                            .background(Cream, RoundedCornerShape(24.dp)).padding(16.dp))
                }
            }
            if (view == TvView.Controls) {
                Column(Modifier.align(Alignment.BottomCenter).fillMaxWidth().background(Cream).padding(28.dp).testTag("controls"),
                    verticalArrangement = Arrangement.spacedBy(14.dp)) {
                    Text(sequence.title, color = Navy, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                    Row(horizontalArrangement = Arrangement.spacedBy(18.dp), verticalAlignment = Alignment.CenterVertically) {
                        TvAction(if (player.failed) "Retry video" else if (player.ended) "Watch again" else if (player.playing) "Pause" else "Play",
                            Modifier.focusRequester(entryFocus).testTag("play"), player.ready || player.failed) {
                            if (player.failed) player.retry() else if (player.ended) player.restart() else player.toggle()
                            watch()
                        }
                        TvAction("Moments (${learning.available.size})", Modifier.testTag("moments")) { view = TvView.Moments }
                        TvAction("Saved (${savedIds.size})", Modifier.testTag("saved-list")) { view = TvView.Saved }
                        TvAction("About", Modifier.testTag("about")) { view = TvView.About }
                        if (sequence.id == TvSequence.alba.id) TvAction("Comic", Modifier.testTag("comic")) { view = TvView.Comic }
                        TvAction("Hide controls") { watch() }
                    }
                }
            }
        }
    }
}

@Composable internal fun Artwork(name: String, modifier: Modifier) {
    val context = LocalContext.current
    Image(painterResource(context.resources.getIdentifier(name, "drawable", context.packageName)), null, modifier)
}

@Composable internal fun TvAction(label: String, modifier: Modifier = Modifier, enabled: Boolean = true,
    artwork: String? = null, onClick: () -> Unit) {
    var focused by remember { mutableStateOf(false) }
    Button(onClick = onClick, enabled = enabled,
        modifier = modifier.onFocusChanged { focused = it.isFocused }
            .border(if (focused) 3.dp else 0.dp, if (focused) Blue else Color.Transparent, RoundedCornerShape(16.dp)),
        colors = ButtonDefaults.colors(containerColor = Lavender, contentColor = Navy,
            focusedContainerColor = Blue, focusedContentColor = Color.White),
        contentPadding = PaddingValues(horizontal = 12.dp, vertical = 12.dp)) {
        if (artwork != null) { Artwork(artwork, Modifier.size(64.dp, 48.dp)); Spacer(Modifier.width(10.dp)) }
        Text(label, fontSize = 15.sp, lineHeight = 19.sp)
    }
}
