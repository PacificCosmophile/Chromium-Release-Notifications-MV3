importScripts('config.js');

// Optional GitHub Personal Access Token.
// Leave empty to use GitHub's public API (60 requests/hour).
// Add your own Fine-grained Personal Access Token here to increase the limit to 5,000 requests/hour.
const GITHUB_PAT = "";



// --- helpers --------------------------------------------------------

async function getCurrentChromeVersion() {

    // Prefer the full browser version.
    if (navigator.userAgentData?.getHighEntropyValues) {

        try {

            const data = await navigator.userAgentData.getHighEntropyValues([
                "fullVersionList"
            ]);

            const chromium = data.fullVersionList.find(
                b => b.brand === "Chromium" || b.brand === "Google Chrome"
            );

            if (chromium) {
                return chromium.version;
            }

        } catch (e) {
            console.warn("Unable to read full browser version:", e);
        }

    }

    // Fallback
    const match = navigator.userAgent.match(/Chrom(?:e|ium)\/([\d.]+)/);

    return match ? match[1] : null;

}

function isNewerVersion(latest, current) {

    if (!latest || !current) {
        return false;
    }

    // Remove everything except digits and dots.
    latest = latest.trim().replace(/[^\d.]/g, "");
    current = current.trim().replace(/[^\d.]/g, "");

    const latestParts = latest
        .split(".")
        .filter(Boolean)
        .map(Number);

    const currentParts = current
        .split(".")
        .filter(Boolean)
        .map(Number);

    const length = Math.max(latestParts.length, currentParts.length);

    for (let i = 0; i < length; i++) {

        const a = latestParts[i] || 0;
        const b = currentParts[i] || 0;

        if (a > b) return true;
        if (a < b) return false;

    }

    return false;

}

async function getSettings() {

    const {
        settings
    } =
    await chrome.storage.local.get(["settings"]);

    return {

        ...DEFAULT_SETTINGS,

        ...(settings || {})

    };

}

// --- GitHub Latest Release check -----------------------------------

async function fetchGitHubRelease(repository) {

    const repoInfo = REPOSITORIES[repository];

    if (!repoInfo) {
        throw new Error("Repository not configured");
    }

    const {
        owner,
        repo
    } = repoInfo;

    const controller = new AbortController();

    const timeout = setTimeout(() => controller.abort(), 10000);

    const headers = {

        Accept: "application/vnd.github+json"

    };

    if (GITHUB_PAT) {

        headers.Authorization = `Bearer ${GITHUB_PAT}`;

    }

    try {

        const response = await fetch(

            `https://api.github.com/repos/${owner}/${repo}/releases/latest`,

            {
                cache: "no-store",
                signal: controller.signal,
                headers
            }

        );

        if (!response.ok) {

            throw new Error(`GitHub API returned ${response.status}`);

        }

        return await response.json();

    } finally {

        clearTimeout(timeout);

    }

}

function extractChromiumVersionFromReleaseNotes(body) {

    if (!body) {
        return null;
    }

    // Find every "Update to Chromium x.x.x.x"
    const matches = [
        ...body.matchAll(
            /update\s+to\s+chromium\s+(\d+\.\d+\.\d+\.\d+)/gi
        )
    ];

    if (!matches.length) {
        return null;
    }

    // Return the LAST Chromium version mentioned.
    return matches[matches.length - 1][1];

}

function extractLatestVersion(repoInfo, latest) {

    switch (repoInfo.versionStrategy) {

        case "releaseNotes": {

            const chromiumVersion =
                extractChromiumVersionFromReleaseNotes(latest.body);

            return {

                compareVersion: chromiumVersion,

                displayVersion: latest.tag_name

            };

        }

        case "releaseName": {

            const match = latest.name.match(
                /(\d+\.\d+\.\d+\.\d+)\s+(R[\d.]+)/i
            );

            if (match) {

                return {

                    compareVersion: match[1],

                    displayVersion: `${match[1]} (${match[2]})`

                };

            }

            return {

                compareVersion: latest.tag_name,

                displayVersion: latest.tag_name

            };

        }

        case "tag":
        default: {

            let compareVersion = latest.tag_name;
            let displayVersion = latest.tag_name;

            // Hibbiki Chromium & Ungoogled Chromium use tags like:
            // v150.0.7871.129-r1639810
            if (
                repoInfo.owner === "Hibbiki" ||
                repoInfo.owner === "macchrome"
            ) {
                compareVersion = compareVersion.split("-")[0];
                displayVersion = displayVersion.replace(/^v/i, "");
            }

            return {

                compareVersion,

                displayVersion

            };

        }

    }

}

