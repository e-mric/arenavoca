package com.arenavoca.mobile

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

/** Ink-framed native captions shared by the comic and its learning cards. */
@Composable internal fun ComicCaption(modifier: Modifier = Modifier, content: @Composable ColumnScope.() -> Unit) {
    Surface(modifier, shape = RoundedCornerShape(4.dp), color = PlaymakerCream,
        border = BorderStroke(1.dp, PlaymakerInk)) {
        Column(content = content)
    }
}

/** Only source-matched illustrations may replace the matching moment artwork. */
internal fun comicMomentArtwork(artwork: String): String = when (artwork) {
    "match_bale_run" -> "comic_bale_run"
    "match_cross" -> "comic_bale_cross"
    "match_volley" -> "comic_benzema_volley"
    "match_run" -> "comic_alba_run"
    "match_cutback" -> "comic_alba_cutback"
    "match_goal" -> "comic_alba_goal"
    else -> artwork
}
