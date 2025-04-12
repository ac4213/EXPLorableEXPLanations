// Solution toggle functionality
function toggleSolution(solutionId) {
    var solution = document.getElementById(solutionId);
    var button = solution.previousElementSibling;
    
    if (solution.style.display === "none" || solution.style.display === "") {
        solution.style.display = "block";
        button.textContent = "Hide Solution";
    } else {
        solution.style.display = "none";
        button.textContent = "Show Solution";
    }
}// Tab functionality
function openTab(evt, tabName) {
    var i, tabContent, tabButtons;
    
    // Hide all tab content
    tabContent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabContent.length; i++) {
        tabContent[i].style.display = "none";
    }
    
    // Remove active class from all tab buttons
    tabButtons = document.getElementsByClassName("tab-button");
    for (i = 0; i < tabButtons.length; i++) {
        tabButtons[i].className = tabButtons[i].className.replace(" active", "");
    }
    
    // Show the current tab and add active class to the button
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

// Quiz functionality
function checkAnswer(questionId, correctAnswer) {
    var selectedOption = document.querySelector('input[name="' + questionId + '"]:checked');
    var feedbackElement = document.getElementById(questionId + '-feedback');
    
    if (!selectedOption) {
        feedbackElement.innerHTML = "Please select an answer.";
        feedbackElement.className = "feedback";
        feedbackElement.style.display = "block";
        return;
    }
    
    if (selectedOption.value === correctAnswer) {
        feedbackElement.innerHTML = "Correct!";
        feedbackElement.className = "feedback correct";
    } else {
        feedbackElement.innerHTML = "Incorrect. Try again.";
        feedbackElement.className = "feedback incorrect";
    }
    
    feedbackElement.style.display = "block";
}

// Quiz answers and score calculation
document.addEventListener('DOMContentLoaded', function() {
    // Set default active tab
    document.getElementById("problem1").style.display = "block";
    
    // Check all answers button
    document.getElementById('check-all').addEventListener('click', function() {
        var correctAnswers = {
            'q1': 'a',
            'q2': 'b',
            'q3': 'c',
            'q4': 'b',
            'q5': 'c',
            'q6': 'b',
            'q7': 'a',
            'q8': 'b'
        };
        
        var score = 0;
        var totalQuestions = Object.keys(correctAnswers).length;
        
        for (var questionId in correctAnswers) {
            var selectedOption = document.querySelector('input[name="' + questionId + '"]:checked');
            if (selectedOption && selectedOption.value === correctAnswers[questionId]) {
                score++;
            }
            checkAnswer(questionId, correctAnswers[questionId]);
        }
        
        document.getElementById('quiz-score').textContent = "Your score: " + score + " out of " + totalQuestions;
    });
});