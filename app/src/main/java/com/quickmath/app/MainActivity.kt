package com.quickmath.app

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.provider.Settings
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
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
            val onboarded by prefs.onboarded.collectAsState(initial = false)
            val isSessionActive by prefs.isSessionActive.collectAsState(initial = false)
            var currentScreen by remember { mutableStateOf(if (onboarded) "home" else "onboarding") }

            MaterialTheme {
                Surface(color = Color.White) {
                    when (currentScreen) {
                        "home" -> HomeScreen(
                            isSessionActive = isSessionActive,
                            onToggleSession = { scope.launch { prefs.updateSetting(PreferencesManager.IS_SESSION_ACTIVE, !isSessionActive) } },
                            onSettings = { currentScreen = "settings" },
                            onAbout = { currentScreen = "about" }
                        )
                        "settings" -> SettingsScreen(
                            prefs = prefs,
                            onBack = { currentScreen = "home" }
                        )
                        "about" -> AboutScreen(onBack = { currentScreen = "home" })
                        "onboarding" -> OnboardingScreen(onFinish = {
                            scope.launch { 
                                prefs.updateSetting(PreferencesManager.ONBOARDED, true)
                                currentScreen = "home"
                            }
                        })
                    }
                }
            }
        }
    }
}

@Composable
fun HomeScreen(
    isSessionActive: Boolean,
    onToggleSession: () -> Unit,
    onSettings: () -> Unit,
    onAbout: () -> Unit
) {
    val context = LocalContext.current
    var lastTapTime by remember { mutableStateOf(0L) }

    Column(modifier = Modifier.fillMaxSize().padding(24.dp)) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier.size(48.dp).clip(RoundedCornerShape(12.dp)).background(Color(0xFF6366F1)),
                    contentAlignment = Alignment.Center
                ) {
                    Text("QM", color = Color.White, fontWeight = FontWeight.Bold)
                }
                Spacer(modifier = Modifier.width(12.dp))
                Text("Quick Math", fontSize = 20.sp, fontWeight = FontWeight.Bold)
            }
            IconButton(onClick = onSettings) { Icon(Icons.Default.Settings, contentDescription = null) }
        }

        Spacer(modifier = Modifier.weight(1f))

        Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.fillMaxWidth()) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(80.dp)
                    .clip(RoundedCornerShape(40.dp))
                    .background(if (isSessionActive) Color(0xFFF43F5E) else Color(0xFF6366F1))
                    .clickable { onToggleSession() },
                contentAlignment = Alignment.Center
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(if (isSessionActive) Icons.Default.Stop else Icons.Default.PlayArrow, contentDescription = null, color = Color.White)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(if (isSessionActive) "Stop Session" else "Start Session", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 18.sp)
                }
            }
            Text(
                text = if (isSessionActive) "Tap to stop" else "Tap to start",
                color = Color.Gray,
                fontSize = 12.sp,
                modifier = Modifier.padding(top = 8.dp)
            )
        }

        Spacer(modifier = Modifier.weight(1f))

        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            HomeCard(Icons.Default.Share, "Share", modifier = Modifier.weight(1f)) {
                val intent = Intent(Intent.ACTION_SEND).apply {
                    type = "text/plain"
                    putExtra(Intent.EXTRA_TEXT, "Check out Quick Math! Train your mind daily.")
                }
                context.startActivity(Intent.createChooser(intent, "Share via"))
            }
            HomeCard(Icons.Default.Mail, "Contact", modifier = Modifier.weight(1f)) {
                val intent = Intent(Intent.ACTION_SENDTO).apply {
                    data = Uri.parse("mailto:diwaaakarrr@gmail.com")
                    putExtra(Intent.EXTRA_SUBJECT, "Quick Math Feedback")
                }
                context.startActivity(intent)
            }
        }
        Spacer(modifier = Modifier.height(12.dp))
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            HomeCard(Icons.Default.Feedback, "Feedback", modifier = Modifier.weight(1f)) {
                val intent = Intent(Intent.ACTION_SENDTO).apply {
                    data = Uri.parse("mailto:diwaaakarrr@gmail.com")
                }
                context.startActivity(intent)
            }
            HomeCard(Icons.Default.Info, "About", modifier = Modifier.weight(1f), onClick = onAbout)
        }
    }
}

