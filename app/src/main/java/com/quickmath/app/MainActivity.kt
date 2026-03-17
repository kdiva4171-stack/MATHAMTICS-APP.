package com.quickmath.app

import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import com.quickmath.app.data.PreferencesManager
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {
    
    private lateinit var prefs: PreferencesManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        prefs = PreferencesManager(this)

        setContent {
            val context = LocalContext.current
            val scope = rememberCoroutineScope()
            val strictMode by prefs.strictMode.collectAsState(initial = false)
            
            var showOverlayDialog by remember { mutableStateOf(false) }
            var showBackgroundDialog by remember { mutableStateOf(false) }

            Surface(modifier = Modifier.fillMaxSize()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Quick Math Native", style = MaterialTheme.typography.headlineMedium)
                    
                    Spacer(modifier = Modifier.height(20.dp))
                    
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Strict Mode (Premium)")
                        Switch(
                            checked = strictMode,
                            onCheckedChange = { checked ->
                                if (checked) {
                                    // Check for Overlay Permission
                                    if (!Settings.canDrawOverlays(context)) {
                                        showOverlayDialog = true
                                    } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                                        // Check for Battery Optimization
                                        showBackgroundDialog = true
                                    } else {
                                        scope.launch { prefs.setStrictMode(true) }
                                    }
                                } else {
                                    scope.launch { prefs.setStrictMode(false) }
                                }
                            }
                        )
                    }
                }
            }

            // Overlay Permission Dialog
            if (showOverlayDialog) {
                AlertDialog(
                    onDismissRequest = { showOverlayDialog = false },
                    title = { Text("Overlay Permission Required") },
                    text = { Text("To enable Strict Mode, Quick Math needs to draw over other apps.") },
                    confirmButton = {
                        Button(onClick = {
                            val intent = Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:$packageName"))
                            startActivity(intent)
                            showOverlayDialog = false
                        }) { Text("Grant") }
                    }
                )
            }

            // Background Activity Dialog
            if (showBackgroundDialog) {
                AlertDialog(
                    onDismissRequest = { showBackgroundDialog = false },
                    title = { Text("Background Activity") },
                    text = { Text("Please allow Quick Math to run in the background for a seamless experience.") },
                    confirmButton = {
                        Button(onClick = {
                            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                                val intent = Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS)
                                startActivity(intent)
                            }
                            showBackgroundDialog = false
                            scope.launch { prefs.setStrictMode(true) }
                        }) { Text("Grant") }
                    }
                )
            }
        }
    }
}
