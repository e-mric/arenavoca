package com.arenavoca.mobile

import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.platform.LocalContext
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

@Composable
internal fun ImportRecap(onImport: (String) -> Unit, onError: (String) -> Unit) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var busy by remember { mutableStateOf(false) }
    val picker = rememberLauncherForActivityResult(ActivityResultContracts.OpenDocument()) { uri ->
        if (uri != null) scope.launch {
            busy = true
            val result = withContext(Dispatchers.IO) {
                runCatching {
                    context.contentResolver.openInputStream(uri)!!.use { input ->
                        val bytes = ByteArray(32_769)
                        var size = 0
                        while (size < bytes.size) {
                            val read = input.read(bytes, size, bytes.size - size)
                            if (read <= 0) break
                            size += read
                        }
                        require(size <= 32_768)
                        bytes.decodeToString(0, size, throwOnInvalidSequence = true)
                    }
                }
            }
            busy = false
            result.fold(onImport, { onError("Could not read this recap file. Choose an ArenaVoca export smaller than 32 KB.") })
        }
    }
    OutlinedButton(onClick = { picker.launch(arrayOf("application/json", "text/plain", "application/octet-stream")) }, enabled = !busy) {
        Text(if (busy) "Reading recap…" else "Import saved phrases")
    }
}
