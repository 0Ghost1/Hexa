from data import db_session
from other import rename_file
from data.user import User
from data.chat import Chat
from data.message import Message

def startDB():
    db_session.global_init("db/blogs.db")

startDB()


def create_new_user(username, name, surname, sid1, sid2, sid3, sid4, avatar_link=None):
    """
    Создает нового пользователя в базе данных
    
    Args:
        username: Имя пользователя
        name: Имя
        surname: Фамилия
        sid1, sid2, sid3, sid4: Хеши SID фраз
        avatar_link: Путь к аватару (опционально)
        
    Returns:
        int: ID созданного пользователя
        
    Raises:
        Exception: Если возникла ошибка при создании пользователя
    """
    db_sess = db_session.create_session()
    try:
        # Проверяем, не существует ли уже пользователь с таким именем
        existing_user = db_sess.query(User).filter(User.username == username).first()
        if existing_user:
            raise ValueError(f"Пользователь с именем {username} уже существует")
        
        # Создаем нового пользователя
        user = User()
        user.username = username
        user.name = name
        user.surname = surname
        user.sid1 = sid1
        user.sid2 = sid2
        user.sid3 = sid3
        user.sid4 = sid4
        user.avatar_link = avatar_link
        
        db_sess.add(user)
        db_sess.commit()
        
        return user.id
    except Exception as e:
        db_sess.rollback()
        print(f"Ошибка при создании пользователя: {e}")
        raise
    finally:
        db_sess.close()


def search_user_sid(s1, s2, s3, s4):
    """
    Поиск пользователя по SID фразам
    
    Args:
        s1, s2, s3, s4: Хеши SID фраз
        
    Returns:
        int: ID пользователя, если найден, False в противном случае
    """
    try:
        db_sess = db_session.create_session()
        try:
            user = db_sess.query(User).filter(
                (User.sid1 == s1) & 
                (User.sid2 == s2) & 
                (User.sid3 == s3) & 
                (User.sid4 == s4)
            ).first()
            
            if user:
                return user.id
            return False
        finally:
            db_sess.close()
    except Exception as e:
        print(f"Ошибка при поиске пользователя по SID: {e}")
        return False


def check_username(username):
    """
    Проверяет, существует ли пользователь с указанным именем пользователя
    
    Args:
        username: Имя пользователя для проверки
        
    Returns:
        bool: True, если пользователь существует, False в противном случае
    """
    try:
        db_sess = db_session.create_session()
        try:
            user = db_sess.query(User).filter(User.username == username).first()
            return user is not None
        finally:
            db_sess.close()
    except Exception as e:
        print(f"Ошибка при проверке имени пользователя: {e}")
        return False


def get_username_by_id(user_id):
    db_sess = db_session.create_session()
    try:
        user = db_sess.query(User).filter(User.id == user_id).first()
        if user:
            return user.username
        return None
    finally:
        db_sess.close()


def get_user_by_id(user_id):
    db_sess = db_session.create_session()
    try:
        user = db_sess.query(User).filter(User.id == user_id).first()
        return user
    finally:
        db_sess.close()


def update_user_profile(user_id, username=None, name=None, surname=None, avatar_link=None):
    db_sess = db_session.create_session()
    try:
        user = db_sess.query(User).filter(User.id == user_id).first()

        if not user:
            return False

        if username:
            search_user = db_sess.query(User).filter(User.username == username).first()
            if search_user and search_user.id != user_id:
                return False
            rename_file(avatar_link, f"static/avatar/{username}.png")
            user.username = username

        if name:
            user.name = name

        if surname:
            user.surname = surname

        if avatar_link:
            user.avatar_link = avatar_link

        db_sess.commit()
        return True
    finally:
        db_sess.close()


def get_username(user_id):
    db_sess = db_session.create_session()
    try:
        user = db_sess.query(User).filter(User.id == user_id).first()
        return user.username
    finally:
        db_sess.close()



def get_or_create_chat(user1_id, user2_id):
    db_sess = db_session.create_session()
    try:
        chat = db_sess.query(Chat).filter(
            ((Chat.user1_id == user1_id) & (Chat.user2_id == user2_id)) |
            ((Chat.user1_id == user2_id) & (Chat.user2_id == user1_id))
        ).first()
        
        if not chat:
            chat = Chat(user1_id=user1_id, user2_id=user2_id)
            db_sess.add(chat)
            db_sess.commit()
        
        return chat.id
    finally:
        db_sess.close()


def get_user_chats(user_id):
    db_sess = db_session.create_session()
    try:
        chats = db_sess.query(Chat).filter(
            (Chat.user1_id == user_id) | (Chat.user2_id == user_id)
        ).all()

        result = []
        for chat in chats:
            other_user_id = chat.user2_id if chat.user1_id == user_id else chat.user1_id
            other_user = get_user_by_id(other_user_id)
            
            last_message = db_sess.query(Message).filter(
                Message.chat_id == chat.id
            ).order_by(Message.timestamp.desc()).first()
            
            last_message_content = last_message.content if last_message else ""
            last_message_time = last_message.timestamp if last_message else None
            
            result.append({
                'chat_id': chat.id,
                'other_user': {
                    'id': other_user.id,
                    'username': other_user.username,
                    'name': other_user.name,
                    'surname': other_user.surname,
                    'avatar': f"{other_user.username}.png"
                },
                'last_message': {
                    'content': last_message_content,
                    'timestamp': last_message_time
                }
            })
        
        return result
    finally:
        db_sess.close()


def send_message(chat_id, sender_id, content):
    db_sess = db_session.create_session()
    try:
        chat = db_sess.query(Chat).filter(Chat.id == chat_id).first()
        if not chat:
            return False

        if chat.user1_id != sender_id and chat.user2_id != sender_id:
            return False
        
        # Создаем новое сообщение
        message = Message(
            chat_id=chat_id,
            sender_id=sender_id,
            content=content
        )
        
        db_sess.add(message)
        db_sess.commit()
        
        return message.id
    finally:
        db_sess.close()


def get_chat_messages(chat_id, user_id):
    db_sess = db_session.create_session()
    try:
        chat = db_sess.query(Chat).filter(Chat.id == chat_id).first()
        if not chat:
            return []

        if chat.user1_id != user_id and chat.user2_id != user_id:
            return []
        
        messages = db_sess.query(Message).filter(
            Message.chat_id == chat_id
        ).order_by(Message.timestamp.asc()).all()

        result = []
        for msg in messages:
            sender = get_user_by_id(msg.sender_id)
            result.append({
                'id': msg.id,
                'sender': {
                    'id': sender.id,
                    'username': sender.username,
                    'name': sender.name,
                    'surname': sender.surname
                },
                'content': msg.content,
                'timestamp': msg.timestamp,
                'is_own': msg.sender_id == user_id
            })
        
        return result
    finally:
        db_sess.close()


def search_users(query, current_user_id):
    db_sess = db_session.create_session()
    try:
        users = db_sess.query(User).filter(
            (User.username.like(f"%{query}%")) &
            (User.id != current_user_id)
        ).all()
        
        result = []
        for user in users:
            result.append({
                'id': user.id,
                'username': user.username,
                'name': user.name,
                'surname': user.surname,
                'avatar': f"{user.username}.png"
            })
        
        return result
    finally:
        db_sess.close()


def get_chat_participants(chat_id):
    db_sess = db_session.create_session()
    try:
        chat = db_sess.query(Chat).filter(Chat.id == chat_id).first()
        
        if chat:
            return (chat.user1_id, chat.user2_id)
        return None
    finally:
        db_sess.close()




