package com.arenavoca.recap

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

@Serializable
internal data class RecapTransfer(
    val kind: String,
    val version: Int,
    val sourceId: String,
    val title: String,
    val sport: String,
    val phraseIds: List<String>,
    val example: Boolean,
    val playedOn: String? = null,
)

data class ImportResult(val session: WatchedSession?, val message: String)

/** Validate everything before changing saved progress. Imported text never supplies quiz answers. */
internal fun parseRecap(raw: String): RecapTransfer {
    require(raw.length <= 32_768)
    val transfer = Json.decodeFromString<RecapTransfer>(raw)
    require(transfer.kind == "arenavoca-recap" && transfer.version == 1)
    require(Regex("[a-zA-Z0-9._-]{1,160}").matches(transfer.sourceId))
    require(transfer.title.isNotBlank() && transfer.title.length <= 100 && transfer.title.none { it.code < 32 })
    require(transfer.sport in listOf("football", "f1"))
    require(transfer.playedOn == null || isEventDate(transfer.playedOn))
    require(transfer.phraseIds.size in 1..3 && transfer.phraseIds.distinct().size == transfer.phraseIds.size)
    require(transfer.phraseIds.all { id -> PracticeCatalog.forSport(transfer.sport).any { it.id == id } })
    return transfer
}
