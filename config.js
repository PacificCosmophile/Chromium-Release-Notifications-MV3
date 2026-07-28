// ============================================================
// config.js
// Shared configuration for background.js and popup.js
// ============================================================

// GitHub repositories that can be tracked.
const REPOSITORIES = {

    hibbiki: {
        name: "Hibbiki Chromium",
        owner: "Hibbiki",
        repo: "chromium-win64",
        platforms: ["win64"],
        versionStrategy: "tag"
    },

    helium: {
        name: "Helium",
        owner: "imputnet",
        repo: "helium-windows",
        platforms: ["win64"],
        versionStrategy: "releaseNotes"
    },

    supermium: {
        name: "Supermium",
        owner: "win32ss",
        repo: "supermium",
        platforms: ["win64", "win32"],
        versionStrategy: "releaseName"
    },

    thorium: {
        name: "Thorium",
        owner: "Alex313031",
        repo: "Thorium-Win",
        platforms: ["win64"],
        versionStrategy: "tag"
    },

    ungoogled: {
        name: "Ungoogled Chromium",
        owner: "macchrome",
        repo: "winchrome",
        platforms: ["win64"],
        versionStrategy: "tag"
    }

};

// Platform options shown during setup.
const PLATFORMS = [

    {
        id: "win64",
        name: "Windows 64"
    },

    {
        id: "win32",
        name: "Windows 32"
    }

];

// Default settings.
const DEFAULT_SETTINGS = {

    configured: false,

    platform: "",

    repository: ""

};

// How often background.js checks for updates.
const CHECK_INTERVAL_MINUTES = 60;

// Alarm name used by background.js.
const CHECK_ALARM = "check-updates";
