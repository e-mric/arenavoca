package com.arenavoca.mobile

import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.res.painterResource

@Composable internal fun CompactBack(label: String, onClick: () -> Unit) {
    IconButton(onClick = onClick) { Icon(painterResource(R.drawable.ic_nav_back), contentDescription = label) }
}
