package com.arenavoca.mobile

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.*
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.arenavoca.stories.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

@Composable internal fun MatchPackEntry(onOpen: () -> Unit) {
    OutlinedCard(Modifier.fillMaxWidth()) {
        Column(Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Text("From the actual match", style = MaterialTheme.typography.labelLarge, color = PlaymakerBlue)
            Text(MatchCatalog.pack.source.title, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
            Text("6 cards · 2 stories\nBuilt from commentary and on-screen action.")
            Button(onClick = onOpen, modifier = Modifier.heightIn(min = 48.dp)) { Text("Explore match moments") }
        }
    }
}

@Composable internal fun MatchEvidenceDetails(evidence: MatchEvidence, compact: Boolean = false) {
    var expanded by remember(evidence) { mutableStateOf(false) }
    if (!compact) Text("Recording ${evidence.recordingRange} · Match ${evidence.matchClock}", style = MaterialTheme.typography.bodySmall)
    TextButton(onClick = { expanded = !expanded }) { Text(if (expanded) "Hide evidence" else "Why this card?") }
    if (expanded) {
        if (compact) Text("Recording ${evidence.recordingRange} · Match ${evidence.matchClock}", style = MaterialTheme.typography.bodySmall)
        Text("Commentary · ${evidence.commentarySummary}", style = MaterialTheme.typography.bodyMedium)
        Text("On screen · ${evidence.visualObservation}", style = MaterialTheme.typography.bodyMedium)
        Text("${evidence.reviewStatus}\nIllustration, not a broadcast frame.", style = MaterialTheme.typography.bodySmall)
    }
}

@Composable internal fun MatchMomentsReader(onClose: () -> Unit) {
    val pack = remember { MatchCatalog.pack }
    val context = LocalContext.current
    val storage = remember { context.getSharedPreferences("match-cards", 0) }
    var saved by remember { mutableStateOf(storage.getStringSet(pack.source.id, emptySet())!!.toSet()) }
    var saving by remember { mutableStateOf(false) }
    var notice by remember { mutableStateOf("") }
    val scope = rememberCoroutineScope()
    var tab by remember { mutableStateOf("Cards") }
    var cardId by remember { mutableStateOf<String?>(null) }
    var translated by remember(cardId) { mutableStateOf(false) }
    var activeReplay by remember(cardId) { mutableStateOf(false) }
    var details by remember(cardId) { mutableStateOf(false) }
    var about by remember { mutableStateOf(false) }
    var lesson by remember { mutableStateOf<SportStory?>(null) }
    var comic by remember { mutableStateOf(false) }
    if (comic) { ComicRecapReader { comic = false }; return }
    if (lesson != null) { StoryReader(lesson!!) { lesson = null }; return }
    fun back() { if (cardId != null) { cardId = null; notice = "" } else onClose() }
    BackHandler { back() }
    val scroll = rememberScrollState()
    val card = pack.cards.find { it.id == cardId }
    LaunchedEffect(cardId, tab) { scroll.scrollTo(0) }
    Surface(Modifier.fillMaxSize()) {
        Box(contentAlignment = Alignment.TopCenter) {
            Column(Modifier.widthIn(max = 620.dp).fillMaxSize().safeDrawingPadding().padding(horizontal = 20.dp)) {
                Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                    CompactBack(if (card != null) "Back to moments" else "Close match moments") { back() }
                    Column(Modifier.weight(1f), horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(if (card != null) "${pack.cards.indexOf(card) + 1} / ${pack.cards.size}" else pack.source.title,
                            style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                        if (card == null) Text(com.arenavoca.recap.eventDateLabel(pack.source.playedOn), style = MaterialTheme.typography.bodySmall)
                    }
                    if (card == null) Spacer(Modifier.width(48.dp)) else {
                        IconButton(onClick = {
                            saving = true
                            scope.launch {
                                val updated = saved + card.id
                                val success = withContext(Dispatchers.IO) { storage.edit().putStringSet(pack.source.id, updated).commit() }
                                if (success) { saved = updated; notice = "Saved on this phone" } else notice = "Couldn't save. Try again."
                                saving = false
                            }
                        }, enabled = !saving, modifier = Modifier.semantics { stateDescription = if (card.id in saved) "Saved" else "Not saved" }) {
                            Icon(painterResource(if (card.id in saved) R.drawable.ic_bookmark_saved else R.drawable.ic_bookmark),
                                contentDescription = if (card.id in saved) "Saved" else "Save", tint = PlaymakerBlue)
                        }
                    }
                }
                Column(Modifier.weight(1f).verticalScroll(scroll).padding(vertical = 16.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
                    when {
                        card != null -> {
                            MatchReplayView(card.evidence, comicMomentArtwork(card.artwork), activeReplay, compact = true) { activeReplay = it }
                            ComicCaption(Modifier.fillMaxWidth()) {
                                Column(Modifier.padding(16.dp)) {
                                Text(if (translated) card.english else card.spanish, style = MaterialTheme.typography.headlineMedium,
                                    fontWeight = FontWeight.Bold, modifier = Modifier.testTag("match-phrase"))
                                OutlinedButton(onClick = { translated = !translated }, modifier = Modifier.align(Alignment.CenterHorizontally).heightIn(min = 48.dp)) {
                                    Text(if (translated) "Show Spanish" else "Show meaning")
                                }
                                }
                            }
                            if (notice.isNotBlank()) Text(notice, style = MaterialTheme.typography.bodySmall, modifier = Modifier.semantics { liveRegion = LiveRegionMode.Polite })
                            if (details) MatchEvidenceDetails(card.evidence, compact = true)
                        }
                        else -> {
                            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                listOf("Cards" to "Cards ${pack.cards.size}", "Stories" to "Stories ${pack.stories.size}", "Saved" to "Saved ${saved.size}").forEach { (key, label) ->
                                    FilterChip(tab == key, { tab = key }, { Text(label) }, modifier = Modifier.weight(1f))
                                }
                            }
                            if (tab == "Stories") {
                                OutlinedCard(onClick = { comic = true }, modifier = Modifier.fillMaxWidth().testTag("open-comic")) {
                                    Column(Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                                        SportArtwork("comic_alba_run")
                                        Text("La jugada de Alba", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                                        Text("Read the illustrated story", style = MaterialTheme.typography.bodySmall)
                                    }
                                }
                                pack.stories.forEach { story ->
                                    val first = pack.cards.single { it.id == story.cardIds.first() }
                                    OutlinedCard(onClick = { lesson = pack.lesson(story.id) }, modifier = Modifier.fillMaxWidth()) {
                                        Column(Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                                            SportArtwork(comicMomentArtwork(first.artwork))
                                            Text(story.title, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                                            Text("3 scenes", style = MaterialTheme.typography.bodySmall)
                                        }
                                    }
                                }
                            } else {
                                val cards = if (tab == "Saved") pack.cards.filter { it.id in saved } else pack.cards
                                if (cards.isEmpty()) Text("Save a moment to revisit it here.")
                                cards.forEach { item ->
                                    Surface(onClick = { cardId = item.id; notice = "" }, modifier = Modifier.fillMaxWidth().testTag("open-${item.id}"),
                                        shape = MaterialTheme.shapes.small, border = androidx.compose.foundation.BorderStroke(1.dp, PlaymakerInk), color = MaterialTheme.colorScheme.surface) {
                                        Column {
                                            SportArtwork(comicMomentArtwork(item.artwork), cornerRadius = 0.dp)
                                            Text(item.title, Modifier.padding(14.dp), style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.ExtraBold)
                                        }
                                    }
                                }
                            }
                            HorizontalDivider()
                            TextButton(onClick = { about = !about }) { Text("About this match") }
                            if (about) Text("Prepared from selected passages of your recording. Spanish awaits fluent review. Saves stay on this phone; TV sync isn't connected.", style = MaterialTheme.typography.bodySmall)
                        }
                    }
                }
                if (card != null) {
                    HorizontalDivider()
                    Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                        TextButton(onClick = { activeReplay = false; lesson = pack.lesson(pack.stories.single { card.id in it.cardIds }.id) }, modifier = Modifier.weight(1f)) { Text("Practise") }
                        IconButton(onClick = { details = !details }) { Icon(painterResource(R.drawable.ic_more), contentDescription = "Card details") }
                    }
                    val next = pack.cards.getOrNull(pack.cards.indexOf(card) + 1)
                    Button(onClick = { cardId = next?.id; notice = "" }, modifier = Modifier.fillMaxWidth().padding(bottom = 12.dp).heightIn(min = 54.dp)) {
                        Text(if (next == null) "Back to moments" else "Next card")
                    }
                }
            }
        }
    }
}
