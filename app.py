from flask import Flask, render_template, request, jsonify, redirect, url_for, session
from werkzeug.utils import secure_filename
import os
from other import generate_random_sid, hash_string_sha256
from data_request import create_new_user, search_user_sid

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['MAX_CONTENT_LENGTH'] = (16 * 1024
                                    * 1024)
app.secret_key = 'your-secret-key'

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username')
        name = request.form.get('name')
        surname = request.form.get('surname')

        if 'avatar' in request.files:
            file = request.files['avatar']
            if file.filename != '':
                filename = secure_filename(file.filename)
                file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))

        if username and name and surname:
            sid_words = generate_random_sid()
            new_user_id = create_new_user(username, name, surname, hash_string_sha256(sid_words[0]),
                                          hash_string_sha256(sid_words[1]), hash_string_sha256(sid_words[2]),
                                          hash_string_sha256(sid_words[3]))
            print(sid_words)
            print(new_user_id)
            session['user_id'] = new_user_id
            return redirect(url_for('messenger'))
        else:
            pass
            # cursor олжен сдлеать анимку

    return render_template('register.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        sid1 = request.form.get('sid1')
        sid2 = request.form.get('sid2')
        sid3 = request.form.get('sid3')
        sid4 = request.form.get('sid4')
        if sid1 and sid2 and sid3 and sid4:
            user_id = search_user_sid(hash_string_sha256(sid1), hash_string_sha256(sid2), hash_string_sha256(sid3),
                                      hash_string_sha256(sid4))

            if user_id:
                session['user_id'] = user_id
                print(session['user_id'])
                return redirect(url_for('messenger'))
            else:
                pass
                # доделать
        else:
            pass
            # Доделать

    return render_template('login.html')


@app.route('/messenger')
def messenger():
    if 'username' not in session:
        return redirect(url_for('login'))
    return render_template('messenger.html', username=session['username'])


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)
