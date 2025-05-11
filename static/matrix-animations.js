// Matrix-style animations for Hexa application

document.addEventListener('DOMContentLoaded', () => {
    // Create the Matrix canvas element
    const canvas = document.createElement('canvas');
    canvas.id = 'matrixCanvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '1';
    document.body.insertBefore(canvas, document.body.firstChild);

    // Matrix effect with easter eggs
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Easter eggs and symbols for rendering
    const eastereggs = [
        "welcome to matrix", "find the rabbit", "follow the white rabbit", 
        "wake up neo", "there is no spoon", "red or blue pill", 
        "knock knock neo", "the matrix has you", "HEXA SYSTEM", 
        "reality is a dream", "they are watching", "you are the one",
        "system failure", "ctrl+alt+del", "blue screen", "root access",
        "code injection", "sudo rm -rf", "hidden backdoor", "secret key",
        "morpheus is calling", "take the red pill", "glitch in the matrix",
        "dodge this", "I know kung fu", "deja vu", "matrix reloaded", 
        "source code", "agent smith", "zion", "system override",
        "use keyboard only", "mouse disabled", "terminal mode", "command line",
        "hexa protocol", "hexa network", "enter hexa", "hexa confirmed"
    ];
    
    // Create an array of drops
    const columns = Math.floor(canvas.width / 20); // Character width
    const drops = [];
    
    // Initialize drops
    for (let i = 0; i < columns; i++) {
        drops[i] = Math.floor(Math.random() * -canvas.height); // Start above the canvas
    }
    
    // Drawing function
    function draw() {
        // Semi-transparent black background for fade effect
        ctx.fillStyle = 'rgba(0, 0, 0, 0.02)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.font = '15px Qager';
        ctx.fillStyle = '#00ff00';
        
        // Loop through all drops
        for (let i = 0; i < drops.length; i++) {
            // Generate random character or easter egg part
            let text = '';
            if (Math.random() > 0.99) {
                // Get random easter egg
                const eggIndex = Math.floor(Math.random() * eastereggs.length);
                const egg = eastereggs[eggIndex];
                
                // Get random letter from easter egg
                const charIndex = Math.floor(Math.random() * egg.length);
                text = egg[charIndex];
            } else {
                // Generate random character (Latin letters, numbers, and special symbols)
                const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+[]{}|;:,./<>?';
                text = charset[Math.floor(Math.random() * charset.length)];
            }
            
            // Draw character
            ctx.fillText(text, i * 20, drops[i]);
            
            // Reset drop back to top after reaching bottom
            if (drops[i] > canvas.height && Math.random() > 0.975) {
                drops[i] = Math.floor(Math.random() * -100);
            }
            
            // Move drop
            drops[i] += Math.random() * 2 + 1; // Random falling speed
        }
    }
    
    // Handle window resize
    window.addEventListener('resize', function() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        // Recalculate number of columns and drops
        const newColumns = Math.floor(canvas.width / 20);
        for (let i = 0; i < newColumns; i++) {
            if (!drops[i]) {
                drops[i] = Math.floor(Math.random() * -canvas.height);
            }
        }
    });
    
    // Add glitch effect to elements with data-glitch attribute
    function addGlitchEffect() {
        const glitchElements = document.querySelectorAll('[data-glitch]');
        
        glitchElements.forEach(element => {
            const originalText = element.textContent;
            
            // Create glitch animation
            setInterval(() => {
                // Skip glitch most of the time for subtlety
                if (Math.random() > 0.98) {
                    // Temporarily replace text with glitched version
                    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+[]{}|;:,./<>?';
                    let glitchedText = '';
                    
                    // Replace random characters
                    for (let i = 0; i < originalText.length; i++) {
                        if (Math.random() > 0.7) {
                            glitchedText += charset[Math.floor(Math.random() * charset.length)];
                        } else {
                            glitchedText += originalText[i];
                        }
                    }
                    
                    // Apply glitch
                    element.textContent = glitchedText;
                    
                    // Restore original text after short delay
                    setTimeout(() => {
                        element.textContent = originalText;
                    }, 100 + Math.random() * 200);
                }
            }, 2000);
        });
    }
    
    // Add scan line effect
    function addScanLines() {
        const scanLine = document.createElement('div');
        scanLine.className = 'scan-line';
        scanLine.style.position = 'fixed';
        scanLine.style.top = '0';
        scanLine.style.left = '0';
        scanLine.style.width = '100%';
        scanLine.style.height = '5px';
        scanLine.style.backgroundColor = 'rgba(0, 255, 0, 0.1)';
        scanLine.style.boxShadow = '0 0 10px rgba(0, 255, 0, 0.3)';
        scanLine.style.zIndex = '2';
        scanLine.style.pointerEvents = 'none';
        document.body.appendChild(scanLine);
        
        let position = 0;
        const animateScanLine = () => {
            position = (position + 1) % (window.innerHeight + 5);
            scanLine.style.top = position + 'px';
            requestAnimationFrame(animateScanLine);
        };
        
        animateScanLine();
    }
    
    // Add CRT screen flicker
    function addScreenFlicker() {
        const overlay = document.createElement('div');
        overlay.className = 'crt-flicker';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'transparent';
        overlay.style.pointerEvents = 'none';
        overlay.style.zIndex = '2';
        document.body.appendChild(overlay);
        
        setInterval(() => {
            if (Math.random() > 0.995) {
                overlay.style.backgroundColor = 'rgba(0, 255, 0, 0.01)';
                setTimeout(() => {
                    overlay.style.backgroundColor = 'transparent';
                }, 50 + Math.random() * 50);
            }
        }, 100);
    }
    
    // Start matrix animation
    const matrixInterval = setInterval(draw, 50);
    
    // Add other effects with slight delay to ensure DOM is fully loaded
    setTimeout(() => {
        addGlitchEffect();
        addScanLines();
        addScreenFlicker();
    }, 500);
}); 