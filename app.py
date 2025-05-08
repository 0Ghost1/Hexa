from flask import Flask, render_template, request, jsonify, redirect, url_for, session
from werkzeug.utils import secure_filename
import os
from random_word import RandomWords

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024
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
        password = request.form.get('password')
        
        if 'avatar' in request.files:
            file = request.files['avatar']
            if file.filename != '':
                filename = secure_filename(file.filename)
                file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))

        session['username'] = username
        return redirect(url_for('messenger'))
    
    # Генерируем 4 случайных слова для SID
    r = RandomWords()
    sid_words = []
    for _ in range(4):
        word = None
        # Иногда random-word может вернуть None, повторяем до получения слова
        while not word:
            word = r.get_random_word()
        sid_words.append(word)
    return render_template('register.html', sid1=sid_words[0], sid2=sid_words[1], sid3=sid_words[2], sid4=sid_words[3])

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')

        session['username'] = username
        return redirect(url_for('messenger'))
    
    return render_template('login.html')

@app.route('/messenger')
def messenger():
    if 'username' not in session:
        return redirect(url_for('login'))
    return render_template('messenger.html', username=session['username'])

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)