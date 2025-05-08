from random_word import RandomWords
import hashlib



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
