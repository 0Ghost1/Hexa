from flask import Flask, render_template, request, jsonify, redirect, url_for, session
from werkzeug.utils import secure_filename
import os
from other import generate_random_sid, hash_string_sha256, save_avatar, rename_file, check_file_name
from data_request import create_new_user, search_user_sid, check_username, get_user_by_id, update_user_profile, get_username

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['AVATAR_FOLDER'] = 'static/avatar'
app.config['MAX_CONTENT_LENGTH'] = (16 * 1024
                                    * 1024)
app.secret_key = 'your-secret-key'

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['AVATAR_FOLDER'], exist_ok=True)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/register', methods=['GET', 'POST'])
def register():
    error_message = None
    if request.method == 'POST':
        username = request.form.get('username')
        name = request.form.get('name')
        surname = request.form.get('surname')
        filename = None


        if not username or not name or not surname:
            error_message = "ERROR: All fields are required"
            print(error_message)
            return render_template('register.html', error_message=error_message), 400

        if check_username(username):
            error_message = "ERROR: Username already taken"
            print(error_message)
            return render_template('register.html', error_message=error_message), 400

        if 'avatar' in request.files:
            file = request.files['avatar']
            if file.filename:
                filename = save_avatar(file, username)

        sid_words = generate_random_sid()

        new_user_id = create_new_user(username, name, surname, hash_string_sha256(sid_words[0]),
                                      hash_string_sha256(sid_words[1]), hash_string_sha256(sid_words[2]),
                                      hash_string_sha256(sid_words[3]), filename)
        print(sid_words)
        print(new_user_id)
        # Устанавливаем ID пользователя в сессию
        session['user_id'] = new_user_id
        # Показываем SID фразы
        print(f'show_sid/sid1={sid_words[0]}/sid2={sid_words[1]}/sid3={sid_words[2]}/sid4={sid_words[3]}')
        return redirect(url_for('show_sid', sid1=sid_words[0], sid2=sid_words[1], sid3=sid_words[2], sid4=sid_words[3]))

    return render_template('register.html', error_message=error_message)


@app.route('/login', methods=['GET', 'POST'])
def login():
    error_message = None
    if request.method == 'POST':
        sid1 = request.form.get('sid1')
        sid2 = request.form.get('sid2')
        sid3 = request.form.get('sid3')
        sid4 = request.form.get('sid4')
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

        session['user_id'] = user_id
        print(session['user_id'])
        return redirect(url_for('messenger'))

    return render_template('login.html', error_message=error_message)


@app.route('/messenger')
def messenger():
    # Проверяем наличие user_id в сессии
    if 'user_id' not in session:
        return redirect(url_for('login'))

    # Получаем данные пользователя по user_id
    user = get_user_by_id(session['user_id'])

    if not user:
        # Если пользователь не найден, сбрасываем сессию
        session.clear()
        return redirect(url_for('login'))

    avatar = f"{user.username}.png" if check_file_name(f"{user.username}.png") else "person.png"
    return render_template('messenger.html', username=user.username, name=user.name, surname=user.surname, avatar=avatar)


@app.route('/show_sid/<sid1>/<sid2>/<sid3>/<sid4>')
def show_sid(sid1, sid2, sid3, sid4):
    return render_template('sidsee.html', sid1=sid1, sid2=sid2, sid3=sid3, sid4=sid4)




@app.route('/set_session', methods=['POST'])
def set_session():

    data = request.get_json()
    if data and 'user_id' in data:
        session['user_id'] = int(data['user_id'])
        return jsonify(success=True)
    return jsonify(success=False), 400


@app.route('/update_profile', methods=['POST'])
def update_profile():

    if 'user_id' not in session:
        return jsonify(success=False, error="Not authenticated"), 401

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



    update = update_user_profile(user_id, username, name, surname, avatar_link)

    if update:
        return jsonify(success=True), 200
    else:
        return jsonify(success=False, error="Failed to update profile"), 400




if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)
