pluginManagement { repositories { google(); mavenCentral(); gradlePluginPortal() } }
dependencyResolutionManagement { repositories { google(); mavenCentral() } }
rootProject.name = "ArenaVocaNative"
include(":shared", ":androidApp", ":tvApp")
