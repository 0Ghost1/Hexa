from data import db_session
from data.user import User

def startDB():
    db_session.global_init("db/blogs.db")

startDB()


def create_new_user(username, name, surname, sid1, sid2, sid3, sid4, avatar_link=None):
    user = User()
    user.username = username
    user.name = name
    user.surname = surname
    user.sid1 = sid1
    user.sid2 = sid2
    user.sid3 = sid3
    user.sid4 = sid4
    if avatar_link:
        user.avatar_link = avatar_link
    db_sess = db_session.create_session()
    db_sess.add(user)
    db_sess.commit()

    return user.id


def search_user_sid(s1, s2, s3, s4):
    db_sess = db_session.create_session()
    for user in db_sess.query(User).filter((User.sid1 == s1) and (User.sid2 == s2) and (User.sid3 == s3) and (User.sid4 == s4)):
        if user:
            return user.id
        else:
            return False


def check_username(username):
    db_sess = db_session.create_session()
    user = db_sess.query(User).filter(User.username == username).first()
    return user is not None


def get_username_by_id(user_id):
    """
    Возвращает имя пользователя по его ID
    """
    db_sess = db_session.create_session()
    user = db_sess.query(User).filter(User.id == user_id).first()
    if user:
        return user.username
    return None
