package com.arenavoca.mobile

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.focusable
import androidx.compose.foundation.gestures.awaitEachGesture
import androidx.compose.foundation.gestures.awaitFirstDown
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Rect
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.rotate
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.Layout
import androidx.compose.ui.layout.onGloballyPositioned
import androidx.compose.ui.layout.positionInRoot
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.platform.LocalViewConfiguration
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.imageResource
import androidx.compose.ui.semantics.*
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.IntSize
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import androidx.lifecycle.compose.LocalLifecycleOwner
import kotlinx.coroutines.Job
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

private val Coral = Color(0xFFFFA492)
private val Lavender = Color(0xFFE9E4FC)
private enum class PassWord(val spanish: String, val english: String) {
    Player("el jugador", "the player"), Ball("el balón", "the ball"), Action("pasa", "passes")
}

/** One optional action playground. Pointer holds never survive release, scroll or backgrounding. */
@Composable internal fun PassingWarmup(minPanelHeight: Dp) {
    var word by remember { mutableStateOf<PassWord?>(null) }
    var english by remember { mutableStateOf(false) }
    var passed by remember { mutableStateOf(false) }
    var holdJob by remember { mutableStateOf<Job?>(null) }
    var passJob by remember { mutableStateOf<Job?>(null) }
    val progress = remember { Animatable(0f) }
    val scope = rememberCoroutineScope()
    val timeout = LocalViewConfiguration.current.longPressTimeoutMillis
    val lifecycle = LocalLifecycleOwner.current.lifecycle
    var panelOrigin by remember { mutableStateOf(Offset.Zero) }
    var pitchBounds by remember { mutableStateOf(Rect.Zero) }
    val touchRadius = with(LocalDensity.current) { 38.dp.toPx() }
    fun resetHold() { holdJob?.cancel(); holdJob = null; english = false; word = null }
    fun pass() {
        resetHold(); passed = true; word = PassWord.Action
        passJob?.cancel()
        passJob = scope.launch {
            progress.snapTo(0f)
            progress.animateTo(1f, tween(700))
            delay(1100)
            progress.snapTo(0f) // Ready for another flick; there is no score or completion requirement.
        }
    }
    DisposableEffect(lifecycle) {
        val observer = LifecycleEventObserver { _, event ->
            if (event == Lifecycle.Event.ON_PAUSE) { resetHold(); passJob?.cancel(); passed = false; scope.launch { progress.snapTo(0f) } }
        }
        lifecycle.addObserver(observer)
        onDispose { lifecycle.removeObserver(observer); resetHold(); passJob?.cancel() }
    }
    Column(Modifier.fillMaxWidth().padding(horizontal = 16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Box(Modifier.fillMaxWidth().aspectRatio(1.5f).clip(RoundedCornerShape(4.dp))
            .testTag("warmup-scene")
            .semantics {
                contentDescription = "Football player passing to a teammate"
                stateDescription = word?.spanish ?: "Explore player and ball"
                customActions = listOf(
                    CustomAccessibilityAction("Show player word") { resetHold(); word = PassWord.Player; true },
                    CustomAccessibilityAction("Show ball word") { resetHold(); word = PassWord.Ball; true },
                    CustomAccessibilityAction("Hide word") { resetHold(); true })
            }.focusable()
            .pointerInput(Unit) {
                coroutineScope {
                    awaitEachGesture {
                        val down = awaitFirstDown(requireUnconsumed = false)
                        resetHold()
                        val x = down.position.x / size.width; val y = down.position.y / size.height
                        val target = when {
                            x in .47f.. .62f && y in .61f.. .89f -> PassWord.Ball
                            x in .08f.. .49f && y in .10f.. .91f -> PassWord.Player
                            else -> null
                        }
                        val job = launch { delay(timeout); word = target }
                        holdJob = job
                        try {
                            do {
                                val event = awaitPointerEvent()
                                val change = event.changes.firstOrNull { it.id == down.id } ?: break
                                if (event.changes.size > 1 || change.isConsumed || (change.position - down.position).getDistance() > viewConfiguration.touchSlop) break
                            } while (change.pressed)
                        } finally { job.cancel(); resetHold() }
                    }
                }
            }) {
            SportArtwork("playmaker_football", cornerRadius = 0.dp)
            Canvas(Modifier.matchParentSize()) {
                fun at(x: Float, y: Float) = Offset(size.width * x, size.height * y)
                if (word == PassWord.Player) {
                    drawCircle(Coral.copy(alpha = .25f), 19.dp.toPx(), at(.30f, .34f))
                    drawCircle(Coral, 8.dp.toPx(), at(.30f, .34f))
                }
                if (word == PassWord.Ball) {
                    drawLine(Coral, at(.58f, .60f), at(.54f, .67f), 2.dp.toPx(), StrokeCap.Round)
                    drawCircle(Coral.copy(alpha = .30f), size.width * .067f, at(.54f, .74f))
                    drawCircle(Coral, size.width * .05f, at(.54f, .74f), style = Stroke(3.dp.toPx()))
                }
                if (word == PassWord.Action) {
                    val path = Path().apply { moveTo(size.width * .56f, size.height * .74f); quadraticTo(size.width * .67f, size.height * .60f, size.width * .84f, size.height * .59f) }
                    drawPath(path, Coral, style = Stroke(4.dp.toPx(), cap = StrokeCap.Round))
                    drawLine(Coral, at(.84f, .59f), at(.81f, .56f), 4.dp.toPx(), StrokeCap.Round)
                    drawLine(Coral, at(.84f, .59f), at(.81f, .63f), 4.dp.toPx(), StrokeCap.Round)
                    drawCircle(Coral, size.width * .035f, at(.86f, .61f), style = Stroke(2.dp.toPx()))
                }
            }
            word?.let { selected ->
                // Anchor labels to the subject, rather than covering the receiving player on the right.
                Layout(modifier = Modifier.matchParentSize(), content = {
                    Column(Modifier.testTag("warmup-word-label")
                        .background(PlaymakerCream, RoundedCornerShape(14.dp))
                        .padding(horizontal = 12.dp, vertical = 6.dp),
                        horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(selected.spanish, style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold)
                        Text(selected.english, style = MaterialTheme.typography.bodySmall)
                    }
                }) { children, constraints ->
                    val label = children.single().measure(constraints.copy(minWidth = 0, minHeight = 0,
                        maxWidth = (constraints.maxWidth * .42f).toInt()))
                    val centerX = when (selected) { PassWord.Player -> .5f; PassWord.Ball -> .58f; PassWord.Action -> .66f }
                    val bottomY = when (selected) { PassWord.Player -> .25f; PassWord.Ball -> .60f; PassWord.Action -> .47f }
                    layout(constraints.maxWidth, constraints.maxHeight) {
                        label.placeRelative(
                            (constraints.maxWidth * centerX - label.width / 2).toInt().coerceIn(0, constraints.maxWidth - label.width),
                            (constraints.maxHeight * bottomY - label.height).toInt().coerceIn(0, constraints.maxHeight - label.height))
                    }
                }
            }
        }
        Column(Modifier.fillMaxWidth().heightIn(min = minPanelHeight).clip(RoundedCornerShape(4.dp)).background(Lavender)
            .border(if (english) 2.dp else 1.dp, if (english) PlaymakerBlue else PlaymakerInk, RoundedCornerShape(4.dp))
            .onGloballyPositioned { panelOrigin = it.positionInRoot() }.testTag("warmup-meaning-area")
            .semantics {
                contentDescription = "Hold anywhere in this panel for English. Flick the ball towards the teammate to pass."
                stateDescription = if (english) "English visible" else "English hidden"
                onClick(label = if (english) "Hide English" else "Show English") { english = !english; true }
                customActions = listOf(CustomAccessibilityAction("Pass ball") { pass(); true })
            }.focusable()
            .pointerInput(Unit) {
                coroutineScope {
                    awaitEachGesture {
                        val down = awaitFirstDown(requireUnconsumed = false)
                        resetHold()
                        // Measure in root coordinates so padding, text size and scrolling do not move the hit target.
                        val start = down.position + panelOrigin
                        val ball = Offset(pitchBounds.left + pitchBounds.width * .14f, pitchBounds.top + pitchBounds.height * .78f)
                        val ballStart = (start - ball).getDistance() < touchRadius
                        if (ballStart) { passed = false; passJob?.cancel(); launch { progress.snapTo(0f) } }
                        var moved = false
                        var cancelled = false
                        var delta = Offset.Zero
                        val job = launch { delay(timeout); english = true }
                        holdJob = job
                        try {
                            while (true) {
                                val event = awaitPointerEvent()
                                val change = event.changes.firstOrNull { it.id == down.id } ?: break
                                delta = change.position - down.position
                                if (event.changes.size > 1 || change.isConsumed) { cancelled = true; break }
                                if (delta.getDistance() > viewConfiguration.touchSlop) { moved = true; job.cancel(); english = false }
                                if (moved && ballStart) change.consume()
                                if (!change.pressed) break
                            }
                        } finally { job.cancel(); english = false }
                        if (!cancelled && ballStart && moved && delta.x > pitchBounds.width * .20f && delta.y < pitchBounds.height * .12f) pass()
                    }
                }
            }.padding(12.dp), horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.SpaceBetween) {
            val highlighted = word
            val phrase = "El jugador pasa el balón."
            val annotated = buildAnnotatedString {
                append(phrase)
                val range = when (highlighted) { PassWord.Player -> 0 to 10; PassWord.Action -> 11 to 15; PassWord.Ball -> 16 to 24; null -> null }
                if (range != null) addStyle(SpanStyle(background = Coral), range.first, range.second)
            }
            Text(annotated, Modifier.fillMaxWidth().padding(top = 4.dp).testTag("comic-spanish-warmup-pass")
                .semantics { stateDescription = highlighted?.spanish ?: "No highlighted word" },
                fontSize = 25.sp, lineHeight = 30.sp, textAlign = TextAlign.Center, fontWeight = FontWeight.Bold, color = PlaymakerInk)
            Box(Modifier.fillMaxWidth().heightIn(min = 46.dp), contentAlignment = Alignment.Center) {
                if (english) Text("The player passes the ball.", textAlign = TextAlign.Center, fontWeight = FontWeight.Bold,
                    color = PlaymakerBlue, modifier = Modifier.testTag("warmup-english").semantics { liveRegion = LiveRegionMode.Polite })
                else Text(if (passed) "¡Buen pase!" else "Flick the ball · Hold below for English", textAlign = TextAlign.Center,
                    style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
            MiniPitch(progress.value, passed, Modifier.onGloballyPositioned {
                val origin = it.positionInRoot(); pitchBounds = Rect(origin, Size(it.size.width.toFloat(), it.size.height.toFloat()))
            })
            Text(if (english) "Release to hide English" else "Hold the player or ball above to explore", style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant, textAlign = TextAlign.Center)
        }
    }
}

@Composable private fun MiniPitch(progress: Float, passed: Boolean, modifier: Modifier) {
    val ballSprite = ImageBitmap.imageResource(R.drawable.warmup_ball)
    Box(modifier.fillMaxWidth().aspectRatio(2.15f).clip(RoundedCornerShape(16.dp))
        .background(Color(0xFFCEC8FA)).testTag("warmup-pitch")) {
        Canvas(Modifier.matchParentSize()) {
            val white = PlaymakerCream.copy(alpha = .9f)
            val inset = 8.dp.toPx(); val stroke = 1.dp.toPx()
            drawRect(white, Offset(inset, inset), Size(size.width - inset * 2, size.height - inset * 2), style = Stroke(stroke))
            drawLine(white, Offset(size.width / 2, inset), Offset(size.width / 2, size.height - inset), stroke)
            drawCircle(white, size.height * .18f, center, style = Stroke(stroke))
            for (x in listOf(inset, size.width - inset - size.width * .12f)) drawRect(white, Offset(x, size.height * .28f), Size(size.width * .12f, size.height * .44f), style = Stroke(stroke))
            drawOval(Coral, Offset(size.width * .76f, size.height * .44f), Size(size.width * .19f, size.height * .10f))
            val start = Offset(size.width * .14f, size.height * .78f)
            val end = Offset(size.width * .79f, size.height * .47f)
            val path = Path().apply { moveTo(start.x, start.y); quadraticTo(size.width * .41f, size.height * .22f, end.x, end.y) }
            drawPath(path, if (passed) Coral else white, style = Stroke(3.dp.toPx(), cap = StrokeCap.Round,
                pathEffect = if (passed) null else PathEffect.dashPathEffect(floatArrayOf(10.dp.toPx(), 7.dp.toPx()))))
            drawLine(if (passed) Coral else white, end, end + Offset(-12.dp.toPx(), -9.dp.toPx()), 3.dp.toPx(), StrokeCap.Round)
            drawLine(if (passed) Coral else white, end, end + Offset(-13.dp.toPx(), 5.dp.toPx()), 3.dp.toPx(), StrokeCap.Round)
        }
        Image(painterResource(R.drawable.warmup_receiver), contentDescription = null,
            modifier = Modifier.align(Alignment.TopEnd).padding(end = 10.dp).fillMaxHeight(.58f).aspectRatio(.67f))
        Canvas(Modifier.matchParentSize()) {
            val t = progress
            val start = Offset(size.width * .14f, size.height * .78f)
            val control = Offset(size.width * .41f, size.height * .22f)
            val end = Offset(size.width * .79f, size.height * .47f)
            val ball = start * ((1-t)*(1-t)) + control * (2*(1-t)*t) + end * (t*t)
            val radius = size.height * .13f * (1f - .22f * t)
            drawOval(PlaymakerBlue.copy(alpha = .18f), ball + Offset(-radius, radius * .7f), Size(radius*2, radius*.5f))
            if (passed) drawCircle(Coral, radius * 1.2f, ball, style = Stroke(2.dp.toPx()))
            rotate(degrees = -160f * t, pivot = ball) {
                drawImage(ballSprite,
                    dstOffset = IntOffset((ball.x - radius).toInt(), (ball.y - radius).toInt()),
                    dstSize = IntSize((radius * 2).toInt().coerceAtLeast(1), (radius * 2).toInt().coerceAtLeast(1)))
            }
        }
    }
}
