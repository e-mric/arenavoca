plugins {
    kotlin("multiplatform")
    kotlin("plugin.serialization")
    id("com.android.kotlin.multiplatform.library")
}
kotlin {
    android { namespace = "com.arenavoca.shared"; compileSdk = 36; minSdk = 29 }
    jvm()
    listOf(iosArm64(), iosSimulatorArm64()).forEach { target ->
        target.binaries.framework { baseName = "ArenaVocaShared"; isStatic = true }
    }
    sourceSets {
        commonMain {
            kotlin.srcDir("../../src/features/tv-learning/native/commonMain")
            kotlin.srcDir("../../src/features/recap/native/commonMain")
            kotlin.srcDir("../../src/features/stories/native/commonMain")
            dependencies { implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.9.0") }
        }
        commonTest {
            kotlin.srcDir("../../src/features/tv-learning/native/commonTest")
            kotlin.srcDir("../../src/features/recap/native/commonTest")
            kotlin.srcDir("../../src/features/stories/native/commonTest")
            dependencies { implementation(kotlin("test")) }
        }
        jvmTest {
            kotlin.srcDir("../../src/features/recap/native/jvmTest")
            resources.srcDir("../../src/features/recap/fixtures")
        }
    }
}
