<div align="center">

<img src="https://raw.githubusercontent.com/PacificCosmophile/Chromium-Release-Notifications-MV3/main/icon.png" width="128" alt="Chromium Release Notifications MV3">

# Chromium Release Notifications

[![Manifest V3](https://img.shields.io/badge/Manifest-V3-1a73e8)](https://developer.chrome.com/docs/extensions/develop/migrate/what-is-mv3)
[![Platform](https://img.shields.io/badge/Platform-Chromium-34a853)](https://www.chromium.org/Home/)
[![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)

**A lightweight Chromium extension that tracks the latest releases of selected Chromium-based browsers hosted on GitHub and compares them with your installed browser version.**

*Designed to be simple, fast, and privacy-friendly.*

</div>

---

## 📸 Screenshots

<div align="center">

<table>
  <tr>
    <td align="center" width="50%">
      <b>🔔 Fresh Install Interface</b>
      <br><br>
      <picture>
        <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/PacificCosmophile/Chromium-Release-Notifications-MV3/main/screenshots/ss_1_dark.png">
        <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/PacificCosmophile/Chromium-Release-Notifications-MV3/main/screenshots/ss_1_light.png">
        <img alt="Main Interface" src="https://raw.githubusercontent.com/PacificCosmophile/Chromium-Release-Notifications-MV3/main/screenshots/ss_1_dark.png" width="100%">
      </picture>
    </td>
    <td align="center" width="50%">
      <b>⚙️ Dashboard & Settings</b>
      <br><br>
      <picture>
        <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/PacificCosmophile/Chromium-Release-Notifications-MV3/main/screenshots/ss_2_dark.png">
        <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/PacificCosmophile/Chromium-Release-Notifications-MV3/main/screenshots/ss_2_light.png">
        <img alt="Detailed View" src="https://raw.githubusercontent.com/PacificCosmophile/Chromium-Release-Notifications-MV3/main/screenshots/ss_2_dark.png" width="100%">
      </picture>
    </td>
  </tr>
</table>

</div>

---

## Installation

### From Source

1. Download (Green <> Code Dropdown button >> Download ZIP) or clone this repository ```git clone https://github.com/PacificCosmophile/Chromium-Release-Notifications-MV3.git```

2. Unzip it.
3. Open your Chromium-based browser.
4. Navigate to `chrome://extensions`.
5. Enable **Developer mode**.
6. Click **Load unpacked**.
7. Select the extension folder.

The extension is now ready to use.

---

## Permissions

The extension only requests the minimum permissions required for its functionality.

| Permission | Purpose |
|------------|---------|
| `storage` | Saves your selected browser repository and preferences locally. |
| `alarms` | Performs automatic background update checks every hour. |
| `https://api.github.com/*` | Reads public release information from GitHub. |

No additional permissions are requested.

---

## Supported Projects

| Project | Version Detection |
|---------|-------------------|
| [Hibbiki Chromium](https://github.com/Hibbiki/chromium-win64) | Git tag |
| [Helium](https://github.com/imputnet/helium-windows) | Release notes |
| [Supermium](https://github.com/win32ss/supermium) | Release name |
| [Thorium](https://github.com/Alex313031/Thorium-Win) | Git tag |
| [Ungoogled Chromium](https://github.com/macchrome/winchrome) | Git tag |

---

## How It Works

The extension:

1. Detects your installed Chromium version.
2. Fetches the latest release from the selected GitHub repository.
3. Extracts the corresponding Chromium version using the appropriate strategy for that project.
4. Compares both versions.
5. Displays one of the following statuses:

- ✅ Up to date
- 🟡 Update available
- ⚪ Unable to determine
- 🔴 Error

Automatic checks run every hour. You can also perform a manual check at any time from the popup.

GitHub limits API calls at 60 requests/hour/IP. Which is more than enough for a normal user.

But if you want (for development puposes) you can increase the limit using Fine-grained Personal access tokens.

Create a token >>> <br>
GitHub settings > Developer settings > Personal access tokens > Fine grain tokens > Generate a new toke

Insert the token in `background.js` >>>

```bash
// Optional GitHub Personal Access Token.
// Leave empty to use GitHub public API (60 requests/hour).
// Add your own Fine-grained Personal Access Token here to increase the limit to 5,000 requests/hour.
const GITHUB_PAT = "your-token";
```

Presently there are 2 edge cases for [![Helium Browser Badge](https://img.shields.io/badge/Helium%20Browser-3450D1?logo=heliumbrowser&logoColor=fff&style=flat)](https://github.com/imputnet/helium-windows) and [Supermium](https://github.com/win32ss/supermium)

- Helium uses its own version number at both "Release Name" & "Release Tag" <br>
  - So the extension derives the latest Chromium version from "Release Notes". <br>
  - If there is no mention of latest Chromium version the extension will show "Unable to determine"
  - If the author releases a new Helium version with the same Chromium version (as the last release) then the extension will not show "Update available" 

- If the author releases a new Supermium version with the same Chromium version (as the last release) then the extension will not show "Update available"

Only robust solution (as per my thinking) is baseline-method. By introducing a manual "I have updated" check.

In that case the extension will only check for latest GitHub release > Shows notification > If user clicks "I have updated" > Extension remembers that

But that is v2.0 and it will take full redesigning of the current logic.
  
---

## Privacy

Chromium Release Notifications is completely local and does not collect any personal information.

It:

- Does **not** collect user data.
- Does **not** use analytics or telemetry.
- Does **not** require an account.
- Does **not** send data to any server other than the public GitHub API.

Your settings remain stored locally in your browser.

---

## Building

Clone the repository:

```bash
git clone https://github.com/PacificCosmophile/Chromium-Release-Notifications-MV3.git
```

Load the project as an unpacked extension from:

```
chrome://extensions
```

To create a distributable package:

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Pack extension**
4. Select the project folder

Chrome will generate:

- `.crx` — Installable extension package
- `.pem` — Private signing key (keep this file safe)

The same `.pem` must be used for future releases to preserve the extension ID.

---

## Acknowledgements

This project is inspired by the original **[Chromium Notifier](https://github.com/kkkrist/chromium-notifier)** extension created by **[kkkrist](https://github.com/kkkrist)**.

While this extension has been completely rewritten for **Manifest V3** with a redesigned interface, simplified architecture, and support for multiple Chromium-based browser projects, the original project served as the initial inspiration.

Many thanks to **[kkkrist](https://github.com/kkkrist)** for creating and open-sourcing the original extension.

---

## License

Released under the **[MIT License](https://github.com/PacificCosmophile/Chromium-Release-Notifications-MV3/blob/main/LICENSE)**.
