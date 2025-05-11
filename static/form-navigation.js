document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item');
    let currentIndex = 0;

    // Инициализация первого выбранного элемента
    navItems[currentIndex].classList.add('selected');

    // Add mouse interaction support
    navItems.forEach((item, index) => {
        // Add click handling for form elements
        item.addEventListener('click', () => {
            navItems[currentIndex].classList.remove('selected');
            currentIndex = index;
            item.classList.add('selected');
            
            if (item.classList.contains('file-label')) {
                // If it's a file label, click the hidden file input
                item.querySelector('input[type="file"]').click();
            } else if (item.tagName === 'INPUT') {
                // If it's an input field, focus on it
                item.focus();
            }
        });
        
        // Highlight on hover
        item.addEventListener('mouseenter', () => {
            navItems[currentIndex].classList.remove('selected');
            item.classList.add('selected');
        });
        
        item.addEventListener('mouseleave', () => {
            if (currentIndex !== index) {
                item.classList.remove('selected');
                navItems[currentIndex].classList.add('selected');
            }
        });
    });

    document.addEventListener('keydown', (e) => {
        switch(e.key) {
            case 'ArrowUp':
                e.preventDefault();
                navItems[currentIndex].classList.remove('selected');
                currentIndex = (currentIndex - 1 + navItems.length) % navItems.length;
                navItems[currentIndex].classList.add('selected');
                break;
            case 'ArrowDown':
                e.preventDefault();
                navItems[currentIndex].classList.remove('selected');
                currentIndex = (currentIndex + 1) % navItems.length;
                navItems[currentIndex].classList.add('selected');
                break;
            case 'Enter':
                e.preventDefault();
                const currentElement = navItems[currentIndex];
                
                if (currentElement.classList.contains('file-label')) {
                    // Если это метка файла, кликаем по скрытому input[type="file"]
                    currentElement.querySelector('input[type="file"]').click();
                } else if (currentElement.tagName === 'INPUT') {
                    // Если это поле ввода, фокусируемся на нем
                    currentElement.focus();
                } else {
                    // Для остальных элементов (кнопки, ссылки) - клик
                    currentElement.click();
                }
                break;
        }

        // Если элемент видимый, прокручиваем к нему
        navItems[currentIndex].scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
        });
    });

    // Обработка потери фокуса для input
    navItems.forEach(item => {
        if (item.tagName === 'INPUT') {
            item.addEventListener('blur', () => {
                // Возвращаем выделение текущему элементу
                item.classList.add('selected');
            });
        }
    });
}); 