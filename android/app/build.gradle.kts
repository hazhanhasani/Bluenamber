plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
}

android {
    namespace = "ir.bluenumber.app"
    compileSdk = 35

    defaultConfig {
        applicationId = "ir.bluenumber.app"
        minSdk = 24
        targetSdk = 35
        versionCode = 3
        versionName = "1.0.2"
        buildConfigField("String", "API_BASE_URL", "\"https://bluenamber.hazhanhasani4268-0f9.workers.dev\"")
        val rsaKey = (findProperty("bazaarRsaKey") as String?) ?: ""
        buildConfigField("String", "BAZAAR_RSA_KEY", "\"" + rsaKey.replace("\\", "\\\\").replace("\"", "\\\"") + "\"")
    }
    buildFeatures { compose = true; buildConfig = true }
    signingConfigs {
        create("stableRelease") {
            val path = System.getenv("KEYSTORE_FILE")
            if (!path.isNullOrBlank()) {
                storeFile = file(path)
                storePassword = System.getenv("KEYSTORE_PASSWORD")
                keyAlias = System.getenv("KEY_ALIAS")
                keyPassword = System.getenv("KEY_PASSWORD")
            }
        }
    }
    buildTypes {
        release {
            isMinifyEnabled = false
            if (!System.getenv("KEYSTORE_FILE").isNullOrBlank()) {
                signingConfig = signingConfigs.getByName("stableRelease")
            }
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions { jvmTarget = "17" }
}

dependencies {
    implementation(platform("androidx.compose:compose-bom:2025.04.01"))
    implementation("androidx.activity:activity-compose:1.10.1")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.9.0")
    implementation("com.github.cafebazaar.Poolakey:poolakey:2.2.0")
    debugImplementation("androidx.compose.ui:ui-tooling")
}
