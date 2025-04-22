document.addEventListener("DOMContentLoaded", function () {
	const form = document.getElementById("trivia-form");
	const questionContainer = document.getElementById("question-container");
	const newPlayerButton = document.getElementById("new-player");
	const usernameInput = document.getElementById("username");

	checkUsername();
	fetchQuestions();
	displayScores();

	form.addEventListener("submit", function (e) {
		e.preventDefault();
		const username = usernameInput.value.trim();
		if (!username) {
			alert("Please enter your name to finish the game.");
			return;
		}
		setCookie("triviaUsername", username, 7);
		const score = calculateScore();
		saveScore(username, score);
		displayScores();
		alert(`Game over, ${username}! Your score: ${score}`);
		newPlayerButton.classList.remove("hidden");
	});

	newPlayerButton.addEventListener("click", function () {
		clearCookie("triviaUsername");
		localStorage.removeItem("triviaScores");
		location.reload();
	});

	function checkUsername() {
		const savedName = getCookie("triviaUsername");
		if (savedName) {
			usernameInput.value = savedName;
		}
	}

	function fetchQuestions() {
		showLoading(true);

		fetch("https://opentdb.com/api.php?amount=10&type=multiple")
			.then((response) => response.json())
			.then((data) => {
				displayQuestions(data.results);
				showLoading(false);
			})
			.catch((error) => {
				console.error("Error fetching questions:", error);
				showLoading(false);
			});
	}

	function showLoading(isLoading) {
		document.getElementById("loading-container").classList = isLoading ? "" : "hidden";
		questionContainer.classList = isLoading ? "hidden" : "";
	}

	function displayQuestions(questions) {
		questionContainer.innerHTML = "";
		questions.forEach((question, index) => {
			const questionDiv = document.createElement("div");
			questionDiv.innerHTML = `
				<p>${question.question}</p>
				${createAnswerOptions(question.correct_answer, question.incorrect_answers, index)}
			`;
			questionContainer.appendChild(questionDiv);
		});
	}

	function createAnswerOptions(correctAnswer, incorrectAnswers, questionIndex) {
		const allAnswers = [correctAnswer, ...incorrectAnswers].sort(() => Math.random() - 0.5);
		return allAnswers
			.map(
				(answer) => `
					<label>
						<input type="radio" name="answer${questionIndex}" value="${answer}" ${
					answer === correctAnswer ? 'data-correct="true"' : ""
				}>
						${answer}
					</label>
				`
			)
			.join("");
	}

	function calculateScore() {
		let score = 0;
		const selectedAnswers = document.querySelectorAll("input[type='radio']:checked");
		selectedAnswers.forEach((input) => {
			if (input.dataset.correct === "true") {
				score++;
			}
		});
		return score;
	}

	function saveScore(username, score) {
		let scores = JSON.parse(localStorage.getItem("triviaScores")) || [];
		scores.push({ player: username, score: score });
		localStorage.setItem("triviaScores", JSON.stringify(scores));
	}

	function displayScores() {
		const tableBody = document.querySelector("#score-table tbody");
		tableBody.innerHTML = "";
		const scores = JSON.parse(localStorage.getItem("triviaScores")) || [];
		scores.forEach((entry) => {
			const row = document.createElement("tr");
			row.innerHTML = `<td>${entry.player}</td><td>${entry.score}</td>`;
			tableBody.appendChild(row);
		});
	}

	function setCookie(name, value, days) {
		const date = new Date();
		date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
		document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/`;
	}

	function getCookie(name) {
		const cookies = document.cookie.split(";");
		for (let i = 0; i < cookies.length; i++) {
			const c = cookies[i].trim();
			if (c.indexOf(name + "=") === 0) {
				return c.substring(name.length + 1, c.length);
			}
		}
		return null;
	}

	function clearCookie(name) {
		document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
	}
});
