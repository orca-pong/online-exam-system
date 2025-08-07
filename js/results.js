document.addEventListener('DOMContentLoaded', function() {
    // Get submission data from session storage
    const submissionData = JSON.parse(sessionStorage.getItem('submissionData'));
    
    if (!submissionData) {
        // Redirect to login if no submission data
        window.location.href = 'index.html';
        return;
    }
    
    const { student, answers, timeSpent } = submissionData;
    
    // Display student info
    document.getElementById('resultStudentName').textContent = student.Name;
    document.getElementById('resultStudentRoll').textContent = student.Roll;
    document.getElementById('resultStudentTimer').textContent = student.Tm === 1 ? '1st Timer' : '2nd Timer';
    
    // Fetch questions to calculate results
    fetch('data/questions.json')
        .then(response => response.json())
        .then(questions => {
            // Calculate results
            const totalQuestions = questions.length;
            const answeredQuestions = Object.keys(answers).length;
            const skippedQuestions = totalQuestions - answeredQuestions;
            
            let correctAnswers = 0;
            let wrongAnswers = 0;
            
            // Check each answer
            Object.keys(answers).forEach(questionIndex => {
                const selectedOption = answers[questionIndex];
                const correctAnswer = questions[questionIndex].correct_answer;
                const selectedAnswer = questions[questionIndex].options[selectedOption];
                
                if (selectedAnswer === correctAnswer) {
                    correctAnswers++;
                } else {
                    wrongAnswers++;
                }
            });
            
            // Calculate negative marks (cut mark)
            const negativeMarks = (wrongAnswers * 0.25).toFixed(2);
            
            // Calculate final marks
            let finalMarks = (correctAnswers - wrongAnswers - parseFloat(negativeMarks)).toFixed(2);
            
            // Apply 2nd timer penalty if applicable
            if (student.Tm === 2) {
                finalMarks = (finalMarks - 3).toFixed(2);
                document.getElementById('secondTimerNote').style.display = 'block';
            }
            
            // Display results
            document.getElementById('correctAnswers').textContent = correctAnswers;
            document.getElementById('wrongAnswers').textContent = wrongAnswers;
            document.getElementById('skippedQuestions').textContent = skippedQuestions;
            document.getElementById('negativeMarks').textContent = negativeMarks;
            document.getElementById('finalMarks').textContent = finalMarks;
            
            // Clear session storage
            sessionStorage.removeItem('student');
            sessionStorage.removeItem('answers');
            sessionStorage.removeItem('submissionData');
        })
        .catch(error => {
            console.error('Error fetching questions:', error);
            alert('An error occurred while calculating results. Please try again later.');
        });
});