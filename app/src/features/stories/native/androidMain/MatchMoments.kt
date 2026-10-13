package com.arenavoca.mobile

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.arenavoca.stories.*

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

@Composable internal fun MatchEvidenceDetails(evidence: MatchEvidence) {
    var expanded by remember(evidence) { mutableStateOf(false) }
    Text("Recording ${evidence.recordingRange} · Match ${evidence.matchClock}", style = MaterialTheme.typography.bodySmall)
    TextButton(onClick = { expanded = !expanded }) { Text(if (expanded) "Hide evidence" else "Why this card?") }
    if (expanded) {
        Text("Commentary · ${evidence.commentarySummary}", style = MaterialTheme.typography.bodyMedium)
        Text("On screen · ${evidence.visualObservation}", style = MaterialTheme.typography.bodyMedium)
        Text("${evidence.reviewStatus}\nIllustration, not a broadcast frame.", style = MaterialTheme.typography.bodySmall)
    }
}

@Composable internal fun MatchMomentsReader(onClose: () -> Unit) {
    val pack = remember { MatchCatalog.pack }
    var revealed by remember { mutableStateOf(false) }
    var selected by remember { mutableStateOf(pack.stories.first().id) }
    var activeReplay by remember(selected) { mutableStateOf<String?>(null) }
    var lesson by remember { mutableStateOf<SportStory?>(null) }
    if (lesson != null) { StoryReader(lesson!!) { lesson = null }; return }
    val scroll = rememberScrollState()
    LaunchedEffect(selected, revealed) { scroll.scrollTo(0) }
    BackHandler { onClose() }
    Surface(Modifier.fillMaxSize()) {
        Box(contentAlignment = Alignment.TopCenter) {
            Column(Modifier.widthIn(max = 620.dp).fillMaxWidth().safeDrawingPadding().verticalScroll(scroll).padding(24.dp), verticalArrangement = Arrangement.spacedBy(18.dp)) {
                TextButton(onClick = onClose) { Text("Close match moments") }
                Text(pack.source.title, style = MaterialTheme.typography.headlineLarge, fontWeight = FontWeight.Bold)
                Text("From commentary + on-screen action", color = PlaymakerBlue, style = MaterialTheme.typography.labelLarge)
                if (!revealed) {
                    SportArtwork("playmaker_football")
                    Text("Ready to revisit these moments?", style = MaterialTheme.typography.titleLarge)
                    Text("These cards reveal action from recording 10:40–13:42, including a scoring moment. We don't know how far you've watched.")
                    Button(onClick = { revealed = true }, modifier = Modifier.fillMaxWidth().heightIn(min = 54.dp)) { Text("Reveal match moments") }
                } else {
                    Text("AI-prepared selection · 6 cards · 2 stories", style = MaterialTheme.typography.bodySmall)
                    pack.stories.forEach { story ->
                        FilterChip(selected == story.id, { selected = story.id }, { Text(story.title) })
                    }
                    val story = pack.stories.single { it.id == selected }
                    Button(onClick = { activeReplay = null; lesson = pack.lesson(selected) }, modifier = Modifier.fillMaxWidth().heightIn(min = 54.dp)) { Text("Practise this moment") }
                    story.cardIds.forEach { id ->
                        val card = pack.cards.single { it.id == id }
                        OutlinedCard(Modifier.fillMaxWidth()) {
                            Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                                MatchReplayView(card.evidence, card.artwork, activeReplay == card.id) { activeReplay = if (it) card.id else null }
                                Text(card.spanish, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                                Text(card.english)
                                Text(card.hint, style = MaterialTheme.typography.bodySmall)
                                MatchEvidenceDetails(card.evidence)
                            }
                        }
                    }
                    Text("Prepared from selected passages of your recording. This is not live match detection. Practice attempts are not saved.", style = MaterialTheme.typography.bodySmall)
                }
                Text("Prototype Spanish · awaiting fluent review", style = MaterialTheme.typography.labelSmall)
            }
        }
    }
}
