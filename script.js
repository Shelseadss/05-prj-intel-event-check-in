// These references connect JavaScript to the HTML elements that change during check-in.
// The same state updates the welcome message, counters, progress bar, alert, and list.
const form = document.getElementById("checkInForm");
const nameInput = document.getElementById("attendeeName");
const teamSelect = document.getElementById("teamSelect");
const attendeeCount = document.getElementById("attendeeCount");
const progressBar = document.getElementById("progressBar");
const capacityStatus = document.getElementById("capacityStatus");
const capacityPercentage = document.getElementById("capacityPercentage");
const greeting = document.getElementById("greeting");
const checkInButton = document.getElementById("checkInBtn");
const celebrationMessage = document.getElementById("celebrationMessage");
const attendeeList = document.getElementById("attendeeList");

// The goal is shared by the progress bar, capacity message, and full-event guard.
const maxCount = 50;

// This key identifies this event's saved data in the browser's local storage.
const storageKey = "intelSummitCheckIn";

// These variables are the single source of truth for the current event state.
let count = 0;
let teamCounts = {
  water: 0,
  zero: 0,
  power: 0,
};
let attendees = [];

function loadProgress() {
  // Restore a previous session before the first display update runs.
  let savedProgress;

  // JSON parsing can fail if stored data was edited or became corrupted.
  try {
    savedProgress = localStorage.getItem(storageKey);
  } catch (error) {
    console.error("Unable to read saved check-in progress.", error);
    return;
  }

  if (!savedProgress) {
    return;
  }

  try {
    const progress = JSON.parse(savedProgress);
    const hasValidCounts =
      progress &&
      Number.isInteger(progress.count) &&
      progress.count >= 0 &&
      progress.count <= maxCount &&
      progress.teams &&
      Number.isInteger(progress.teams.water) &&
      Number.isInteger(progress.teams.zero) &&
      Number.isInteger(progress.teams.power);

    if (!hasValidCounts || !Array.isArray(progress.attendees)) {
      console.error("Saved check-in progress has an invalid format.");
      return;
    }

    count = progress.count;
    teamCounts = progress.teams;
    attendees = progress.attendees;
  } catch (error) {
    console.error("Unable to restore saved check-in progress.", error);
  }
}

function saveProgress() {
  // Store all related values together so a refresh restores a complete event state.
  const progress = {
    count: count,
    teams: teamCounts,
    attendees: attendees,
  };

  try {
    localStorage.setItem(storageKey, JSON.stringify(progress));
  } catch (error) {
    console.error("Unable to save check-in progress.", error);
  }
}

function getWinningTeams() {
  // The celebration message uses these totals to identify the winner or a tie.
  const highestCount = Math.max(teamCounts.water, teamCounts.zero, teamCounts.power);
  const winningTeams = [];
  const teamNames = {
    water: "Team Water Wise",
    zero: "Team Net Zero",
    power: "Team Renewables",
  };

  Object.keys(teamCounts).forEach(function (team) {
    if (teamCounts[team] === highestCount) {
      winningTeams.push(teamNames[team]);
    }
  });

  return winningTeams;
}

function updateCelebration() {
  // Keep the alert hidden during normal check-in and reveal it at the goal.
  if (count < maxCount) {
    celebrationMessage.classList.add("d-none");
    return;
  }

  const winningTeams = getWinningTeams();
  celebrationMessage.textContent = `🎉 Check-in is complete! ${winningTeams.join(
    " and "
  )} had the highest attendance.`;
  celebrationMessage.classList.remove("d-none");
}

function renderAttendeeList() {
  // Rebuild the list from state so new check-ins and restored records look identical.
  attendeeList.textContent = "";

  if (attendees.length === 0) {
    const emptyMessage = document.createElement("li");
    emptyMessage.className = "list-group-item attendee-empty";
    emptyMessage.textContent = "No attendees yet - be the first to check in!";
    attendeeList.appendChild(emptyMessage);
    return;
  }

  // Bootstrap classes provide the responsive list layout and pill-shaped team badges.
  attendees.forEach(function (attendee) {
    const listItem = document.createElement("li");
    const name = document.createElement("span");
    const team = document.createElement("span");

    listItem.className =
      "list-group-item d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2";
    name.textContent = attendee.name;
    team.className = `badge rounded-pill team-badge ${attendee.team}`;
    team.textContent = attendee.teamName;

    listItem.appendChild(name);
    listItem.appendChild(team);
    attendeeList.appendChild(listItem);
  });
}

function updateDisplay() {
  // This function refreshes every visible counter after loading or checking in.
  const percentage = Math.round((count / maxCount) * 100);

  attendeeCount.textContent = count;
  progressBar.style.width = `${percentage}%`;
  capacityStatus.textContent = `${count} / ${maxCount} attendees checked in`;
  capacityPercentage.textContent = `${percentage}% capacity`;

  // Team card IDs follow the same keys used in the teamCounts object.
  Object.keys(teamCounts).forEach(function (team) {
    document.getElementById(`${team}Count`).textContent = teamCounts[team];
  });

  // A restored event at capacity must also lock the form immediately.
  if (count >= maxCount) {
    checkInButton.disabled = true;
    checkInButton.textContent = "Check-In Full";
  }

  updateCelebration();
  renderAttendeeList();
}

form.addEventListener("submit", function (event) {
  event.preventDefault();

  // Stop before changing any state if the event has already reached 50 attendees.
  if (count >= maxCount) {
    greeting.textContent = "Check-in is full. The maximum of 50 attendees has been reached.";
    greeting.classList.add("success-message");
    return;
  }

  // Read the form values before resetting the form at the end of the submission.
  const name = nameInput.value.trim();
  const team = teamSelect.value;
  const teamName = teamSelect.selectedOptions[0].text;

  // Add the attendee to both the totals and the detailed history list.
  count++;
  teamCounts[team]++;
  attendees.push({
    name: name,
    team: team,
    teamName: teamName,
  });

  greeting.textContent = `Welcome, ${name} from ${teamName}!`;
  greeting.classList.add("success-message");

  // Save first, then render so the page and future reloads use the same state.
  saveProgress();
  updateDisplay();
  form.reset();
});

// Loading and rendering on startup restores the page before the user interacts with it.
loadProgress();
updateDisplay();
