document.addEventListener('DOMContentLoaded', () => {
    
    // Initialize AOS (Animate On Scroll)
    AOS.init({
        once: true, // Animation happens only once - while scrolling down
        offset: 50, // Offset (in px) from the original trigger point
        duration: 800, // Duration of animation
        easing: 'ease-out-cubic',
    });

    // Initialize Vanilla-Tilt for Cards
    if (typeof VanillaTilt !== 'undefined') {
        VanillaTilt.init(document.querySelectorAll(".card-linear"), {
            max: 5,
            speed: 400,
            glare: true,
            "max-glare": 0.1,
            scale: 1.02
        });
    }

    // Typing Effect for Hero Title with Blinking Cursor
    const heroTitle = document.querySelector('h1');
    if (heroTitle) {
        // Strip existing tags for clean typing source, but keep breaks if possible
        // Ideally we just want the text content to type out
        const textToType = "Turning ideas into\nimpactful solutions.";
        
        heroTitle.innerHTML = '<span class="typing-cursor">|</span>';
        heroTitle.style.opacity = 1; 

        // Add cursor style dynamically
        const style = document.createElement('style');
        style.innerHTML = `
            .typing-cursor {
                display: inline-block;
                animation: blink 1s step-end infinite;
                color: #5E6AD2;
                margin-left: 5px;
            }
            @keyframes blink { 50% { opacity: 0; } }
        `;
        document.head.appendChild(style);
        
        let i = 0;
        let currentText = '';

        function typeWriter() {
            if (i < textToType.length) {
                const char = textToType.charAt(i);
                
                if (char === '\n') {
                    currentText += '<br>';
                } else {
                    currentText += char;
                }

                heroTitle.innerHTML = currentText + '<span class="typing-cursor">|</span>';
                i++;
                setTimeout(typeWriter, 60); 
            } else {
                 // Keep cursor blinking at the end
                 heroTitle.innerHTML = currentText + '<span class="typing-cursor">|</span>';
            }
        }
        
        setTimeout(typeWriter, 800); 
    }

});
