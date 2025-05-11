// Terminal-style animation for Hexa main page

document.addEventListener('DOMContentLoaded', () => {
    // Create the Terminal canvas element
    const canvas = document.createElement('canvas');
    canvas.id = 'terminalCanvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '1';
    document.body.insertBefore(canvas, document.body.firstChild);

    // Terminal effect context
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Define the terms to display
    const keywords = ["__init__", "Danchik"];
    
    // Создаем фразы для строк с ключевыми словами
    const prefixes = [
        "Initializing ", "Loading ", "Running ", "Executing ", "Starting ",
        "System ", "Process ", "Module ", "Function ", "Class ", 
        "Error in ", "Warning: ", "Success: ", "Debug: ", "Info: ",
        "Access ", "User ", "Connection ", "Network ", "File "
    ];
    
    const suffixes = [
        " module", " process", " sequence", " protocol", " function",
        " class", " method", " routine", " system", " algorithm",
        " loaded", " started", " connected", " active", " online",
        " complete", " found", " verified", " authorized", " detected"
    ];
    
    // Settings for the terminal lines
    const lineHeight = 30; // Increased space between lines
    const fontSize = 18;
    // Fewer lines - approximately one line every 70 pixels of height for more spacing
    const linesPerScreen = Math.ceil(canvas.height / 70);
    const lines = [];
    
    // Создаем массив случайных фраз для каждой строки
    const generatePhrase = () => {
        const keyword = keywords[Math.floor(Math.random() * keywords.length)];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        return { phrase: prefix + keyword + suffix, keyword: keyword };
    };
    
    // Create initial lines (off-screen)
    for (let i = 0; i < linesPerScreen; i++) {
        lines.push({
            y: -lineHeight * (i + 1) * 3, // More space between initial lines
            speed: 0.5 + Math.random() * 0.5, // Slower speed for calmer animation
            alpha: 0.3 + Math.random() * 0.2, // Dimmer lines
            phraseData: generatePhrase(),
            // Flag to indicate if this line should keep its phrase
            phraseFixed: true
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
            line.y += line.speed;
            
            // If line goes off screen, reset to top with delay
            if (line.y > canvas.height) {
                line.y = -lineHeight * (3 + Math.random() * 5); // Random delay before new line appears
                line.speed = 0.5 + Math.random() * 0.5; // Slower speed
                line.alpha = 0.3 + Math.random() * 0.2; // Dimmer lines
                
                // Only generate a new phrase when the line resets
                line.phraseData = generatePhrase();
            }
            
            // Only draw if the line is in view
            if (line.y > -lineHeight && line.y < canvas.height) {
                // Set color with varying opacity for more realistic effect
                ctx.fillStyle = `rgba(0, 255, 0, ${line.alpha})`;
                
                // Draw the phrase on this line
                const x = Math.random() * 100 + 20; // Random indent from left
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
                ctx.fillText(beforeKeyword, x, line.y);
                
                // Set bold font for keyword
                ctx.font = `bold ${fontSize}px Courier, monospace`;
                
                // Draw keyword
                ctx.fillText(keyword, x + beforeWidth, line.y);
                
                // Measure the width of the keyword
                const keywordWidth = ctx.measureText(keyword).width;
                
                // Reset font for text after keyword
                ctx.font = `${fontSize}px Courier, monospace`;
                
                // Draw text after keyword
                ctx.fillText(afterKeyword, x + beforeWidth + keywordWidth, line.y);
                
                // Sometimes add a blinking cursor at the end of a line
                if (Math.random() > 0.995) {
                    if (Math.floor(Date.now() / 500) % 2 === 0) {
                        // Calculate total width of the text
                        const totalWidth = beforeWidth + keywordWidth + ctx.measureText(afterKeyword).width;
                        ctx.fillText('█', x + totalWidth + 5, line.y);
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
        const newLinesPerScreen = Math.ceil(canvas.height / 70);
        
        // Reset lines array to maintain proper ratio
        lines.length = 0;
        
        // Recreate lines
        for (let i = 0; i < newLinesPerScreen; i++) {
            lines.push({
                y: -lineHeight * (i + 1) * 3,
                speed: 0.5 + Math.random() * 0.5, // Slower speed
                alpha: 0.3 + Math.random() * 0.2, // Dimmer lines
                phraseData: generatePhrase(),
                phraseFixed: true
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
            position = (position + 0.7) % (window.innerHeight + 5); // Slower scan line
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
                overlay.style.backgroundColor = 'rgba(0, 255, 0, 0.02)'; // Dimmer effect
                setTimeout(() => {
                    overlay.style.backgroundColor = 'transparent';
                }, 50 + Math.random() * 50);
            }
        }, 100);
    }
    
    // Start terminal animation with a slightly slower refresh rate
    const terminalInterval = setInterval(drawTerminal, 60);
    
    // Add other effects
    setTimeout(() => {
        addScanLines();
        addScreenFlicker();
    }, 500);
}); 