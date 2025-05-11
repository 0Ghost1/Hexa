// Command-line style animation for login and sidsee pages

document.addEventListener('DOMContentLoaded', () => {
    // Create the Terminal canvas element if it doesn't exist
    let canvas = document.getElementById('matrixCanvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'matrixCanvas';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.zIndex = '0'; // Behind content
        document.body.insertBefore(canvas, document.body.firstChild);
    }

    // Terminal effect context
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Define the terms to display
    const keywords = ["__init__", "Danchik"];
    
    // Command phrases for the terminal
    const prefixes = [
        "Initializing ", "Loading ", "Running ", "Executing ", "Starting ",
        "System ", "Process ", "Module ", "Function ", "Class ", 
        "Error in ", "Warning: ", "Success: ", "Debug: ", "Info: ",
        "Access ", "User ", "Connection ", "Network ", "File ", "010101000101010", "101010101010010"
    ];
    
    const suffixes = [
        " module", " process", " sequence", " protocol", " function",
        " class", " method", " routine", " system", " algorithm",
        " loaded", " started", " connected", " active", " online",
        " complete", " found", " verified", " authorized", " detected", "is god..", "000000010"
    ];
    
    // Settings for the terminal lines
    const lineHeight = 30; // Space between lines
    const fontSize = 18;
    const linesPerScreen = Math.ceil(canvas.width / 40); // More lines based on width
    const lines = [];
    
    // Generate a phrase with a keyword
    const generatePhrase = () => {
        const keyword = keywords[Math.floor(Math.random() * keywords.length)];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        return { phrase: prefix + keyword + suffix, keyword: keyword };
    };
    
    // Create initial lines evenly distributed across the screen width
    for (let i = 0; i < linesPerScreen; i++) {
        // Distribute lines evenly across the screen width
        const x = (i / linesPerScreen) * canvas.width;
        
        lines.push({
            x: x,
            y: -lineHeight * (1 + Math.random() * 10), // Start off-screen at various heights
            speedY: 0.8 + Math.random() * 1.2, // Varying speeds
            alpha: 0.5 + Math.random() * 0.3, // Brighter lines
            phraseData: generatePhrase()
        });
    }
    
    // Drawing function
    function drawTerminal() {
        // Clear canvas with semi-transparent black for trail effect
        ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Loop through each line
        lines.forEach((line, index) => {
            // Move the line down
            line.y += line.speedY;
            
            // If line goes off screen, reset to top
            if (line.y > canvas.height) {
                line.y = -lineHeight * (1 + Math.random() * 5); // Random delay before new line appears
                line.speedY = 0.8 + Math.random() * 1.2; // Randomize speed
                line.alpha = 0.5 + Math.random() * 0.3;
                line.phraseData = generatePhrase();
                // Keep the same x position to maintain vertical lines
            }
            
            // Only draw if the line is in view
            if (line.y > -lineHeight && line.y < canvas.height) {
                // Set color with varying opacity for more realistic effect
                ctx.fillStyle = `rgba(0, 255, 0, ${line.alpha})`;
                
                // Get the phrase components
                const phrase = line.phraseData.phrase;
                const keyword = line.phraseData.keyword;
                
                // Split the phrase into parts: before keyword, keyword, after keyword
                const parts = phrase.split(keyword);
                const beforeKeyword = parts[0];
                const afterKeyword = parts[1] || '';
                
                // Set font for regular text
                ctx.font = `${fontSize}px Courier, monospace`;
                
                // Measure the width of the text before the keyword
                const beforeWidth = ctx.measureText(beforeKeyword).width;
                
                // Draw text before keyword
                ctx.fillText(beforeKeyword, line.x, line.y);
                
                // Set bold font for keyword
                ctx.font = `bold ${fontSize}px Courier, monospace`;
                
                // Draw keyword
                ctx.fillText(keyword, line.x + beforeWidth, line.y);
                
                // Measure the width of the keyword
                const keywordWidth = ctx.measureText(keyword).width;
                
                // Reset font for text after keyword
                ctx.font = `${fontSize}px Courier, monospace`;
                
                // Draw text after keyword
                ctx.fillText(afterKeyword, line.x + beforeWidth + keywordWidth, line.y);
                
                // Sometimes add a blinking cursor at the end of a line
                if (Math.random() > 0.995) {
                    if (Math.floor(Date.now() / 500) % 2 === 0) {
                        // Calculate total width of the text
                        const totalWidth = beforeWidth + keywordWidth + ctx.measureText(afterKeyword).width;
                        ctx.fillText('█', line.x + totalWidth + 5, line.y);
                    }
                }
            }
        });
    }
    
    // Handle window resize
    window.addEventListener('resize', function() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        // Recalculate lines needed
        const newLinesPerScreen = Math.ceil(canvas.width / 40);
        
        // Reset lines array to maintain proper ratio
        lines.length = 0;
        
        // Recreate lines
        for (let i = 0; i < newLinesPerScreen; i++) {
            // Distribute lines evenly across the screen width
            const x = (i / newLinesPerScreen) * canvas.width;
            
            lines.push({
                x: x,
                y: -lineHeight * (1 + Math.random() * 10),
                speedY: 0.8 + Math.random() * 1.2,
                alpha: 0.5 + Math.random() * 0.3,
                phraseData: generatePhrase()
            });
        }
    });
    
    // Create a scan line effect
    function addScanLines() {
        const scanLine = document.createElement('div');
        scanLine.className = 'scan-line';
        scanLine.style.position = 'fixed';
        scanLine.style.top = '0';
        scanLine.style.left = '0';
        scanLine.style.width = '100%';
        scanLine.style.height = '5px';
        scanLine.style.backgroundColor = 'rgba(0, 255, 0, 0.1)'; // Dimmer line
        scanLine.style.boxShadow = '0 0 10px rgba(0, 255, 0, 0.3)';
        scanLine.style.zIndex = '999';
        scanLine.style.pointerEvents = 'none';
        document.body.appendChild(scanLine);
        
        let position = 0;
        const animateScanLine = () => {
            position = (position + 1) % (window.innerHeight + 5); // Faster scan line
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
        overlay.style.zIndex = '998';
        document.body.appendChild(overlay);
        
        setInterval(() => {
            if (Math.random() > 0.997) {
                overlay.style.backgroundColor = 'rgba(0, 255, 0, 0.03)';
                setTimeout(() => {
                    overlay.style.backgroundColor = 'transparent';
                }, 50 + Math.random() * 50);
            }
        }, 100);
    }
    
    // Start terminal animation with a faster refresh rate
    const terminalInterval = setInterval(drawTerminal, 40);
    
    // Add other effects
    setTimeout(() => {
        addScanLines();
        addScreenFlicker();
    }, 500);
}); 