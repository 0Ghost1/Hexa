from flask import Flask, render_template, request, jsonify, redirect, url_for, session, make_response
from werkzeug.utils import secure_filename
import os
from other import generate_random_sid, hash_string_sha256, save_avatar, rename_file, check_file_name, moderation_username
from data_request import create_new_user, search_user_sid, check_username, get_user_by_id, update_user_profile, get_username
import uuid
from datetime import datetime, timedelta

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['AVATAR_FOLDER'] = 'static/avatar'
app.config['MAX_CONTENT_LENGTH'] = (16 * 1024
                                    * 1024)
app.secret_key = 'your-secret-key'
app.config['COOKIE_MAX_AGE'] = 30 * 24 * 60 * 60  # 30 days in seconds

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
        
        # Create response with SID redirection
        resp = redirect(url_for('show_sid', sid1=sid_words[0], sid2=sid_words[1], sid3=sid_words[2], sid4=sid_words[3]))
        
        # Set persistent cookie if remember_me is checked
        if remember_me:
            resp.set_cookie('hexa_user_id', str(new_user_id), max_age=app.config['COOKIE_MAX_AGE'], httponly=True)
        
        # Показываем SID фразы
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

        session['user_id'] = user_id
        print(session['user_id'])

        resp = redirect(url_for('messenger'))
        if remember_me:
            resp.set_cookie('hexa_user_id', str(user_id), max_age=app.config['COOKIE_MAX_AGE'], httponly=True)
            
        return resp

    return render_template('login.html', error_message=error_message)


@app.route('/logout')
def logout():
    # Clear the session
    session.clear()
    
    # Create response for redirection
    resp = redirect(url_for('index'))
    
    # Clear the cookie
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

    avatar = f"static/avatar/{user.username}.png" if check_file_name(f"static/avatar/{user.username}.png") else "person.png"
    print(avatar, f"static/avatar/{user.username}.png")
    return render_template('messenger.html', username=user.username, name=user.name, surname=user.surname, avatar=avatar)


@app.route('/show_sid/<sid1>/<sid2>/<sid3>/<sid4>')
def show_sid(sid1, sid2, sid3, sid4):
    return render_template('sidsee.html', sid1=sid1, sid2=sid2, sid3=sid3, sid4=sid4)




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
            print(avatar_link)

    if username:
        new_username = moderation_username(username)
        if not new_username[0]:
            return jsonify(success=False, error="ERROR: username incorrect"), 400



    update = update_user_profile(user_id, username, name, surname, avatar_link)

    if update:
        return jsonify(success=True), 200
    else:
        return jsonify(success=False, error="Failed to update profile"), 400




if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)


#Проблемы с названием файла с помощью юзернейма и отображением стандартой иконки
