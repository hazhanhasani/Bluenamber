package ir.bluenumber.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.Surface
import androidx.compose.material3.ButtonDefaults
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.lifecycle.lifecycleScope
import ir.cafebazaar.poolakey.Connection
import ir.cafebazaar.poolakey.Payment
import ir.cafebazaar.poolakey.config.PaymentConfiguration
import ir.cafebazaar.poolakey.request.PurchaseRequest
import ir.cafebazaar.poolakey.config.SecurityCheck
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

data class CatalogProduct(val id: String, val sku: String, val title: String, val description: String)
data class CatalogState(val enabled: Boolean, val products: List<CatalogProduct>, val notice: String)
data class NumberType(val id: String, val title: String, val description: String)

class MainActivity : ComponentActivity() {
    private var billing: Payment? = null
    private var billingConnection: Connection? = null
    private var billingConnected by mutableStateOf(false)
    private var status by mutableStateOf("در حال بررسی اتصال ...")
    private var state by mutableStateOf(CatalogState(false, emptyList(), ""))
    private var numberTypes by mutableStateOf<List<NumberType>>(emptyList())

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.statusBarColor = android.graphics.Color.rgb(8, 46, 130)
        window.navigationBarColor = android.graphics.Color.rgb(8, 46, 130)

        setContent {
            MaterialTheme {
                Surface(Modifier.fillMaxSize(), color = Color(0xFFF4F7FC)) {
                    LazyColumn(
                        modifier = Modifier.fillMaxSize(),
                        contentPadding = PaddingValues(20.dp),
                        verticalArrangement = Arrangement.spacedBy(16.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        item {
                            Column(
                                modifier = Modifier.fillMaxWidth()
                                    .background(Color(0xFF073B93), RoundedCornerShape(28.dp))
                                    .padding(28.dp),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Text("BlueNumber", color = Color(0xFFAFE4FF), style = MaterialTheme.typography.labelLarge)
                                Spacer(Modifier.height(10.dp))
                                Text("بلونامبر", color = Color.White, fontWeight = FontWeight.ExtraBold,
                                    style = MaterialTheme.typography.headlineLarge)
                                Spacer(Modifier.height(8.dp))
                                Text("خدمات شماره مجازی", color = Color.White, style = MaterialTheme.typography.titleMedium)
                            }
                        }
                        item {
                            Card(Modifier.fillMaxWidth()) {
                                Column(Modifier.padding(20.dp)) {
                                    Text("وضعیت سرویس", fontWeight = FontWeight.Bold)
                                    Spacer(Modifier.height(8.dp))
                                    Text(status, modifier = Modifier.fillMaxWidth(), textAlign = TextAlign.Right)
                                    Spacer(Modifier.height(12.dp))
                                    Button(onClick = { refresh(); refreshNumberTypes() }) { Text("بروزرسانی") }
                                }
                            }
                        }
                        item {
                            Text("نوع شماره مجازی", fontWeight = FontWeight.Bold,
                                modifier = Modifier.fillMaxWidth(), textAlign = TextAlign.Right,
                                style = MaterialTheme.typography.titleLarge)
                        }
                        items(numberTypes) { type ->
                            Card(Modifier.fillMaxWidth()) {
                                Column(Modifier.padding(20.dp)) {
                                    Text(type.title, fontWeight = FontWeight.Bold,
                                        style = MaterialTheme.typography.titleMedium,
                                        modifier = Modifier.fillMaxWidth(), textAlign = TextAlign.Right)
                                    Spacer(Modifier.height(6.dp))
                                    Text(type.description, modifier = Modifier.fillMaxWidth(),
                                        textAlign = TextAlign.Right)
                                    Spacer(Modifier.height(8.dp))
                                    Text("در انتظار فعال‌سازی موجودی و پرداخت", color = Color(0xFF526789),
                                        style = MaterialTheme.typography.labelMedium,
                                        modifier = Modifier.fillMaxWidth(), textAlign = TextAlign.Right)
                                }
                            }
                        }
                        if (state.products.isEmpty()) {
                            item {
                                Card(Modifier.fillMaxWidth()) {
                                    Column(Modifier.padding(24.dp)) {
                                        Text("محصولات به‌زودی فعال می‌شوند", fontWeight = FontWeight.Bold)
                                        Spacer(Modifier.height(12.dp))
                                        Text("فهرست شماره‌ها بعد از اتصال و تأیید API کالینو نمایش داده می‌شود.")
                                    }
                                }
                            }
                        } else {
                            items(state.products) { product ->
                                Card(Modifier.fillMaxWidth()) {
                                    Column(Modifier.padding(20.dp)) {
                                        Text(product.title, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                                        Text(product.description)
                                        Spacer(Modifier.height(12.dp))
                                        Button(
                                            enabled = state.enabled && billingConnected,
                                            onClick = { purchase(product) }
                                        ) { Text("خرید از طریق کافه‌بازار") }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        connectBilling()
        refresh()
        refreshNumberTypes()
    }

    private fun connectBilling() {
        if (BuildConfig.BAZAAR_RSA_KEY.isBlank()) return
        val payment = Payment(
            context = this,
            config = PaymentConfiguration(localSecurityCheck = SecurityCheck.Enable(BuildConfig.BAZAAR_RSA_KEY))
        )
        billing = payment
        billingConnection = payment.connect {
            connectionSucceed { billingConnected = true }
            connectionFailed { billingConnected = false }
            disconnected { billingConnected = false }
        }
    }

    private fun refresh() {
        lifecycleScope.launch {
            try {
                val updated = withContext(Dispatchers.IO) {
                    val connection = URL(BuildConfig.API_BASE_URL + "/v1/catalog").openConnection() as HttpURLConnection
                    connection.connectTimeout = 10000
                    connection.readTimeout = 10000
                    connection.setRequestProperty("Accept", "application/json")
                    try {
                        val response = JSONObject(connection.inputStream.bufferedReader().use { it.readText() })
                        val items = response.optJSONArray("items")
                        val list = mutableListOf<CatalogProduct>()
                        if (items != null) for (i in 0 until items.length()) {
                            val product = items.getJSONObject(i)
                            list.add(CatalogProduct(
                                product.optString("id"), product.optString("sku"),
                                product.optString("title"), product.optString("description")
                            ))
                        }
                        CatalogState(response.optBoolean("available"), list, response.optString("notice"))
                    } finally { connection.disconnect() }
                }
                state = updated
                status = if (updated.enabled) "سرویس آماده است" else "اتصال اصلی در حال تکمیل است؛ خرید غیرفعال است."
            } catch (e: Exception) {
                status = "اتصال برقرار نشد. اتصال اینترنت را بررسی کنید."
            }
        }
    }

    private fun refreshNumberTypes() {
        lifecycleScope.launch {
            try {
                val types = withContext(Dispatchers.IO) {
                    val connection = URL(BuildConfig.API_BASE_URL + "/v1/number-types")
                        .openConnection() as HttpURLConnection
                    connection.connectTimeout = 10000
                    connection.readTimeout = 10000
                    connection.setRequestProperty("Accept", "application/json")
                    try {
                        val obj = JSONObject(connection.inputStream.bufferedReader().use { it.readText() })
                        val items = obj.getJSONArray("items")
                        buildList {
                            for (i in 0 until items.length()) {
                                val item = items.getJSONObject(i)
                                add(NumberType(
                                    item.getString("id"), item.getString("title"),
                                    item.optString("description")
                                ))
                            }
                        }
                    } finally { connection.disconnect() }
                }
                numberTypes = types
            } catch (e: Exception) {
                // Product categories can be retried without blocking the entire app.
                numberTypes = emptyList()
            }
        }
    }

    private fun purchase(product: CatalogProduct) {
        val payment = billing ?: return
        if (!state.enabled || !billingConnected) return
        payment.purchaseProduct(
            registry = activityResultRegistry,
            request = PurchaseRequest(productId = product.sku, payload = product.id)
        ) {
            purchaseSucceed { info ->
                // Never consume before server validation and fulfillment.
                verifyOnServer(product, info.purchaseToken)
            }
            purchaseCanceled { status = "خرید لغو شد." }
            purchaseFailed { status = "پرداخت انجام نشد؛ مجدداً تلاش کنید." }
            failedToBeginFlow { status = "درگاه کافه‌بازار در دسترس نیست." }
        }
    }

    private fun verifyOnServer(product: CatalogProduct, purchaseToken: String) {
        status = "در حال اعتبارسنجی خرید ..."
        lifecycleScope.launch {
            val verified = withContext(Dispatchers.IO) {
                try {
                    val url = URL(BuildConfig.API_BASE_URL + "/v1/purchases/verify")
                    val connection = url.openConnection() as HttpURLConnection
                    connection.requestMethod = "POST"
                    connection.doOutput = true
                    connection.connectTimeout = 10000
                    connection.readTimeout = 15000
                    connection.setRequestProperty("Content-Type", "application/json")
                    val payload = JSONObject().put("sku", product.sku).put("purchaseToken", purchaseToken)
                    try {
                        connection.outputStream.use { it.write(payload.toString().toByteArray(Charsets.UTF_8)) }
                        connection.responseCode == 202 || connection.responseCode == 200
                    } finally { connection.disconnect() }
                } catch (e: Exception) { false }
            }
            status = if (verified) "پرداخت تأیید شد؛ سفارش در انتظار تحویل است." else
                "اعتبارسنجی سرور انجام نشد؛ پرداخت را تکرار نکنید و با پشتیبانی تماس بگیرید."
        }
    }

    override fun onDestroy() {
        billingConnection?.disconnect()
        super.onDestroy()
    }
}
