document.addEventListener('DOMContentLoaded', function() {
    // ===== TIMER CONFIGURATION =====
    // Change this value to set the exam duration in minutes
    // For example: 1 for 1 minute, 30 for 30 minutes, 60 for 60 minutes
    const EXAM_DURATION_MINUTES = 15; // Currently set to 1 minute as requested
    
    // Calculate total time in seconds
    const totalSeconds = EXAM_DURATION_MINUTES * 60;
    let timeLeft = totalSeconds;
    
    // Debug: Show configuration in console
    console.log("=== TIMER CONFIGURATION ===");
    console.log("Exam Duration (minutes):", EXAM_DURATION_MINUTES);
    console.log("Total Seconds:", totalSeconds);
    console.log("===========================");
    
    // Get student data from session storage
    const studentData = JSON.parse(sessionStorage.getItem('student'));
    
    if (!studentData) {
        // Redirect to login if no student data
        window.location.href = 'index.html';
        return;
    }
    
    // Display student info in fixed timer
    document.getElementById('studentName').textContent = studentData.Name;
    document.getElementById('studentRoll').textContent = studentData.Roll;
    
    // Display timer type
    const timerTypeElement = document.getElementById('timerType');
    if (timerTypeElement) {
        if (studentData.Tm === 1) {
            timerTypeElement.textContent = " | 1st Timer";
            timerTypeElement.style.color = "#4CAF50";
        } else if (studentData.Tm === 2) {
            timerTypeElement.textContent = " | 2nd Timer";
            timerTypeElement.style.color = "#FF9800";
        } else {
            timerTypeElement.textContent = " | Unknown Timer";
            timerTypeElement.style.color = "#ffffff";
        }
    }
    
    // Set up timer
    const timerDisplay = document.getElementById('timer');
    
    // Initialize timer display immediately
    updateTimerDisplay();
    
    // Start the timer
    const timerInterval = setInterval(function() {
        timeLeft--;
        updateTimerDisplay();
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            submitExam();
        }
    }, 1000);
    
    function updateTimerDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        const displayText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        timerDisplay.textContent = displayText;
        
        // Debug: Log current time
        console.log("Time Left:", displayText);
    }
    
    // Auto-hide sticky header functionality
    let lastScrollTop = 0;
    const header = document.querySelector('.fixed-timer');
    let scrollTimeout;
    
    window.addEventListener('scroll', function() {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        clearTimeout(scrollTimeout);
        
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            header.classList.add('hide-header');
        } else {
            header.classList.remove('hide-header');
        }
        
        scrollTimeout = setTimeout(function() {
            header.classList.remove('hide-header');
        }, 3000);
        
        lastScrollTop = scrollTop;
    });
    
    document.addEventListener('mousemove', function(e) {
        if (e.clientY < 100) {
            header.classList.remove('hide-header');
        }
    });
    
    // Fetch questions
    fetch('data/questions.json')
        .then(response => response.json())
        .then(questions => {
            const questionsForm = document.getElementById('questionsForm');
            
            questions.forEach((question, index) => {
                const questionCard = document.createElement('div');
                questionCard.className = 'question-card';
                questionCard.innerHTML = `
                    <h3>Question ${index + 1}: ${question.question}</h3>
                    <div class="options-container">
                        ${question.options.map((option, i) => {
                            const optionLabel = String.fromCharCode(65 + i);
                            return `
                                <div class="option" data-question="${index}" data-option="${i}">
                                    <div class="option-label">${optionLabel}.</div>
                                    <input type="radio" id="q${index}_opt${i}" name="question${index}" value="${option}">
                                    <label for="q${index}_opt${i}">${option}</label>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `;
                
                questionsForm.appendChild(questionCard);
            });
            
            document.querySelectorAll('.option').forEach(option => {
                option.addEventListener('click', function() {
                    const questionIndex = this.dataset.question;
                    const optionIndex = this.dataset.option;
                    const radioInput = this.querySelector('input[type="radio"]');
                    
                    if (!this.closest('.options-container').querySelector('.answered')) {
                        radioInput.checked = true;
                        this.classList.add('selected');
                        
                        this.closest('.options-container').querySelectorAll('.option').forEach(opt => {
                            opt.classList.add('answered');
                            opt.style.pointerEvents = 'none';
                        });
                        
                        const answers = JSON.parse(sessionStorage.getItem('answers') || '{}');
                        answers[questionIndex] = optionIndex;
                        sessionStorage.setItem('answers', JSON.stringify(answers));
                    }
                });
            });
        })
        .catch(error => {
            console.error('Error fetching questions:', error);
            alert('An error occurred while loading questions. Please try again later.');
        });
    
    // Submit exam button
    document.getElementById('submitExam').addEventListener('click', submitExam);
    
    function submitExam() {
        clearInterval(timerInterval);
        
        const answers = JSON.parse(sessionStorage.getItem('answers') || '{}');
        
        sessionStorage.setItem('submissionData', JSON.stringify({
            student: studentData,
            answers: answers,
            timeSpent: totalSeconds - timeLeft
        }));
        
        window.location.href = 'results.html';
    }
});