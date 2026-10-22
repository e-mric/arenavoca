package com.arenavoca.tv

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.focusable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.focus.focusProperties
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.ui.input.key.*
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.*
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import androidx.lifecycle.compose.LocalLifecycleOwner
import androidx.tv.material3.Text
import com.arenavoca.stories.AlbaComic
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Composable internal fun TvComicPanel(recordingSeconds: Int, entryFocus: FocusRequester, selectedId: String?, onSelect: (String) -> Unit, onReplay: (String) -> Unit, onClose: () -> Unit) {
    val cards = AlbaComic.available(recordingSeconds)
    val selected = cards.find { it.id == selectedId } ?: cards.firstOrNull()
    if (selected == null) {
        Text("Comic moments", fontSize = 24.sp, color = Navy)
        Text("Your panels will appear after the action.", color = Navy)
        TvAction("Back to match", Modifier.focusRequester(entryFocus), onClick = onClose)
        return
    }
    LaunchedEffect(selected.id) { entryFocus.requestFocus() }
    val index = cards.indexOf(selected)
    Text("La jugada de Alba", color = Navy, fontSize = 18.sp, fontWeight = FontWeight.Bold)
    Text("${index + 1} / ${cards.size} available", color = Navy, fontSize = 13.sp, modifier = Modifier.testTag("comic-count"))
    Artwork(AlbaComic.artwork(selected.id)!!, Modifier.fillMaxWidth().aspectRatio(1.5f))
    key(selected.id) { TvHoldSpanish(selected.spanish, selected.english, entryFocus) }
    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        TvAction("Previous", Modifier.weight(1f).focusProperties { canFocus = index > 0 }.testTag("comic-previous"), index > 0) { onSelect(cards[index - 1].id) }
        TvAction("Next", Modifier.weight(1f).focusProperties { canFocus = index < cards.lastIndex }.testTag("comic-next"), index < cards.lastIndex) { onSelect(cards[index + 1].id) }
    }
    TvAction("Replay moment", Modifier.testTag("comic-replay")) { onReplay(selected.id) }
    TvAction("Back to match", Modifier.testTag("close-comic"), onClick = onClose)
}

@Composable private fun TvHoldSpanish(spanish: String, english: String, entryFocus: FocusRequester) {
    var translated by remember { mutableStateOf(false) }
    var focused by remember { mutableStateOf(false) }
    var hold by remember { mutableStateOf<Job?>(null) }
    val scope = rememberCoroutineScope()
    val lifecycle = LocalLifecycleOwner.current.lifecycle
    fun reset() { hold?.cancel(); hold = null; translated = false }
    DisposableEffect(lifecycle) {
        val observer = LifecycleEventObserver { _, event -> if (event == Lifecycle.Event.ON_PAUSE) reset() }
        lifecycle.addObserver(observer)
        onDispose { lifecycle.removeObserver(observer); reset() }
    }
    Column(Modifier.fillMaxWidth().focusRequester(entryFocus).testTag("comic-caption")
        .onFocusChanged { focused = it.isFocused; if (!it.isFocused) reset() }
        .onPreviewKeyEvent { event ->
            if (event.key !in listOf(Key.Enter, Key.NumPadEnter, Key.DirectionCenter, Key.Spacebar)) false
            else {
                if (event.type == KeyEventType.KeyDown && hold == null) hold = scope.launch { delay(500); translated = true }
                if (event.type == KeyEventType.KeyUp) reset()
                true
            }
        }.semantics(mergeDescendants = true) {
            role = Role.Button
            stateDescription = if (translated) "English visible" else "English hidden"
            onClick(if (translated) "Hide English" else "Show English") { translated = !translated; true }
        }.focusable().border(if (focused) 3.dp else 1.dp, if (focused) Blue else Lavender, RoundedCornerShape(12.dp))
        .background(Lavender, RoundedCornerShape(12.dp)).padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Text(spanish, color = Navy, fontSize = 21.sp, lineHeight = 26.sp, fontWeight = FontWeight.Bold)
        Text("Hold Select for English", color = Navy, fontSize = 12.sp)
        if (translated) Text(english, color = Blue, fontSize = 17.sp, modifier = Modifier.testTag("comic-english")
            .semantics { liveRegion = LiveRegionMode.Polite })
    }
}
