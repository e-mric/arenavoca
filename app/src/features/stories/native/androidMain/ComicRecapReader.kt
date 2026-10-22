package com.arenavoca.mobile

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.relocation.BringIntoViewRequester
import androidx.compose.foundation.relocation.bringIntoViewRequester
import androidx.compose.foundation.focusable
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.res.imageResource
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.ui.input.key.*
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalViewConfiguration
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.*
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import androidx.lifecycle.compose.LocalLifecycleOwner
import com.arenavoca.stories.AlbaComic
import kotlinx.coroutines.Job
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

/** A continuous illustrated story; captions remain native, accessible text. */
@Composable internal fun ComicRecapReader(onClose: () -> Unit) {
    var replayId by remember { mutableStateOf<String?>(null) }
    BackHandler { onClose() }
    Surface(Modifier.fillMaxSize()) {
        Column(Modifier.fillMaxSize().safeDrawingPadding()) {
            Row(Modifier.padding(horizontal = 12.dp), verticalAlignment = androidx.compose.ui.Alignment.CenterVertically) {
                CompactBack("Back to stories", onClose)
                Text("La jugada de Alba", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.ExtraBold)
            }
            LazyColumn(Modifier.weight(1f).testTag("comic-scroll"), contentPadding = PaddingValues(bottom = 24.dp)) {
                item {
                    Text("Barcelona vs Madrid · 28 oct 2018", Modifier.padding(start = 20.dp, end = 20.dp, bottom = 12.dp),
                        style = MaterialTheme.typography.bodySmall)
                }
                itemsIndexed(AlbaComic.cards, key = { _, card -> card.id }) { index, card ->
                    Column(Modifier.fillMaxWidth()) {
                        Column(verticalArrangement = Arrangement.spacedBy((-24).dp)) {
                            ComicArtwork(card.id, index)
                            ComicCaption(Modifier.padding(horizontal = 20.dp).testTag("comic-caption-${card.id}")) {
                                Column(Modifier.padding(horizontal = 14.dp, vertical = 12.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                                    HoldSpanish(card.spanish, card.english, card.id)
                                    Text("Hold for English", style = MaterialTheme.typography.labelSmall,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant)
                                }
                            }
                        }
                        if (index != 1) ComicDetail(card.id)
                        Row(Modifier.fillMaxWidth().padding(horizontal = 16.dp),
                            verticalAlignment = androidx.compose.ui.Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween) {
                            Text(card.evidence.matchClock, style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant)
                            TextButton(onClick = { replayId = card.id }) {
                                Text("Replay moment")
                            }
                        }
                    }
                }
                item { Text("Illustrated recap · Spanish awaits review", Modifier.padding(20.dp), style = MaterialTheme.typography.bodySmall) }
            }
        }
    }
    replayId?.let { id ->
        StadiumReplayDialog(AlbaComic.cards.single { it.id == id }.evidence) { replayId = null }
    }
}

/** Alternating slanted gutters establish a connected vertical comic rhythm. */
private class ComicEdge(private val reverse: Boolean = false) : androidx.compose.ui.graphics.Shape {
    override fun createOutline(size: androidx.compose.ui.geometry.Size, layoutDirection: androidx.compose.ui.unit.LayoutDirection,
        density: androidx.compose.ui.unit.Density): androidx.compose.ui.graphics.Outline {
        val cut = with(density) { 18.dp.toPx() }
        val path = androidx.compose.ui.graphics.Path().apply {
            moveTo(0f, if (reverse) cut else 0f)
            lineTo(size.width, if (reverse) 0f else cut)
            lineTo(size.width, if (reverse) size.height - cut else size.height)
            lineTo(0f, if (reverse) size.height else size.height - cut)
            close()
        }
        return androidx.compose.ui.graphics.Outline.Generic(path)
    }
}

@Composable private fun ComicArtwork(id: String, index: Int) {
    androidx.compose.foundation.Image(
        androidx.compose.ui.res.painterResource(artworkResource(AlbaComic.artwork(id)!!)), contentDescription = null,
        modifier = Modifier.fillMaxWidth().aspectRatio(if (index == 0) 1.05f else 1.5f)
            .clip(ComicEdge(index % 2 == 1)).testTag("comic-art-$id"),
        contentScale = androidx.compose.ui.layout.ContentScale.Crop,
        alignment = if (index == 0) androidx.compose.ui.Alignment.CenterStart else androidx.compose.ui.Alignment.Center)
}

/** A close detail from the same authored panel, not a separate invented match event. */
@Composable private fun ComicDetail(id: String) {
    val goal = id == "coutinho-goal"
    val bitmap = androidx.compose.ui.graphics.ImageBitmap.imageResource(artworkResource(AlbaComic.artwork(id)!!))
    // Normalised crops of the same illustration: ball/boots, then net/keeper.
    val left = if (goal) 0.61f else 0.07f
    val top = if (goal) 0.24f else 0.60f
    val width = if (goal) 0.39f else 0.50f
    val height = if (goal) 0.39f else 0.30f
    Box(Modifier.fillMaxWidth().padding(top = 8.dp).aspectRatio(if (goal) 1.5f else 2.5f).clip(ComicEdge(true))) {
        androidx.compose.foundation.Canvas(Modifier.fillMaxSize()) {
            drawImage(bitmap,
                srcOffset = androidx.compose.ui.unit.IntOffset((bitmap.width * left).toInt(), (bitmap.height * top).toInt()),
                srcSize = androidx.compose.ui.unit.IntSize((bitmap.width * width).toInt(), (bitmap.height * height).toInt()),
                dstSize = androidx.compose.ui.unit.IntSize(size.width.toInt(), size.height.toInt()))
        }
        if (goal) Text("¡GOL!", Modifier.align(androidx.compose.ui.Alignment.TopEnd).padding(20.dp),
            style = MaterialTheme.typography.displaySmall, fontWeight = FontWeight.Black,
            fontStyle = androidx.compose.ui.text.font.FontStyle.Italic, color = androidx.compose.ui.graphics.Color(0xFFFFC4B7))
    }
}

/** Pointer and keyboard holds are momentary; accessibility activation offers a toggle. */
@Composable internal fun HoldSpanish(spanish: String, english: String, id: String) {
    var translated by remember(id) { mutableStateOf(false) }
    var accessibleReveal by remember(id) { mutableStateOf(false) }
    var keyHold by remember { mutableStateOf<Job?>(null) }
    var touchHold by remember { mutableStateOf<Job?>(null) }
    val scope = rememberCoroutineScope()
    val translationView = remember { BringIntoViewRequester() }
    LaunchedEffect(translated) { if (translated) translationView.bringIntoView() }
    val timeout = LocalViewConfiguration.current.longPressTimeoutMillis
    val lifecycle = LocalLifecycleOwner.current.lifecycle
    fun reset() { keyHold?.cancel(); keyHold = null; touchHold?.cancel(); touchHold = null; translated = false; accessibleReveal = false }
    DisposableEffect(lifecycle, id) {
        val observer = LifecycleEventObserver { _, event -> if (event == Lifecycle.Event.ON_PAUSE) reset() }
        lifecycle.addObserver(observer)
        onDispose { lifecycle.removeObserver(observer); reset() }
    }
    Text(spanish, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold,
        modifier = Modifier.fillMaxWidth().heightIn(min = 48.dp).testTag("comic-spanish-$id")
            .semantics {
                role = Role.Button
                stateDescription = if (translated) "English visible" else "English hidden"
                onClick(label = if (translated) "Hide English" else "Show English") {
                    translated = !translated; accessibleReveal = translated; true
                }
            }
            .onFocusChanged { if (!it.isFocused) reset() }
            .onPreviewKeyEvent { event ->
                if (event.key !in listOf(Key.Enter, Key.NumPadEnter, Key.DirectionCenter, Key.Spacebar)) false
                else {
                    if (event.type == KeyEventType.KeyDown && keyHold == null) keyHold = scope.launch { delay(timeout); translated = true }
                    if (event.type == KeyEventType.KeyUp) reset()
                    true
                }
            }.focusable()
            .pointerInput(id) {
                detectTapGestures(onPress = {
                    coroutineScope {
                        val hold = launch { delay(timeout); translated = true }
                        touchHold = hold
                        try { tryAwaitRelease() } finally { hold.cancel(); touchHold = null; translated = false; accessibleReveal = false }
                    }
                })
            })
    if (translated) Text(english, style = MaterialTheme.typography.bodyLarge, color = PlaymakerBlue,
        modifier = Modifier.bringIntoViewRequester(translationView).testTag("comic-english-$id").semantics { liveRegion = LiveRegionMode.Polite })
    if (accessibleReveal) TextButton(onClick = { reset() }) { Text("Hide English") }
}
