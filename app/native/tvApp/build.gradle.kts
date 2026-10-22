plugins { id("com.android.application"); kotlin("plugin.compose") }
android {
    namespace = "com.arenavoca.tv"
    compileSdk = 36
    defaultConfig {
        applicationId = "com.arenavoca.tv"
        minSdk = 29
        targetSdk = 36
        versionCode = 1
        versionName = "0.1.0"
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }
    buildFeatures { compose = true; buildConfig = true }
    sourceSets["main"].kotlin.srcDir("../../src/features/tv-learning/native/androidMain")
    sourceSets["main"].res.srcDir("../../src/features/tv-learning/res")
    sourceSets["main"].res.srcDir("../../src/features/recap/artwork/res")
    sourceSets["main"].res.srcDir("../../src/features/stories/artwork/res")
    sourceSets["main"].res.srcDir("../../src/features/branding/android/res")
    sourceSets["androidTest"].kotlin.srcDir("../../src/features/tv-learning/native/androidTest")
    // Explicit opt-in: this ignored folder is never part of a release build.
    if (providers.gradleProperty("tvAlba").orNull == "true") {
        sourceSets["debug"].res.srcDir("../local-media/tv/res")
    }
}
dependencies {
    implementation(project(":shared"))
    implementation("androidx.activity:activity-compose:1.13.0")
    implementation("androidx.compose.foundation:foundation:1.10.5")
    implementation("androidx.tv:tv-material:1.1.0")
    androidTestImplementation("androidx.compose.ui:ui-test-junit4:1.10.5")
    androidTestImplementation("androidx.test:runner:1.7.0")
    debugImplementation("androidx.compose.ui:ui-test-manifest:1.10.5")
}
