document.addEventListener('DOMContentLoaded', () => {
    // Получаем элементы интерфейса
    const chatList = document.querySelector('.chat-list');
    const chatMessagesContainer = document.querySelector('.chat-messages');
    const messageInput = document.querySelector('.message-input');
    const sendButton = document.querySelector('.send-button');
    const searchInput = document.querySelector('.search-input');
    
    // Текущий активный чат
    let activeChat = null;
    
    // Время последнего обновления чатов
    let lastChatUpdate = new Date();
    
    // Интервал для проверки новых чатов (в миллисекундах)
    const CHAT_UPDATE_INTERVAL = 15000; // 15 секунд вместо 30 секунд
    
    // Минимальная задержка между запросами
    const MIN_REQUEST_DELAY = 5000; // 5 секунд
    
    // Хранилище для информации о чатах
    let knownChats = {};
    
    // Флаг для отслеживания выполнения запроса
    let isRequestInProgress = false;
    
    // Аудио-элемент для уведомлений
    const newMessageSound = document.getElementById('newMessageSound');
    
    // Функция для воспроизведения звукового уведомления
    function playNotificationSound() {
        if (newMessageSound) {
            newMessageSound.currentTime = 0; // Перематываем в начало
            newMessageSound.play().catch(error => {
                // Игнорируем ошибки воспроизведения (могут возникнуть из-за политик браузера)
                console.log('Не удалось воспроизвести звук уведомления:', error);
            });
        }
    }
    
    // Функция для загрузки списка чатов
    function loadChats() {
        // Если запрос уже выполняется, не делаем новый запрос
        if (isRequestInProgress) {
            return Promise.reject(new Error('Запрос уже выполняется'));
        }
        
        isRequestInProgress = true;
        
        return new Promise((resolve, reject) => {
            fetch('/api/chats')
                .then(response => response.json())
                .then(data => {
                    isRequestInProgress = false;
                    if (data.success) {
                        // Проверяем на новые чаты
                        checkForNewChatMessages(data.chats);
                        renderChatList(data.chats);
                        resolve(data.chats);
                    } else {
                        reject(new Error('Ошибка при загрузке чатов'));
                    }
                })
                .catch(error => {
                    isRequestInProgress = false;
                    console.error('Ошибка при загрузке чатов:', error);
                    reject(error);
                });
        });
    }
    
    // Функция для проверки новых сообщений в чатах
    function checkForNewChatMessages(chats) {
        let hasNewMessages = false;
        let hasNewChats = false;
        
        chats.forEach(chat => {
            const chatId = chat.chat_id;
            
            // Если это новый чат, которого не было раньше
            if (!knownChats[chatId]) {
                knownChats[chatId] = {
                    lastMessageTime: chat.last_message.timestamp ? new Date(chat.last_message.timestamp) : null,
                    hasNewMessages: true,
                    isNewChat: true
                };
                hasNewMessages = true;
                hasNewChats = true;
                return;
            }
            
            // Если в чате есть новое сообщение
            if (chat.last_message.timestamp) {
                const lastMessageTime = new Date(chat.last_message.timestamp);
                if (!knownChats[chatId].lastMessageTime || 
                    lastMessageTime > knownChats[chatId].lastMessageTime) {
                    // Если это не активный чат, отмечаем, что есть новые сообщения
                    if (chatId != activeChat) {
                        knownChats[chatId].hasNewMessages = true;
                        hasNewMessages = true;
                    }
                    knownChats[chatId].lastMessageTime = lastMessageTime;
                }
            }
        });
        
        // Если есть новые чаты, обновляем интерфейс
        if (hasNewChats) {
            console.log("Обнаружены новые чаты!");
            // Здесь можно добавить дополнительные действия для новых чатов
        }
        
        // Если есть новые сообщения, воспроизводим звуковое уведомление
        if (hasNewMessages) {
            playNotificationSound();
        }
    }
    
    // Функция для проверки новых чатов
    function checkForNewChats() {
        // Проверяем, прошло ли достаточно времени с последнего обновления
        const now = new Date();
        const timeSinceLastUpdate = now - lastChatUpdate;
        
        // Если прошло меньше минимальной задержки или запрос уже выполняется, пропускаем
        if (timeSinceLastUpdate < MIN_REQUEST_DELAY || isRequestInProgress) {
            return;
        }
        
        loadChats()
            .then(chats => {
                // Обновляем время последнего обновления
                lastChatUpdate = new Date();
                
                // Если есть активный чат, обновляем его сообщения
                if (activeChat) {
                    // Не делаем новый запрос, если предыдущий еще выполняется
                    if (!isRequestInProgress) {
                        loadMessages(activeChat);
                        // Сбрасываем флаг новых сообщений для активного чата
                        if (knownChats[activeChat]) {
                            knownChats[activeChat].hasNewMessages = false;
                        }
                    }
                }
            })
            .catch(error => {
                // Если ошибка связана с тем, что запрос уже выполняется, игнорируем
                if (error.message !== 'Запрос уже выполняется') {
                    console.error('Ошибка при проверке новых чатов:', error);
                }
            });
    }
    
    // Запускаем периодическую проверку новых чатов
    setInterval(checkForNewChats, CHAT_UPDATE_INTERVAL);
    
    // Функция для отображения списка чатов
    function renderChatList(chats) {
        // Очищаем список чатов
        if (chatList) {
            chatList.innerHTML = '';
            
            if (chats.length === 0) {
                // Если чатов нет, показываем сообщение
                const emptyMessage = document.createElement('div');
                emptyMessage.className = 'empty-chats';
                emptyMessage.innerHTML = `
                    <p>У вас пока нет чатов.</p>
                    <p>Найдите собеседника, используя поиск выше.</p>
                `;
                chatList.appendChild(emptyMessage);
                return;
            }
            
            // Добавляем чаты в список
            chats.forEach(chat => {
                const chatItem = document.createElement('div');
                chatItem.className = 'chat-item nav-item';
                chatItem.dataset.chatId = chat.chat_id;
                
                // Если это активный чат, добавляем класс active
                if (activeChat === chat.chat_id) {
                    chatItem.classList.add('active');
                }
                
                // Если в чате есть новые сообщения, добавляем соответствующий класс
                if (knownChats[chat.chat_id] && knownChats[chat.chat_id].hasNewMessages && 
                    activeChat !== chat.chat_id) {
                    chatItem.classList.add('has-new-messages');
                }
                
                // Временная метка последнего сообщения
                let lastMessageTime = '';
                if (chat.last_message.timestamp) {
                    const date = new Date(chat.last_message.timestamp);
                    lastMessageTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                }
                
                chatItem.innerHTML = `
                    <div class="chat-avatar">
                        <img src="/static/avatar/${chat.other_user.avatar}" alt="${chat.other_user.username}">
                    </div>
                    <div class="chat-info">
                        <div class="chat-name">${chat.other_user.name} ${chat.other_user.surname}</div>
                        <div class="last-message">${chat.last_message.content}</div>
                    </div>
                    <div class="chat-time">${lastMessageTime}</div>
                    <div class="new-message-indicator"></div>
                `;
                
                // Добавляем обработчик клика для переключения на чат
                chatItem.addEventListener('click', () => {
                    // Устанавливаем активный чат
                    activeChat = chat.chat_id;
                    
                    // Сбрасываем флаг новых сообщений
                    if (knownChats[chat.chat_id]) {
                        knownChats[chat.chat_id].hasNewMessages = false;
                    }
                    
                    // Загружаем сообщения
                    loadMessages(chat.chat_id);
                    
                    // Обновляем заголовок чата
                    const chatTitle = document.querySelector('.chat-title');
                    if (chatTitle) {
                        chatTitle.textContent = `${chat.other_user.name} ${chat.other_user.surname}`;
                    }
                    
                    // Добавляем выделение активного чата и убираем индикатор новых сообщений
                    document.querySelectorAll('.chat-item').forEach(item => {
                        item.classList.remove('active', 'selected', 'has-new-messages');
                    });
                    chatItem.classList.add('active', 'selected');
                    
                    // Разблокируем поле ввода и кнопку отправки
                    const messageInput = document.querySelector('.message-input');
                    if (messageInput) {
                        messageInput.disabled = false;
                        messageInput.placeholder = 'INPUT@MESSAGE$';
                        
                        // Фокусируемся на поле ввода
                        setTimeout(() => {
                            messageInput.focus();
                        }, 300);
                    }
                    
                    const sendButton = document.querySelector('.send-button');
                    if (sendButton) {
                        sendButton.disabled = false;
                    }
                    
                    // Если есть результаты поиска, скрываем их
                    const searchResults = document.querySelector('.search-results');
                    if (searchResults) {
                        searchResults.innerHTML = '';
                    }
                });
                
                chatList.appendChild(chatItem);
            });
        }
    }
    
    // Функция для загрузки сообщений чата
    function loadMessages(chatId) {
        // Если запрос уже выполняется, не делаем новый запрос
        if (isRequestInProgress) {
            return;
        }
        
        isRequestInProgress = true;
        
        fetch(`/api/chat/${chatId}`)
            .then(response => response.json())
            .then(data => {
                isRequestInProgress = false;
                if (data.success) {
                    renderMessages(data.messages);
                }
            })
            .catch(error => {
                isRequestInProgress = false;
                console.error('Ошибка при загрузке сообщений:', error);
            });
    }
    
    // Функция для отображения сообщений
    function renderMessages(messages) {
        if (chatMessagesContainer) {
            chatMessagesContainer.innerHTML = '';
            
            messages.forEach(msg => {
                const messageElement = document.createElement('div');
                messageElement.className = `message ${msg.is_own ? 'own-message' : 'other-message'}`;
                
                // Форматируем дату
                const date = new Date(msg.timestamp);
                const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                messageElement.innerHTML = `
                    <div class="message-content">
                        <div class="message-text">${msg.content}</div>
                        <div class="message-time">${formattedTime}</div>
                    </div>
                `;
                
                chatMessagesContainer.appendChild(messageElement);
            });
            
            // Прокручиваем к последнему сообщению
            chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
        }
    }
    
    // Функция для отправки сообщения
    function sendMessage(chatId, content) {
        // Если запрос уже выполняется, не делаем новый запрос
        if (isRequestInProgress) {
            return;
        }
        
        isRequestInProgress = true;
        
        fetch(`/api/chat/${chatId}/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content })
        })
        .then(response => response.json())
        .then(data => {
            isRequestInProgress = false;
            if (data.success) {
                // После успешной отправки загружаем сообщения заново
                loadMessages(chatId);
                // Обновляем список чатов, чтобы показать последнее сообщение
                loadChats();
                // Обновляем время последнего обновления
                lastChatUpdate = new Date();
                
                // Запускаем таймер для немедленного обновления чатов у получателя
                setTimeout(checkForNewChats, MIN_REQUEST_DELAY);
            }
        })
        .catch(error => {
            isRequestInProgress = false;
            console.error('Ошибка при отправке сообщения:', error);
        });
    }
    
    // Обработчик нажатия кнопки отправки
    if (sendButton) {
        sendButton.addEventListener('click', () => {
            if (activeChat && messageInput.value.trim()) {
                sendMessage(activeChat, messageInput.value.trim());
                messageInput.value = '';
            }
        });
    }
    
    // Обработчик нажатия Enter в поле ввода
    if (messageInput) {
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey && messageInput.value.trim()) {
                e.preventDefault();
                if (activeChat) {
                    sendMessage(activeChat, messageInput.value.trim());
                    messageInput.value = '';
                }
            }
        });
    }
    
    // Функция для поиска пользователей
    function searchUsers(query) {
        // Если запрос уже выполняется, не делаем новый запрос
        if (isRequestInProgress) {
            return;
        }
        
        isRequestInProgress = true;
        
        fetch(`/api/users/search?q=${encodeURIComponent(query)}`)
            .then(response => response.json())
            .then(data => {
                isRequestInProgress = false;
                if (data.success) {
                    displaySearchResults(data.users);
                }
            })
            .catch(error => {
                isRequestInProgress = false;
                console.error('Ошибка при поиске пользователей:', error);
            });
    }
    
    // Функция для отображения результатов поиска
    function displaySearchResults(users) {
        // Проверяем существует ли контейнер результатов поиска
        let searchResults = document.querySelector('.search-results');
        
        // Если нет, создаем его
        if (!searchResults) {
            searchResults = document.createElement('div');
            searchResults.className = 'search-results';
            const searchContainer = document.querySelector('.search-container');
            if (searchContainer) {
                searchContainer.appendChild(searchResults);
            }
        }
        
        // Очищаем предыдущие результаты
        searchResults.innerHTML = '';
        
        if (users.length === 0) {
            searchResults.innerHTML = '<div class="no-results">Пользователи не найдены</div>';
            return;
        }
        
        // Отображаем результаты
        users.forEach(user => {
            const userElement = document.createElement('div');
            userElement.className = 'search-result-item';
            
            userElement.innerHTML = `
                <div class="user-avatar">
                    <img src="/static/avatar/${user.avatar}" alt="${user.username}">
                </div>
                <div class="user-info">
                    <div class="user-name">${user.name} ${user.surname}</div>
                    <div class="user-username">@${user.username}</div>
                </div>
            `;
            
            // Добавляем обработчик клика для создания чата
            userElement.addEventListener('click', () => {
                createChat(user.id);
                // Скрываем результаты поиска
                searchResults.innerHTML = '';
                // Очищаем поле поиска
                searchInput.value = '';
            });
            
            searchResults.appendChild(userElement);
        });
    }
    
    // Функция для создания чата
    function createChat(userId) {
        // Если запрос уже выполняется, не делаем новый запрос
        if (isRequestInProgress) {
            return;
        }
        
        isRequestInProgress = true;
        
        fetch('/api/chat/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user_id: userId })
        })
        .then(response => response.json())
        .then(data => {
            isRequestInProgress = false;
            if (data.success) {
                // После создания чата переходим к нему
                activeChat = data.chat_id;
                loadMessages(data.chat_id);
                
                // Обновляем список чатов и активируем созданный чат
                loadChats().then(() => {
                    // Находим и активируем чат в списке
                    const chatItems = document.querySelectorAll('.chat-item');
                    chatItems.forEach(item => {
                        if (item.dataset.chatId == data.chat_id) {
                            // Обновляем визуальное выделение
                            chatItems.forEach(i => i.classList.remove('active', 'selected'));
                            item.classList.add('active', 'selected');
                            
                            // Обновляем заголовок чата
                            const chatName = item.querySelector('.chat-name');
                            if (chatName) {
                                const chatTitle = document.querySelector('.chat-title');
                                if (chatTitle) {
                                    chatTitle.textContent = chatName.textContent;
                                }
                            }
                            
                            // Фокусируемся на поле ввода сообщения
                            setTimeout(() => {
                                const messageInput = document.querySelector('.message-input');
                                if (messageInput) {
                                    messageInput.focus();
                                    messageInput.disabled = false;
                                }
                                
                                const sendButton = document.querySelector('.send-button');
                                if (sendButton) {
                                    sendButton.disabled = false;
                                }
                            }, 300);
                        }
                    });
                });
            }
        })
        .catch(error => {
            isRequestInProgress = false;
            console.error('Ошибка при создании чата:', error);
        });
    }
    
    // Функция debounce для ограничения частоты вызовов функции
    function debounce(func, delay) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), delay);
        };
    }
    
    // Обработчик ввода в поле поиска с debounce
    if (searchInput) {
        const debouncedSearch = debounce((query) => {
            if (query.length >= 2) {
                searchUsers(query);
            } else {
                // Скрываем результаты поиска, если запрос короткий
                const searchResults = document.querySelector('.search-results');
                if (searchResults) {
                    searchResults.innerHTML = '';
                }
            }
        }, 500); // Задержка в 500 мс
        
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            debouncedSearch(query);
        });
    }
    
    // Автоматически загружаем чаты при загрузке страницы и активируем чат, если нужно
    loadChats().then(() => {
        // Если в URL есть ID активного чата, загружаем его
        const urlParams = new URLSearchParams(window.location.search);
        const chatId = urlParams.get('chat_id');
        
        if (chatId) {
            activeChat = parseInt(chatId);
            loadMessages(activeChat);
            
            // Активируем соответствующий элемент чата в списке
            const chatItems = document.querySelectorAll('.chat-item');
            chatItems.forEach(item => {
                if (item.dataset.chatId == chatId) {
                    item.classList.add('active', 'selected');
                    
                    // Обновляем заголовок чата
                    const chatName = item.querySelector('.chat-name');
                    if (chatName) {
                        const chatTitle = document.querySelector('.chat-title');
                        if (chatTitle) {
                            chatTitle.textContent = chatName.textContent;
                        }
                    }
                    
                    // Разблокируем поле ввода и кнопку отправки
                    const messageInput = document.querySelector('.message-input');
                    if (messageInput) {
                        messageInput.disabled = false;
                    }
                    
                    const sendButton = document.querySelector('.send-button');
                    if (sendButton) {
                        sendButton.disabled = false;
                    }
                }
            });
        } else {
            // Если активный чат не выбран, блокируем поле ввода и кнопку отправки
            const messageInput = document.querySelector('.message-input');
            if (messageInput) {
                messageInput.disabled = true;
                messageInput.placeholder = 'CHOIS@CHAT$';
            }
            
            const sendButton = document.querySelector('.send-button');
            if (sendButton) {
                sendButton.disabled = true;
            }
            
            // Обновляем заголовок чата
            const chatTitle = document.querySelector('.chat-title');
            if (chatTitle) {
                chatTitle.textContent = 'Выберите чат';
            }
        }
        
        // Устанавливаем время последнего обновления
        lastChatUpdate = new Date();
        
        // Запускаем немедленную проверку новых чатов
        setTimeout(checkForNewChats, MIN_REQUEST_DELAY);
        
    }).catch(error => {
        console.error('Ошибка при инициализации чатов:', error);
    });
}); 