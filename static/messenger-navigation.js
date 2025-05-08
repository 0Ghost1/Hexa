document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item');
    let currentIndex = 0;
    let currentSection = 'sidebar'; // sidebar или chat

    // Скрываем курсор мыши
    document.body.style.cursor = 'none';

    // Инициализация первого выбранного элемента
    navItems[currentIndex].classList.add('selected');

    document.addEventListener('keydown', (e) => {
        switch(e.key) {
            case 'ArrowUp':
                e.preventDefault();
                if (currentSection === 'sidebar') {
                    navItems[currentIndex].classList.remove('selected');
                    currentIndex = (currentIndex - 1 + navItems.length) % navItems.length;
                    navItems[currentIndex].classList.add('selected');
                }
                break;
            case 'ArrowDown':
                e.preventDefault();
                if (currentSection === 'sidebar') {
                    navItems[currentIndex].classList.remove('selected');
                    currentIndex = (currentIndex + 1) % navItems.length;
                    navItems[currentIndex].classList.add('selected');
                }
                break;
            case 'ArrowLeft':
                e.preventDefault();
                if (currentSection === 'chat') {
                    currentSection = 'sidebar';
                    // Активируем последний выбранный элемент в сайдбаре
                    navItems[currentIndex].classList.add('selected');
                }
                break;
            case 'ArrowRight':
                e.preventDefault();
                if (currentSection === 'sidebar' && currentIndex >= 2) { // Если выбран чат
                    currentSection = 'chat';
                    // Активируем поле ввода сообщения
                    document.querySelector('.message-input').classList.add('selected');
                }
                break;
            case 'Enter':
                e.preventDefault();
                const currentElement = navItems[currentIndex];
                
                if (currentElement.classList.contains('search-input') || 
                    currentElement.classList.contains('message-input')) {
                    currentElement.focus();
                } else if (currentElement.classList.contains('chat-item')) {
                    // Переключение на выбранный чат
                    document.querySelectorAll('.chat-item').forEach(item => {
                        item.classList.remove('selected');
                    });
                    currentElement.classList.add('selected');
                    // Обновляем заголовок чата
                    document.querySelector('.chat-title').textContent = 
                        currentElement.querySelector('.chat-name').textContent;
                } else if (currentElement.classList.contains('send-button')) {
                    // Отправка сообщения
                    const messageInput = document.querySelector('.message-input');
                    if (messageInput.value.trim()) {
                        // Здесь будет логика отправки сообщения
                        messageInput.value = '';
                    }
                }
                break;
        }

        // Прокрутка к выбранному элементу
        if (currentSection === 'sidebar') {
            navItems[currentIndex].scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            });
        }
    });

    // Обработка потери фокуса для input
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('blur', () => {
            if (currentSection === 'sidebar') {
                navItems[currentIndex].classList.add('selected');
            }
        });
    });
}); 