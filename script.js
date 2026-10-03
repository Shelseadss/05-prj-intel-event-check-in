// Get all needed DOM elements
//form element
const form = document.getElementById("checkInForm");

//name input element
const nameInput = document.getElementById("attendeeName");

// team select element
const teamSelect = document.getElementById("teamSelect");

// make something happen when the user submits the form

//Track Attendence
let count = 0;
const maxCount = 50;

// handle form submission:
form.addEventListener("submit", function (event) {
  event.preventDefault();

  // get form values
  const name = nameInput.value;
  const team = teamSelect.value;
  const teamName = teamSelect.selectedOptions[0].text;

  //print it in the console
  console.log(name, team, teamName);

  // increment attendance count
  count++;
  console.log("Total check-in's: " + count);

  //update progress bar
  const percentage = Math.round((count / maxCount) * 100) + "%";
  console.log("progress: " + percentage);

  //Update team counter
  const teamCounter = document.getElementById(team + "Count");
  teamCounter.textContent = parseInt(teamCounter.textContent) + 1;

  // show welcome message
  const message = `Welcome, ${name} from ${teamName}`;
  console.log(message);

  form.reset();
});
