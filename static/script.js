document.addEventListener('DOMContentLoaded', () => {
    const menuItems = document.querySelectorAll('.menu-item');
    let currentIndex = 0;

    // Инициализация первого выбранного элемента
    menuItems[currentIndex].classList.add('selected');
    
    // Add mouse interaction support
    menuItems.forEach((item, index) => {
        // Highlight on hover
        item.addEventListener('mouseenter', () => {
            menuItems[currentIndex].classList.remove('selected');
            item.classList.add('selected');
            currentIndex = index;
        });
        
        item.addEventListener('mouseleave', () => {
            if (currentIndex !== index) {
                item.classList.remove('selected');
            }
        });
    });

    document.addEventListener('keydown', (e) => {
        switch(e.key) {
            case 'ArrowUp':
                e.preventDefault();
                menuItems[currentIndex].classList.remove('selected');
                currentIndex = (currentIndex - 1 + menuItems.length) % menuItems.length;
                menuItems[currentIndex].classList.add('selected');
                break;
            case 'ArrowDown':
                e.preventDefault();
                menuItems[currentIndex].classList.remove('selected');
                currentIndex = (currentIndex + 1) % menuItems.length;
                menuItems[currentIndex].classList.add('selected');
                break;
            case 'Enter':
                e.preventDefault();
                menuItems[currentIndex].click();
                break;
        }
    });
}); 