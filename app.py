from flask import Flask, render_template, request, jsonify, redirect, url_for, session
from werkzeug.utils import secure_filename
import os
from other import generate_random_sid, hash_string_sha256, save_avatar, rename_file, check_file_name, \
    moderation_username
from data_request import (create_new_user, search_user_sid, check_username, get_user_by_id,
                          update_user_profile, get_username, get_user_chats, get_or_create_chat,
                          send_message, get_chat_messages, search_users, get_chat_participants, get_user,
                          get_other_user_id_in_chat, delete_user_account, find_user_chats)

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['AVATAR_FOLDER'] = 'static/avatar'
app.config['MAX_CONTENT_LENGTH'] = (16 * 1024
                                    * 1024)
app.secret_key = 'HEXAtheBESTSIte'
app.config['COOKIE_MAX_AGE'] = 30 * 24 * 60 * 60

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['AVATAR_FOLDER'], exist_ok=True)


@app.route('/')
def index():
    user_id = request.cookies.get('hexa_user_id')
    if user_id:
        user = get_user_by_id(int(user_id))
        if user:
            session['user_id'] = int(user_id)
            return redirect(url_for('messenger'))

    return render_template('index.html')


@app.route('/register', methods=['GET', 'POST'])
def register():
    user_id = request.cookies.get('hexa_user_id')
    if user_id:
        user = get_user_by_id(int(user_id))
        if user:
            session['user_id'] = int(user_id)
            return redirect(url_for('messenger'))

    error_message = None
    if request.method == 'POST':
        username = request.form.get('username')
        name = request.form.get('name')
        surname = request.form.get('surname')
        filename = None
        remember_me = request.form.get('remember_me') == 'on'

        if not username or not name or not surname:
            error_message = "ERROR: All fields are required"
            print(error_message)
            return render_template('register.html', error_message=error_message), 400

        if check_username(username):
            error_message = "ERROR: Username already taken"
            print(error_message)
            return render_template('register.html', error_message=error_message), 400

        moder_username = moderation_username(username)
        if not moder_username[0]:
            return render_template('register.html', error_message=moder_username[1]), 400

        if 'avatar' in request.files:
            file = request.files['avatar']
            if file.filename:
                filename = save_avatar(file, username)
                print(filename)

            sid_words = generate_random_sid()

            new_user_id = create_new_user(username, name, surname, hash_string_sha256(sid_words[0]),
                                          hash_string_sha256(sid_words[1]), hash_string_sha256(sid_words[2]),
                                          hash_string_sha256(sid_words[3]), filename)
            print(sid_words)
            print(new_user_id)
            session['user_id'] = new_user_id

        resp = redirect(url_for('show_sid', sid1=sid_words[0], sid2=sid_words[1], sid3=sid_words[2], sid4=sid_words[3]))

        if remember_me:
            resp.set_cookie('hexa_user_id', str(new_user_id), max_age=app.config['COOKIE_MAX_AGE'], httponly=True)

        print(f'show_sid/sid1={sid_words[0]}/sid2={sid_words[1]}/sid3={sid_words[2]}/sid4={sid_words[3]}')
        return resp

    return render_template('register.html', error_message=error_message)


@app.route('/login', methods=['GET', 'POST'])
def login():
    user_id = request.cookies.get('hexa_user_id')
    if user_id:
        user = get_user_by_id(int(user_id))
        if user:
            session['user_id'] = int(user_id)
            return redirect(url_for('messenger'))

    error_message = None
    if request.method == 'POST':
        sid1 = request.form.get('sid1')
        sid2 = request.form.get('sid2')
        sid3 = request.form.get('sid3')
        sid4 = request.form.get('sid4')
        remember_me = request.form.get('remember_me') == 'on'

        if not (sid1 and sid2 and sid3 and sid4):
            error_message = "ERROR: All SID phrases are required"
            print(error_message)
            return render_template('login.html', error_message=error_message), 400

            user_id = search_user_sid(hash_string_sha256(sid1), hash_string_sha256(sid2), hash_string_sha256(sid3),
                                      hash_string_sha256(sid4))

        if not user_id:
            error_message = "ERROR: Invalid SID phrase"
            print(error_message)
            return render_template('login.html', error_message=error_message), 400

            wsession['user_id'] = user_id
            print(session['user_id'])

        resp = redirect(url_for('messenger'))
        if remember_me:
            resp.set_cookie('hexa_user_id', str(user_id), max_age=app.config['COOKIE_MAX_AGE'], httponly=True)
            return resp

    return render_template('login.html', error_message=error_message)


@app.route('/logout')
def logout():
    session.clear()

    resp = redirect(url_for('index'))

    resp.delete_cookie('hexa_user_id')

    return resp


@app.route('/messenger')
def messenger():
    if 'user_id' not in session:
        return redirect(url_for('login'))

    user = get_user_by_id(session['user_id'])

    if not user:
        resp = redirect(url_for('login'))
        resp.delete_cookie('hexa_user_id')
        session.clear()
        return resp

    avatar = f"{user.username}.png" if check_file_name(
        f"static/avatar/{user.username}.png") else "person.png"
    print(avatar, f"static/avatar/{user.username}.png")
    chats = get_user_chats(session['user_id'])
    return render_template('messenger.html', username=user.username, name=user.name, surname=user.surname,
                           avatar=avatar, chats=chats)


