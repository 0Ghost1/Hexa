from data import db_session
from data.user import User

def startDB():
    db_session.global_init("db/blogs.db")

startDB()


def data(username, name, surname, sid1, sid2, sid3, sid4):
    user = User()
    user.username = username
    user.name = name
    user.surname = surname
    user.sid1 = sid1
    user.sid2 = sid2
    user.sid3 = sid3
    user.sid4 = sid4
    db_sess = db_session.create_session()
    db_sess.add(user)
    db_sess.commit()
