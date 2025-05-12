from random_word import RandomWords
import hashlib
import os, re
from PIL import Image
import time
from werkzeug.utils import secure_filename
from better_profanity import profanity


def is_bad(text, custom_bad_words=None):
    profanity.load_censor_words()

    if custom_bad_words:
        profanity.add_censor_words(custom_bad_words)

    return profanity.contains_profanity(text)



def generate_random_sid():
    RandomW = RandomWords()
    sid_words = []
    for _ in range(4):
        word = None
        # Иногда random-word может вернуть None, повторяем до получения слова
        while not word:
            word = RandomW.get_random_word()
        sid_words.append(word)

    return sid_words


def hash_string_sha256(input_string):
    hash_object = hashlib.sha256()
    hash_object.update(input_string.encode('utf-8'))
    return hash_object.hexdigest()


def save_avatar(avatar_file, username):
    """
    Сохраняет аватарку пользователя в формате PNG в директорию static/avatar.

    Args:
        avatar_file: Файл изображения (из request.files)
        username: Имя пользователя для использования в названии файла

    Returns:
        str: Путь к сохраненному файлу относительно корня проекта
    """
    # Проверяем, что директория существует
    avatar_dir = 'static/avatar'
    os.makedirs(avatar_dir, exist_ok=True)

    # Создаем безопасное имя файла на основе имени пользователя
    safe_username = secure_filename(username)

    # Добавляем временную метку для уникальности
    filename = f"{safe_username}.png"

    # Полный путь для сохранения файла
    filepath = os.path.join(avatar_dir, filename)

    try:
        # Открываем и обрабатываем изображение с помощью PIL
        img = Image.open(avatar_file)

        # Изменяем размер до квадрата 200x200
        img = resize_image_to_square(img, 200)

        # Сохраняем в формате PNG
        img.save(filepath, 'PNG')

        # Возвращаем относительный путь для сохранения в БД
        return f"static/avatar/{filename}"
    except Exception as e:
        print(f"Ошибка при сохранении аватара: {e}")
        return None


def resize_image_to_square(img, size):

    width, height = img.size

    # Определяем, какая сторона меньше
    if width > height:
        # Ширина больше высоты - обрезаем по центру
        left = (width - height) / 2
        top = 0
        right = (width + height) / 2
        bottom = height
        img = img.crop((left, top, right, bottom))
    elif height > width:
        # Высота больше ширины - обрезаем по центру
        left = 0
        top = (height - width) / 2
        right = width
        bottom = (height + width) / 2
        img = img.crop((left, top, right, bottom))

    # Изменяем размер до указанного
    return img.resize((size, size), Image.LANCZOS)


def check_file_name(name_file):
    if os.path.exists(name_file):
        return True
    else:
        return False


def rename_file(old_file, new_file):
    if new_file == old_file:
        return True
    try:
        if os.path.exists(old_file):
            if os.path.exists(new_file):
                os.remove(new_file)
            os.rename(old_file, new_file)
            return True
    except Exception as e:
        return False


def moderation_username(username):
    if len(username) < 3:
        return False, "ERROR: Username is very short"
    if len(username) > 20:
        return False, "ERROR: Username is very long"

    if not re.match(r'^[a-zA-Z]', username):
        return False, "ERROR: Username must begin with a letter"

    if not re.match(r'^[a-zA-Z0-9_\-\.]+$', username):
        return False, "ERROR: There are forbidden characters"

    if is_bad(username):
        return False, "ERROR: Username is bad"

    forbidden_names = {"admin", "root", "moderator", "support", "system", "kirill_loshara"}
    if username.lower() in forbidden_names:
        return False, "ERROR: Username is prohibited"

    return True, "OK"


