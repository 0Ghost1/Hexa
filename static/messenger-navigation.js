document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item');
    let currentIndex = 0;
    let currentSection = 'sidebar'; // sidebar или chat
    let chatIndex = 0; // Индекс для элементов чата

    // Скрываем курсор мыши
    document.body.style.cursor = 'none';

    // Инициализация первого выбранного элемента
    navItems[currentIndex].classList.add('selected');

    // Получение элементов чата
    const chatItems = document.querySelectorAll('.chat-area .nav-item');

    document.addEventListener('keydown', (e) => {
        switch(e.key) {
            case 'ArrowUp':
                e.preventDefault();
                if (currentSection === 'sidebar') {
                    navItems[currentIndex].classList.remove('selected');
                    currentIndex = (currentIndex - 1 + navItems.length) % navItems.length;
                    navItems[currentIndex].classList.add('selected');
                } else if (currentSection === 'chat') {
                    // В чате не имеет смысла идти вверх, возможно, возврат к сайдбару
                    currentSection = 'sidebar';
                    
                    // Сбрасываем выделение в чате
                    chatItems.forEach(item => item.classList.remove('selected'));
                    
                    // Выделяем последний выбранный элемент в сайдбаре
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
                    
                    // Сбрасываем выделение в чате
                    chatItems.forEach(item => item.classList.remove('selected'));
                    
                    // Выделяем последний выбранный элемент в сайдбаре
                    navItems[currentIndex].classList.add('selected');
                }
                break;
            case 'ArrowRight':
                e.preventDefault();
                if (currentSection === 'sidebar') {
                    // Переход к чату независимо от выбранного элемента в сайдбаре
                    currentSection = 'chat';
                    
                    // Сбрасываем выделение в сайдбаре
                    navItems.forEach(item => item.classList.remove('selected'));
                    
                    // Выделяем первый элемент в чате (поле ввода сообщения)
                    chatIndex = 0;
                    chatItems[chatIndex].classList.add('selected');
                    
                    // Если это поле ввода, устанавливаем на него фокус
                    if (chatItems[chatIndex].classList.contains('message-input')) {
                        chatItems[chatIndex].focus();
                    }
                } else if (currentSection === 'chat') {
                    // Переключение между элементами в чате
                    chatItems[chatIndex].classList.remove('selected');
                    chatIndex = (chatIndex + 1) % chatItems.length;
                    chatItems[chatIndex].classList.add('selected');
                    
                    // Если это поле ввода, устанавливаем на него фокус
                    if (chatItems[chatIndex].classList.contains('message-input')) {
                        chatItems[chatIndex].focus();
                    }
                }
                break;
            case 'Enter':
                e.preventDefault();
                if (currentSection === 'sidebar') {
                    const currentElement = navItems[currentIndex];
                    
                    if (currentElement.classList.contains('search-input')) {
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
                        
                        // После выбора чата, переключаемся на область чата
                        setTimeout(() => {
                            currentSection = 'chat';
                            navItems[currentIndex].classList.remove('selected');
                            chatIndex = 0;
                            chatItems[chatIndex].classList.add('selected');
                            if (chatItems[chatIndex].classList.contains('message-input')) {
                                chatItems[chatIndex].focus();
                            }
                        }, 300);
                    } else if (currentElement.classList.contains('settings-button')) {
                        // Открытие/закрытие панели настроек
                        toggleSettings();
                    }
                } else if (currentSection === 'chat') {
                    const currentElement = chatItems[chatIndex];
                    
                    if (currentElement.classList.contains('message-input')) {
                        currentElement.focus();
                    } else if (currentElement.classList.contains('send-button')) {
                        // Отправка сообщения
                        const messageInput = document.querySelector('.message-input');
                        if (messageInput.value.trim()) {
                            // Здесь будет логика отправки сообщения
                            messageInput.value = '';
                        }
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
            } else if (currentSection === 'chat') {
                // Возвращаем выделение на активный элемент чата
                chatItems.forEach(item => item.classList.remove('selected'));
                chatItems[chatIndex].classList.add('selected');
            }
        });
    });
}); 