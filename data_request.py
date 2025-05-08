from data import db_session

def startDB():
    db_session.global_init("db/blogs.db")

startDB()