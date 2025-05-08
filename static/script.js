document.addEventListener('DOMContentLoaded', () => {
    const menuItems = document.querySelectorAll('.menu-item');
    let currentIndex = 0;

    // Скрываем курсор мыши
    document.body.style.cursor = 'none';

    // Инициализация первого выбранного элемента
    menuItems[currentIndex].classList.add('selected');

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