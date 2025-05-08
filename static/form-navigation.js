document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item');
    let currentIndex = 0;

    // Скрываем курсор мыши
    document.body.style.cursor = 'none';

    // Инициализация первого выбранного элемента
    navItems[currentIndex].classList.add('selected');

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