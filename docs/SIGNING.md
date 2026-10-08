# Permanent Android signing key

The package ID is fixed: `ir.bluenumber.app`. The signing key must also remain unchanged for all upgrades.

Never commit a private `.jks` file, password, or base64 copy. Store at least two encrypted offline backups. If the original signing key is lost, an APK signed by a new key normally cannot update the installed app.

GitHub Actions release secrets:
- `KEYSTORE_BASE64`: base64 of the original binary `release.jks`
- `KEYSTORE_PASSWORD`
- `KEY_ALIAS`
- `KEY_PASSWORD`

Android build uses these secrets only for the release workflow. Run workflow `Android CI` manually to create the signed APK and Android App Bundle. Record the SHA-256 certificate fingerprint and compare it for every release using `apksigner verify --print-certs path/to/app-release.apk`.

DO NOT publish a release signed by the default debug key.

Cafe Bazaar's PUBLIC RSA billing key is a separate key; it is not the APK signing certificate.

## BlueNumber original release certificate

Certificate SHA-256: `17:4A:64:3D:95:D7:46:FA:C3:45:29:2C:31:DB:0B:53:E5:ED:9A:9F:11:38:6E:22:7D:7C:DD:15:20:FE:2B:AB`

Compare this fingerprint before publishing every new version; it identifies the permanently created release key.
