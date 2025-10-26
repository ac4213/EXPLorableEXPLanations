/* ============================================
   Common Quiz Functions
   Shared JavaScript for quizzes across all pages
   ============================================ */

/**
 * Check a quiz answer and provide feedback
 * @param {string} questionName - The name attribute of the radio button group
 * @param {string} correctAnswer - The correct answer value
 * @param {string} feedbackId - The ID of the feedback element
 */
function checkAnswer(questionName, correctAnswer, feedbackId) {
    const selectedOption = document.querySelector(`input[name="${questionName}"]:checked`);
    const feedbackElement = document.getElementById(feedbackId);

    if (!selectedOption) {
        feedbackElement.textContent = "Please select an answer.";
        feedbackElement.className = "feedback";
        feedbackElement.style.color = "#666";
        return;
    }

    if (selectedOption.value === correctAnswer) {
        feedbackElement.textContent = "✓ Correct! Well done.";
        feedbackElement.className = "feedback correct";
        feedbackElement.style.color = "#28a745";
        feedbackElement.style.fontWeight = "bold";
    } else {
        feedbackElement.textContent = "✗ Incorrect. Try again!";
        feedbackElement.className = "feedback incorrect";
        feedbackElement.style.color = "#dc3545";
        feedbackElement.style.fontWeight = "bold";
    }
}

/**
 * Submit an entire quiz and calculate score
 * @param {Array} questions - Array of question objects with {name, correctAnswer}
 * @param {string} resultsId - The ID of the results display element
 */
function submitQuiz(questions, resultsId) {
    let score = 0;
    let total = questions.length;
    let unanswered = 0;

    questions.forEach(q => {
        const selected = document.querySelector(`input[name="${q.name}"]:checked`);
        if (!selected) {
            unanswered++;
        } else if (selected.value === q.correctAnswer) {
            score++;
        }
    });

    const resultsElement = document.getElementById(resultsId);
    if (!resultsElement) return;

    let resultsHTML = `<h3>Quiz Results</h3>`;
    resultsHTML += `<p><strong>Score: ${score} / ${total}</strong> (${Math.round((score/total)*100)}%)</p>`;

    if (unanswered > 0) {
        resultsHTML += `<p style="color: #ff9800;">You left ${unanswered} question(s) unanswered.</p>`;
    }

    if (score === total) {
        resultsHTML += `<p style="color: #28a745; font-weight: bold;">Perfect score! Excellent work!</p>`;
    } else if (score >= total * 0.7) {
        resultsHTML += `<p style="color: #4CAF50;">Good job! You're doing well.</p>`;
    } else if (score >= total * 0.5) {
        resultsHTML += `<p style="color: #ff9800;">You passed, but review the material for better understanding.</p>`;
    } else {
        resultsHTML += `<p style="color: #dc3545;">Keep practicing! Review the lecture material.</p>`;
    }

    resultsElement.innerHTML = resultsHTML;
    resultsElement.style.display = "block";
}

/**
 * Reset a quiz by clearing all selections and feedback
 * @param {Array} questionNames - Array of question name attributes
 */
function resetQuiz(questionNames) {
    questionNames.forEach(name => {
        // Clear radio button selections
        const radios = document.querySelectorAll(`input[name="${name}"]`);
        radios.forEach(radio => radio.checked = false);

        // Clear feedback
        const feedback = document.getElementById(`${name}-feedback`);
        if (feedback) {
            feedback.textContent = "";
            feedback.className = "feedback";
        }
    });

    // Clear results if exists
    const results = document.getElementById('quiz-results');
    if (results) {
        results.innerHTML = "";
        results.style.display = "none";
    }
}

/**
 * Add event listeners to quiz answer buttons
 * @param {string} questionName - The name attribute of the radio button group
 * @param {string} correctAnswer - The correct answer value
 * @param {string} feedbackId - The ID of the feedback element
 * @param {string} buttonId - The ID of the check answer button
 */
function setupQuizQuestion(questionName, correctAnswer, feedbackId, buttonId) {
    const button = document.getElementById(buttonId);
    if (button) {
        button.addEventListener('click', function() {
            checkAnswer(questionName, correctAnswer, feedbackId);
        });
    }
}