@Composable
fun HomeCard(icon: androidx.compose.ui.graphics.vector.ImageVector, label: String, modifier: Modifier = Modifier, onClick: () -> Unit = {}) {
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(24.dp))
            .background(Color(0xFFF9FAFB))
            .clickable(onClick = onClick)
            .padding(24.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Icon(icon, contentDescription = null, tint = Color(0xFF6366F1))
            Spacer(modifier = Modifier.height(8.dp))
            Text(label, fontWeight = FontWeight.Bold, color = Color.DarkGray)
        }
    }
}

@Composable
fun SettingsScreen(prefs: PreferencesManager, onBack: () -> Unit) {
    val scope = rememberCoroutineScope()
    val sessionDuration by prefs.sessionDuration.collectAsState(initial = 5)
    val cardFrequency by prefs.cardFrequency.collectAsState(initial = 3)
    val funPopups by prefs.funPopups.collectAsState(initial = false)
    val breatheEnabled by prefs.breatheEnabled.collectAsState(initial = false)
    val breatheDuration by prefs.breatheDuration.collectAsState(initial = 6)
    val breatheHold by prefs.breatheHold.collectAsState(initial = 2)

    Column(modifier = Modifier.fillMaxSize()) {
        Row(modifier = Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
            IconButton(onClick = onBack) { Icon(Icons.Default.ChevronLeft, contentDescription = null) }
            Text("Settings", fontSize = 24.sp, fontWeight = FontWeight.Bold)
        }

        LazyColumn(modifier = Modifier.fillMaxSize().padding(horizontal = 24.dp)) {
            item {
                Text("SESSION", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color.Gray, modifier = Modifier.padding(bottom = 12.dp))
                SettingRow("Session Duration", "${sessionDuration} min") {
                    scope.launch { prefs.updateSetting(PreferencesManager.SESSION_DURATION, if (sessionDuration >= 60) 5 else sessionDuration + 5) }
                }
                SettingRow("One card every", "${cardFrequency} minutes") {
                    scope.launch { prefs.updateSetting(PreferencesManager.CARD_FREQUENCY, if (cardFrequency >= 10) 1 else cardFrequency + 1) }
                }
                SettingRow("More Settings", "") {
                    // Placeholder
                }
                Spacer(modifier = Modifier.height(24.dp))
            }

            item {
                Text("DEEP-BREATHE CARDS", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color.Gray, modifier = Modifier.padding(bottom = 12.dp))
                ToggleRow("Enable Breathe", breatheEnabled) {
                    scope.launch { prefs.updateSetting(PreferencesManager.BREATHE_ENABLED, !breatheEnabled) }
                }
                if (breatheEnabled) {
                    Spacer(modifier = Modifier.height(12.dp))
                    Text("Breathe In/Out Duration", fontSize = 14.sp, color = Color.DarkGray)
                    Row(modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        listOf(6, 8, 10).forEach { sec ->
                            ChoiceChip(label = "${sec}s", isSelected = breatheDuration == sec) {
                                scope.launch { prefs.updateSetting(PreferencesManager.BREATHE_DURATION, sec) }
                            }
                        }
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("Hold/Break Duration", fontSize = 14.sp, color = Color.DarkGray)
                    Row(modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        listOf(2, 3, 4).forEach { sec ->
                            ChoiceChip(label = "${sec}s", isSelected = breatheHold == sec) {
                                scope.launch { prefs.updateSetting(PreferencesManager.BREATHE_HOLD, sec) }
                            }
                        }
                    }
                }
                Spacer(modifier = Modifier.height(24.dp))
            }

            item {
                Text("FUN POP-UPS", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color.Gray, modifier = Modifier.padding(bottom = 12.dp))
                ToggleRow("Enable Pop-ups", funPopups) {
                    scope.launch { prefs.updateSetting(PreferencesManager.FUN_POPUPS, !funPopups) }
                }
                Spacer(modifier = Modifier.height(40.dp))
            }
        }
    }
}

@Composable
fun SettingRow(label: String, value: String, onClick: () -> Unit) {
    Row(
        modifier = Modifier.fillMaxWidth().padding(vertical = 12.dp).clickable(onClick = onClick),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(label, fontSize = 18.sp, fontWeight = FontWeight.Medium)
        Text(value, color = Color(0xFF6366F1), fontWeight = FontWeight.Bold)
    }
}

@Composable
fun ToggleRow(label: String, checked: Boolean, onToggle: () -> Unit) {
    Row(
        modifier = Modifier.fillMaxWidth().padding(vertical = 12.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(label, fontSize = 18.sp, fontWeight = FontWeight.Medium)
        Switch(checked = checked, onCheckedChange = { onToggle() })
    }
}

@Composable
fun ChoiceChip(label: String, isSelected: Boolean, onClick: () -> Unit) {
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(12.dp))
            .background(if (isSelected) Color(0xFF6366F1) else Color(0xFFF3F4F6))
            .clickable(onClick = onClick)
            .padding(horizontal = 20.dp, vertical = 10.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(label, color = if (isSelected) Color.White else Color.DarkGray, fontWeight = FontWeight.Bold)
    }
}

@Composable
fun AboutScreen(onBack: () -> Unit) {
    Column(modifier = Modifier.fillMaxSize().padding(24.dp), horizontalAlignment = Alignment.CenterHorizontally) {
        Row(modifier = Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
            IconButton(onClick = onBack) { Icon(Icons.Default.ChevronLeft, contentDescription = null) }
            Text("About Us", fontSize = 24.sp, fontWeight = FontWeight.Bold)
        }
        Spacer(modifier = Modifier.height(40.dp))
        Box(modifier = Modifier.size(80.dp).clip(RoundedCornerShape(20.dp)).background(Color(0xFF6366F1)), contentAlignment = Alignment.Center) {
            Text("QM", color = Color.White, fontSize = 32.sp, fontWeight = FontWeight.Bold)
        }
        Spacer(modifier = Modifier.height(16.dp))
        Text("Quick Math", fontSize = 28.sp, fontWeight = FontWeight.Bold)
        Text("Version 1.0.0", color = Color.Gray)
        Spacer(modifier = Modifier.height(32.dp))
        Text("Made with care for your mind.", color = Color.Gray, fontSize = 14.sp)
    }
}

@Composable
fun OnboardingScreen(onFinish: () -> Unit) {
    Column(modifier = Modifier.fillMaxSize().padding(32.dp), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Center) {
        Icon(Icons.Default.Shield, contentDescription = null, modifier = Modifier.size(80.dp), tint = Color(0xFF6366F1))
        Spacer(modifier = Modifier.height(24.dp))
        Text("Privacy Matters", fontSize = 32.sp, fontWeight = FontWeight.Bold)
        Spacer(modifier = Modifier.height(12.dp))
        Text("Quick Math works entirely on your device. No data is collected or shared.", textAlign = androidx.compose.ui.text.style.TextAlign.Center, color = Color.Gray)
        Spacer(modifier = Modifier.height(48.dp))
        Button(onClick = onFinish, modifier = Modifier.fillMaxWidth().height(60.dp), shape = RoundedCornerShape(30.dp)) {
            Text("Accept & Continue", fontSize = 18.sp, fontWeight = FontWeight.Bold)
        }
    }
}
