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

// Preload leaderboard data in the background
async function preloadLeaderboardData() {
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

        // Store in localStorage for leaderboard page to use
        localStorage.setItem("leaderboardData", JSON.stringify(leaderboardEntries));
        localStorage.setItem("leaderboardTimestamp", Date.now()); // Store timestamp for freshness
    } catch (error) {
        console.error("Error preloading leaderboard data:", error);
    }
}

// Run preload when the page loads
window.addEventListener("DOMContentLoaded", () => {
    preloadLeaderboardData();
});
