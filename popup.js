function renderChromium(chromium, settings) {

    const platformName =
        settings.platform === "win64" ?
        "Windows 64" :
        "Windows 32";

    const repository = document.getElementById("repositoryName");

    repository.textContent = chromium.tracking || "—";
    repository.href = chromium.link || "#";

    document.getElementById("platformName").textContent = platformName;

    document.getElementById("installedVersion").textContent =
        chromium.currentVersion || "—";

    const latestVersion = document.getElementById("latestVersion");

    latestVersion.textContent = chromium.latestVersion || "—";
    latestVersion.href = chromium.releaseLink || "#";

    const status = document.getElementById("statusText");

    // Reset previous status class
    status.className = "status";

    if (chromium.error) {

        status.textContent = "Error";
        status.classList.add("error");

    } else if (chromium.unknownVersion) {

        status.textContent = "Unable to determine";

    } else if (chromium.isNew) {

        status.textContent = "Update available";
        status.classList.add("update");

    } else {

        status.textContent = "Up to date";
        status.classList.add("up-to-date");

    }

    document.getElementById("chromiumError").textContent =
        chromium.error || "";

}


function populateSettingsSelects(
    settings,
    platformId = "platformSelect",
    repositoryId = "repositorySelect",
    isDashboard = false
) {

    const platform = document.getElementById(platformId);
    const repository = document.getElementById(repositoryId);


    platform.value = settings.platform || "";

    function refreshTags() {

        repository.innerHTML = "";

        if (platform.value === "") {

            repository.disabled = true;

            repository.innerHTML =
                '<option value="">Choose platform first</option>';



            return;

        }



        repository.disabled = false;

        const repos = Object.entries(REPOSITORIES).filter(
            ([, info]) => info.platforms.includes(platform.value)
        );

        if (repos.length === 0) {

            repository.disabled = true;

            repository.innerHTML =
                '<option value="">No repositories available</option>';



            return;

        }

        repository.innerHTML =
            '<option value="">Choose repository</option>';

        for (const [key, info] of repos) {

            const option = document.createElement("option");

            option.value = key;

            option.textContent = info.name;

            repository.appendChild(option);

        }

        repository.value = settings.repository || "";


    }

    refreshTags();

    platform.onchange = () => {

        settings.repository = "";

        refreshTags();

    };

    repository.onchange = () => {

        if (!repository.value) {
            return;
        }

        chrome.runtime.sendMessage({

            type: "SAVE_CONFIGURATION",

            platform: platform.value,

            repository: repository.value

        }, (resp) => {

            if (!resp || !resp.ok) {
                return;
            }

            if (isDashboard) {

                document.getElementById("dashboardScreen").hidden = false;
                document.getElementById("setupScreen").hidden = true;

            }

            renderAll(resp);

        });

    };

}


async function renderAll(pushedState) {
    let stored = pushedState;

    if (!stored) {

        stored = await new Promise((resolve) => {

            chrome.runtime.sendMessage({
                    type: "GET_STATUS"
                },
                resolve
            );

        });

    }

    const {
        chromium,
        lastCheck,
        settings
    } = stored;

    if (chromium) {
        renderChromium(chromium, settings);
    }

    document.getElementById("lastUpdate").textContent =
        lastCheck ?
        "Last checked: " +
        new Intl.DateTimeFormat("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true
        }).format(new Date(lastCheck)).replace(",", "") :
        "Last checked: —";

    if (settings) {

        populateSettingsSelects(settings);

        populateSettingsSelects(
            settings,
            "dashboardPlatformSelect",
            "dashboardRepositorySelect",
            true
        );

        document.getElementById("setupScreen").hidden =
            settings.configured;

        document.getElementById("dashboardScreen").hidden = !settings.configured;

    }
}

document.getElementById('checkNowBtn').addEventListener('click', (e) => {
    e.target.disabled = true;
    const original = e.target.textContent;
    e.target.textContent = 'Checking…';
    const status = document.getElementById("statusText");
    status.textContent = "Checking…";
    status.className = "status checking";
    document.getElementById("chromiumError").textContent = "";
    chrome.runtime.sendMessage({
        type: 'CHECK_NOW'
    }, (resp) => {
        if (resp) renderAll(resp);
        e.target.disabled = false;
        e.target.textContent = original;
    });
});


renderAll();
