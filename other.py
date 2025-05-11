from random_word import RandomWords
import hashlib
import os
from PIL import Image
import time
from werkzeug.utils import secure_filename


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
    """
    Изменяет размер изображения до квадрата с сохранением пропорций.

    Args:
        img: Объект изображения PIL
        size: Размер стороны квадрата

    Returns:
        Image: Обработанное изображение
    """
    # Получаем размеры оригинального изображения
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
    try:
        if os.path.exists(old_file):
            if os.path.exists(new_file):
                os.remove(new_file)
            os.rename(old_file, new_file)
            return True
    except Exception as e:
        return False