@app.route('/show_sid/<sid1>/<sid2>/<sid3>/<sid4>')
def show_sid(sid1, sid2, sid3, sid4):
    return render_template('sidsee.html', sid1=sid1, sid2=sid2, sid3=sid3, sid4=sid4)


@app.route('/profuleuser', methods=['GET'])
def profile_user():
    user_id = request.args.get('user_id')
    print(request.url)

    if not user_id:
        return jsonify(success=False, error="Имя пользователя не указано"), 400

    user = get_user_by_id(get_other_user_id_in_chat(user_id))

    if not user:
        return jsonify(success=False, error="Пользователь не найден"), 404

    avatar = f"{user.username}.png" if check_file_name(f"static/avatar/{user.username}.png") else "person.png"

    return jsonify({
        'success': True,
        'username': user.username,
        'name': user.name,
        'surname': user.surname,
        'avatar': avatar
    })


@app.route('/update_profile', methods=['POST'])
def update_profile():
    print(1)
    user_id = request.cookies.get('hexa_user_id')
    print(user_id)
    if user_id:
        user = get_user_by_id(int(user_id))
        print(user.username)
        if user:
            session['user_id'] = int(user_id)

    user_id = session['user_id']
    username = request.form.get('username')
    name = request.form.get('name')
    surname = request.form.get('surname')
    avatar_link = None

    if 'avatar' in request.files:
        file = request.files['avatar']
        if file and file.filename:
            old_username = get_username(user_id)
            avatar_link = save_avatar(file, old_username)
            print(avatar_link)

    if username:
        new_username = moderation_username(username)
        if not new_username[0]:
            return jsonify(success=False, error="ERROR: username incorrect"), 400

    update = update_user_profile(user_id, username, name, surname, avatar_link)
    print(update)

    if update:
        return jsonify(success=True), 200
    else:
        return jsonify(success=False, error="Failed to update profile"), 400


@app.route('/set_session', methods=['POST'])
def set_session():
    data = request.get_json()
    if data and 'user_id' in data:
        session['user_id'] = int(data['user_id'])
        return jsonify(success=True)
    return jsonify(success=False), 400


@app.route('/api/chats')
def get_chats():
    if 'user_id' not in session:
        return jsonify(success=False, error="Not authenticated"), 401

    user_id = session['user_id']
    chats = get_user_chats(user_id)

    return jsonify(success=True, chats=chats)


@app.route('/api/chat/<int:chat_id>')
def get_chat(chat_id):
    if 'user_id' not in session:
        return jsonify(success=False, error="Not authenticated"), 401

    user_id = session['user_id']
    messages = get_chat_messages(chat_id, user_id)

    return jsonify(success=True, messages=messages)


@app.route('/api/chat/<int:chat_id>/send', methods=['POST'])
def send_chat_message(chat_id):
    if 'user_id' not in session:
        return jsonify(success=False, error="Not authenticated"), 401

    user_id = session['user_id']
    data = request.get_json()

    if not data or 'content' not in data:
        return jsonify(success=False, error="Message content is required"), 400

    content = data['content']
    message_id = send_message(chat_id, user_id, content)

    if message_id:
        participants = get_chat_participants(chat_id)
        if participants:
            receiver_id = participants[1] if participants[0] == user_id else participants[0]

        return jsonify(success=True, message_id=message_id)
    else:
        return jsonify(success=False, error="Failed to send message"), 400


@app.route('/api/users/search')
def search_users_api():
    if 'user_id' not in session:
        return jsonify(success=False, error="Not authenticated"), 401

    user_id = session['user_id']
    query = request.args.get('q', '')

    if not query:
        return jsonify(success=True, users=[])

    users = search_users(query, user_id)
    return jsonify(success=True, users=users)


@app.route('/api/chat/create', methods=['POST'])
def create_chat():
    if 'user_id' not in session:
        return jsonify(success=False, error="Not authenticated"), 401

    user_id = session['user_id']
    data = request.get_json()

    if not data or 'user_id' not in data:
        return jsonify(success=False, error="User ID is required"), 400

    other_user_id = data['user_id']
    chat_id = get_or_create_chat(user_id, other_user_id)

    return jsonify(success=True, chat_id=chat_id)


@app.route('/chat/<int:chat_id>')
def view_chat(chat_id):
    if 'user_id' not in session:
        return redirect(url_for('login'))

    user_id = session['user_id']
    user = get_user_by_id(user_id)

    if not user:
        session.clear()
        return redirect(url_for('login'))

    messages = get_chat_messages(chat_id, user_id)

    if not messages and not any(msg for msg in messages):
        return redirect(url_for('messenger'))

    all_chats = get_user_chats(user_id)

    avatar = f"{user.username}.png" if check_file_name(f"{user.username}.png") else "person.png"

    return render_template('messenger.html',
                           username=user.username,
                           name=user.name,
                           surname=user.surname,
                           avatar=avatar,
                           chats=all_chats,
                           active_chat_id=chat_id,
                           messages=messages)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)