async function checkChromiumBuild() {
    const settings = await getSettings();
    const currentVersion = await getCurrentChromeVersion();

    try {
        const latest = await fetchGitHubRelease(settings.repository);
        const repoInfo = REPOSITORIES[settings.repository];

        const {
            compareVersion,
            displayVersion
        } = extractLatestVersion(repoInfo, latest);

        const cannotDetermine = !compareVersion;

        return {
            currentVersion,
            latestVersion: displayVersion,
            build: "",
            date: latest.published_at,
            link: `https://github.com/${repoInfo.owner}/${repoInfo.repo}`,
            releaseLink: latest.html_url,
            tracking: repoInfo ? repoInfo.name : "Unknown",
            isNew: cannotDetermine ?
                false :
                isNewerVersion(compareVersion, currentVersion),
            unknownVersion: cannotDetermine,
            error: null
        };
    } catch (err) {

        if (err.name === "AbortError") {
            err = new Error("Request timed out");
        }
        return {
            currentVersion,
            latestVersion: null,
            build: null,
            date: null,
            link: null,
            releaseLink: null,
            tracking: "Unknown",
            isNew: false,
            error: err.message
        };
    }
}


// --- Orchestration ----------------------------------------------------

async function checkAll() {

    const chromium = await checkChromiumBuild();

    const lastCheck = Date.now();

    await chrome.storage.local.set({
        chromium,
        lastCheck
    });

    updateBadge(chromium.isNew);

    const settings = await getSettings();

    return {
        chromium,
        settings,
        lastCheck
    };

}

function updateBadge(hasNew) {
    if (hasNew) {
        chrome.action.setBadgeText({
            text: 'New'
        });
        chrome.action.setBadgeBackgroundColor({
            color: '#1a73e8'
        });
    } else {
        chrome.action.setBadgeText({
            text: ''
        });
    }
}

// --- Lifecycle ----------------------------------------------------------

chrome.runtime.onInstalled.addListener(async () => {
    const {
        settings
    } = await chrome.storage.local.get(['settings']);
    if (!settings) {
        await chrome.storage.local.set({
            settings: DEFAULT_SETTINGS
        });
    }
    chrome.alarms.create(CHECK_ALARM, {
        periodInMinutes: CHECK_INTERVAL_MINUTES
    });
    checkAll();
});

// Fires whenever Chrome (re)starts — "whenever I open the browser".
chrome.runtime.onStartup.addListener(() => {
    chrome.alarms.create(CHECK_ALARM, {
        periodInMinutes: CHECK_INTERVAL_MINUTES
    });

    checkAll();
});

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === CHECK_ALARM) checkAll();
});

// --- Messages from the popup --------------------------------------------

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg?.type === "GET_STATUS") {

        (async () => {

            const {
                chromium,
                lastCheck
            } =
            await chrome.storage.local.get([
                "chromium",
                "lastCheck"
            ]);

            const settings = await getSettings();

            sendResponse({
                chromium,
                lastCheck,
                settings
            });

        })();

        return true;

    }

    if (msg?.type === 'CHECK_NOW') {
        checkAll().then((data) => sendResponse({
            ok: true,
            ...data
        }));
        return true;
    }

    if (msg?.type === "SAVE_CONFIGURATION") {

        (async () => {

            if (!REPOSITORIES[msg.repository]) {

                sendResponse({

                    ok: false,

                    error: "Invalid repository"

                });

                return;

            }

            const next = {

                configured: true,

                platform: msg.platform,

                repository: msg.repository

            };

            await chrome.storage.local.set({
                settings: next
            });

            const data = await checkAll();

            sendResponse({

                ok: true,

                settings: next,

                ...data

            });

        })();

        return true;
    }


});
