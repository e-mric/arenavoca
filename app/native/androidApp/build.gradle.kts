plugins { id("com.android.application"); kotlin("plugin.compose") }
android {
    namespace = "com.arenavoca.mobile"
    compileSdk = 36
    defaultConfig { applicationId = "com.arenavoca.mobile"; minSdk = 29; targetSdk = 36; versionCode = 1; versionName = "0.1.0"; testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner" }
    buildFeatures { compose = true }
    sourceSets["main"].res.srcDir("../../src/features/recap/artwork/res")
    sourceSets["main"].res.srcDir("../../src/features/branding/android/res")
    sourceSets["main"].res.srcDir("../../src/features/stories/artwork/res")
    sourceSets["debug"].res.srcDir("../local-media/res")
    sourceSets["main"].kotlin.srcDir("../../src/features/recap/native/androidMain")
    sourceSets["main"].kotlin.srcDir("../../src/features/stories/native/androidMain")
    sourceSets["androidTest"].kotlin.srcDir("../../src/features/recap/native/androidTest")
    sourceSets["androidTest"].kotlin.srcDir("../../src/features/stories/native/androidTest")
}
dependencies {
    implementation(project(":shared"))
    androidTestImplementation("androidx.compose.ui:ui-test-junit4:1.10.5")
    androidTestImplementation("androidx.test:runner:1.7.0")
    debugImplementation("androidx.compose.ui:ui-test-manifest:1.10.5")
    implementation("androidx.activity:activity-compose:1.13.0")
    implementation("androidx.compose.material3:material3:1.4.0")
}
