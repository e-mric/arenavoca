package com.arenavoca.mobile

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.arenavoca.stories.MatchEvidence
import com.arenavoca.stories.MatchReplay

/** Independent replay over the comic. Closing disposes its player without moving the story. */
@Composable internal fun StadiumReplayDialog(evidence: MatchEvidence, onClose: () -> Unit) {
    val context = LocalContext.current
    val replay = remember(evidence) { MatchReplay.from(evidence) }
    val resource = remember(replay) { context.resources.getIdentifier(replay.fileName, "raw", context.packageName) }
    var expanded by remember { mutableStateOf(false) }
    Dialog(onDismissRequest = onClose, properties = DialogProperties(usePlatformDefaultWidth = false)) {
        BoxWithConstraints(Modifier.fillMaxSize().safeDrawingPadding().padding(if (expanded) 4.dp else 16.dp),
            contentAlignment = Alignment.Center) {
            val stadium = RoundedCornerShape(if (expanded) 20.dp else 48.dp)
            // The rim stays translucent; text and controls have their own readable surface.
            Box(Modifier.widthIn(max = if (expanded) maxWidth else 720.dp).fillMaxWidth()
                .heightIn(max = maxHeight)
                .border(1.dp, Color(0xFFDAD5FF), stadium)
                .background(PlaymakerInk.copy(alpha = .18f), stadium).padding(6.dp)) {
                Column(Modifier.fillMaxWidth().verticalScroll(rememberScrollState())
                    .background(PlaymakerInk, RoundedCornerShape(if (expanded) 14.dp else 42.dp))
                    .padding(horizontal = 14.dp, vertical = 18.dp)
                    .testTag("stadium-replay-dialog"),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Row(Modifier.fillMaxWidth().padding(horizontal = 8.dp), verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Column(Modifier.weight(1f)) {
                            Text("La jugada de Alba", color = PlaymakerCream, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                            Text(evidence.matchClock, style = MaterialTheme.typography.labelMedium, color = Color(0xFFDAD5FF))
                        }
                        IconButton(onClick = onClose,
                            modifier = Modifier.size(48.dp).semantics { contentDescription = "Close replay" }) {
                            androidx.compose.foundation.Canvas(Modifier.size(20.dp)) {
                                val inset = 3.dp.toPx()
                                drawLine(PlaymakerCream, androidx.compose.ui.geometry.Offset(inset, inset),
                                    androidx.compose.ui.geometry.Offset(size.width - inset, size.height - inset), 2.dp.toPx())
                                drawLine(PlaymakerCream, androidx.compose.ui.geometry.Offset(size.width - inset, inset),
                                    androidx.compose.ui.geometry.Offset(inset, size.height - inset), 2.dp.toPx())
                            }
                        }
                    }
                    if (resource != 0) {
                        key(replay.fileName) {
                            LocalReplayPlayer(resource, replay.fileName, stadium = true, trailingControl = {
                                TextButton(onClick = { expanded = !expanded },
                                    colors = ButtonDefaults.textButtonColors(contentColor = PlaymakerCream)) {
                                    Text(if (expanded) "Reduce replay" else "Expand replay")
                                }
                            })
                        }
                    } else {
                        Text("Replay isn't included in this build.", color = PlaymakerCream)
                    }
                }
            }
        }
    }
}
