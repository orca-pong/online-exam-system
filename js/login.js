document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const mobileInput = document.getElementById('mobile');
    const errorMessage = document.getElementById('errorMessage');
    
    // Format mobile number input
    mobileInput.addEventListener('input', function() {
        let value = this.value.replace(/\D/g, '');
        
        // Remove leading zero if present
        if (value.startsWith('0')) {
            value = value.substring(1);
        }
        
        // Limit to 11 digits
        if (value.length > 11) {
            value = value.substring(0, 11);
        }
        
        this.value = value;
    });
    
    // Handle form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const mobile = '+880 ' + mobileInput.value;
        const roll = document.getElementById('roll').value;
        
        // Fetch student data
        fetch('data/student.json')
            .then(response => response.json())
            .then(students => {
                // Find matching student
                const student = students.find(s => 
                    s.Mobile === mobile && s.Roll === roll
                );
                
                if (student) {
                    // Store student data in session storage
                    sessionStorage.setItem('student', JSON.stringify(student));
                    
                    // Redirect to questions page
                    window.location.href = 'questions.html';
                } else {
                    // Show error message
                    errorMessage.textContent = 'Invalid mobile number or roll number. Please try again.';
                    errorMessage.style.display = 'block';
                    
                    // Add shake animation to form
                    loginForm.classList.add('shake');
                    setTimeout(() => {
                        loginForm.classList.remove('shake');
                    }, 500);
                }
            })
            .catch(error => {
                console.error('Error fetching student data:', error);
                errorMessage.textContent = 'An error occurred. Please try again later.';
                errorMessage.style.display = 'block';
            });
    });
});