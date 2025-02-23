const API_URL =
    "https://script.google.com/macros/s/AKfycbwGVSf_9XdcQdDjTTL-uliZ6Qw3gN-Fnz5ytB3k4ub1rHDGDdOs0O0aBlxK3P6HU223/exec";

// Function to format timestamps efficiently
function formatTimestamp(isoString) {
    const date = new Date(isoString);
    return date.toLocaleString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
    });
}

// Fetch data from Google Sheets API
async function fetchLeaderboardData() {
    const cachedData = localStorage.getItem("leaderboardData");
    const cacheTimestamp = localStorage.getItem("leaderboardTimestamp");

    // Check if cached data exists and is fresh, within the last minute
    if (
        cachedData &&
        cacheTimestamp &&
        Date.now() - cacheTimestamp < 60 * 1000
    ) {
        console.log("Using preloaded leaderboard data");
        updateLeaderboard(JSON.parse(cachedData)); // Use preloaded data
    } else {
        console.log("Fetching leaderboard data from API");
        try {
            const response = await fetch(API_URL, { cache: "no-cache" });
            const data = await response.json();
            data.values.shift(); // Remove first row (header)

            // Process leaderboard entries
            const leaderboardEntries = data.values.map((row) => ({
                timestamp: formatTimestamp(row[2]),
                teamName: row[0],
                teamMembers: row[1],
                runtime: row[3],
                score: +row[4],
            }));

            // Sort by score descending
            leaderboardEntries.sort((a, b) => b.score - a.score);

            // Store in cache for next time
            localStorage.setItem(
                "leaderboardData",
                JSON.stringify(leaderboardEntries)
            );
            localStorage.setItem("leaderboardTimestamp", Date.now());

            updateLeaderboard(leaderboardEntries);
        } catch (error) {
            console.error("Error fetching leaderboard data:", error);
        }
    }
}

// Update leaderboard efficiently
function updateLeaderboard(entries) {
    const leaderboardBody = document.getElementById("leaderboard-body");
    let htmlContent = "";

    entries.forEach((entry, index) => {
        htmlContent += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${entry.teamName}</td>
                    <td>${entry.teamMembers}</td>
                    <td>${entry.timestamp}</td>
                    <td>${entry.runtime} ms</td>
                    <td><a href="#" class="score-link" data-index="${index}">${
            entry.score
        }</a></td>
                </tr>
            `;
    });

    leaderboardBody.innerHTML = htmlContent; // Update in one go

    // Use event delegation for efficiency
    document
        .getElementById("leaderboard-body")
        .addEventListener("click", function (event) {
            if (event.target.classList.contains("score-link")) {
                event.preventDefault();
                showDialogBox(event.target.getAttribute("data-index"));
            }
        });

    window.leaderboardEntries = entries;
}

// Show dialog box with team details
function showDialogBox(index) {
    const entry = window.leaderboardEntries[index];
    document.getElementById("dialogContent").innerHTML = `
            <p><strong>Team Name:</strong> ${entry.teamName}</p>
            <p><strong>Team Members:</strong> ${entry.teamMembers}</p>
            <p><strong>Timestamp:</strong> ${entry.timestamp}</p>
            <p><strong>Runtime:</strong> ${entry.runtime} ms</p>
            <p><strong>Score:</strong> ${entry.score}</p>
        `;

    document.getElementById("leaderboard-container").classList.add("dimmed");
    document.getElementById("dialogBox").style.display = "inline";
}

function closeDialogBox() {
    document.getElementById("leaderboard-container").classList.remove("dimmed");
    document.getElementById("dialogBox").style.display = "none";
}

// Fetch leaderboard on page load
fetchLeaderboardData();
