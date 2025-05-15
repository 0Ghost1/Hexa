import datetime
import sqlalchemy
from sqlalchemy import orm
from .db_session import SqlAlchemyBase


class User(SqlAlchemyBase):
    __tablename__ = 'users'

    id = sqlalchemy.Column(sqlalchemy.Integer,
                           primary_key=True, autoincrement=True)

    username = sqlalchemy.Column(sqlalchemy.String, nullable=True, index=True, unique=True)

    name = sqlalchemy.Column(sqlalchemy.String, nullable=True)

    surname = sqlalchemy.Column(sqlalchemy.String, nullable=True)

    sid1 = sqlalchemy.Column(sqlalchemy.String, nullable=True)
    sid2 = sqlalchemy.Column(sqlalchemy.String, nullable=True)
    sid3 = sqlalchemy.Column(sqlalchemy.String, nullable=True)
    sid4 = sqlalchemy.Column(sqlalchemy.String, nullable=True)

    avatar_link = sqlalchemy.Column(sqlalchemy.String, nullable=True)
    
    # Отношения для чатов, где пользователь является инициатором
    chats_initiated = orm.relationship('Chat', foreign_keys='Chat.user1_id', 
                                      backref='initiator', lazy='dynamic')
    # Отношения для чатов, где пользователь является получателем
    chats_received = orm.relationship('Chat', foreign_keys='Chat.user2_id', 
                                    backref='receiver', lazy='dynamic')
    # Отношения для сообщений, отправленных пользователем
    messages = orm.relationship('Message', foreign_keys='Message.sender_id', 
                              backref='sender', lazy='dynamic')



