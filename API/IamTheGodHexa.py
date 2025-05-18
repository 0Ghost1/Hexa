from colorama import init, Fore
import requests
import json

URL = "http://localhost:5000/api/command"

init()


def send_json_to_api(data, url):
    try:
        response = requests.post(url, data=json.dumps(data))
        return response.json()
    except requests.exceptions.RequestException as e:
        return {
            'success': False,
            'message': f'Ошибка при отправке запроса: {str(e)}'
        }
    except json.JSONDecodeError:
        return {
            'success': False,
            'message': 'Ошибка при декодировании ответа JSON'
        }


cat = """⠀
            ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣠⣤⣶⣶⣶⣶⣶⣶⣶⣦⣀⠀⠀⠀⠀⢀⣀⣀⠀⠀⠀⠀⠀⠀⠀⠀
            ⠀⠀⠀⠀⠀⠀⠀⢠⢤⣠⣶⣿⣿⡿⠿⠛⠛⠛⠛⠉⠛⠛⠛⠛⠿⣷⡦⠞⣩⣶⣸⡆⠀⠀⠀⠀⠀⠀⠀
            ⠀⠀⠀⠀⠀⠀⣠⣾⡤⣌⠙⠻⣅⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⠔⠋⢀⣾⣿⣿⠃⣇⠀⠀⠀⠀⠀⠀⠀
            ⠀⠀⠀⠀⣠⣾⣿⡟⢇⢻⣧⠄⠀⠈⢓⡢⠴⠒⠒⠒⠒⡲⠚⠁⠀⠐⣪⣿⣿⡿⡄⣿⣷⡄⠀⠀⠀⠀⠀
            ⠀⠀⠀⣠⣿⣿⠟⠁⠸⡼⣿⡂⠀⠀⠈⠁⠀⠀⠀⠀⠀⠁⠀⠀⠀⠀⠉⠹⣿⣧⢳⡏⠹⣷⡄⠀⠀⠀⠀
            ⠀⠀⣰⣿⡿⠃⠀⠀⠀⢧⠑⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠻⠇⡸⠀⠀⠘⢿⣦⣄⠀⠀
            ⠀⢰⣿⣿⠃⠀⠀⠀⠀⡼⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⡠⠀⠀⠀⠀⠀⠀⠰⡇⠀⠀⠀⠈⣿⣿⣆⠀
            ⠀⣿⣿⡇⠀⠀⠀⠀⢰⠇⠀⢺⡇⣄⠀⠀⠀⠀⣤⣶⣀⣿⠃⠀⠀⠀⠀⠀⠀⠀⣇⠀⠀⠀⠀⠸⣿⣿⡀
            ⢸⣿⣿⠀⠀⠀⠀⠀⢽⠀⢀⡈⠉⢁⣀⣀⠀⠀⠀⠉⣉⠁⠀⠀⠀⣀⠀⠀⠀⠀⡇⠀⠀⠀⠀⠀⣿⣿⡇
            ⢸⣿⡟⠀⠀⠀⠠⠀⠈⢧⡀⠀⠀⠀⠹⠁⠀⠀⠀⠀⠀⠀⠠⢀⠀⠀⠀⠀⠀⢼⠁⠀⠀⠀⠀⠀⢹⣿⡇
            ⢸⣿⣿⠀⠀⠀⠀⠀⠠⠀⠙⢦⣀⠠⠊⠉⠂⠄⠀⠀⠀⠈⠀⠀⠀⣀⣤⣤⡾⠘⡆⠀⠀⠀⠀⠀⣾⣿⡇
            ⠘⣿⣿⡀⠀⠀⠀⠀⠀⠀⠀⢠⠜⠳⣤⡀⠀⠀⣀⣤⡤⣶⣾⣿⣿⣿⠟⠁⠀⠀⡸⢦⣄⠀⠀⢀⣿⣿⠇
            ⠀⢿⣿⣧⠀⠀⠀⠀⠀⣠⣤⠞⠀⠀⠀⠙⠁⠙⠉⠀⠀⠸⣛⡿⠉⠀⠀⠀⢀⡜⠀⠀⠈⠙⠢⣼⣿⡿⠀
            ⠀⠈⣿⣿⣆⠀⠀⢰⠋⠡⡇⠀⡀⣀⣤⢢⣤⣤⣀⠀⠀⣾⠟⠀⠀⠀⠀⢀⠎⠀⠀⠀⠀⠀⣰⣿⣿⠁⠀
            ⠀⠀⠈⢿⣿⣧⣀⡇⠀⡖⠁⢠⣿⣿⢣⠛⣿⣿⣿⣷⠞⠁⠀⠀⠈⠫⡉⠁⠀⠀⠀⠀⢀⣼⣿⠿⠃⠀⠀
            ⠀⠀⠀⠈⠻⣿⣿⣇⡀⡇⠀⢸⣿⡟⣾⣿⣿⣿⣿⠋⠀⠀⠀⢀⡠⠊⠁⠀⠀⠀⢀⣠⣿⠏⠀⠀⠀⠀⠀
            ⠀⠀⠀⠀⠀⠈⠻⣿⣿⣦⣀⢸⣿⢻⠛⣿⣿⡿⠁⠀⠀⣀⠔⠉⠀⠀⠀⠀⣀⣴⡿⠟⠁⠀⠀⠀⠀⠀⠀
            ⠀⠀⠀⠀⠀⠀⠀⠈⠙⠿⣿⣿⣿⣼⣿⣿⣟⠀⠀⡠⠊⠀⣀⣀⣠⣴⣶⠿⠟⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀
            ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⠛⠿⣿⣿⣿⣿⣶⣶⣷⣶⣶⡿⠿⠛⠛⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
            ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠉⠛⠛⠛⠛⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀"""




hexalogo = """
██╗░░██╗███████╗██╗░░██╗░█████╗░  ░██████╗░█████╗░███████╗████████╗
██║░░██║██╔════╝╚██╗██╔╝██╔══██╗  ██╔════╝██╔══██╗██╔════╝╚══██╔══╝
███████║█████╗░░░╚███╔╝░███████║  ╚█████╗░██║░░██║█████╗░░░░░██║░░░
██╔══██║██╔══╝░░░██╔██╗░██╔══██║  ░╚═══██╗██║░░██║██╔══╝░░░░░██║░░░
██║░░██║███████╗██╔╝╚██╗██║░░██║  ██████╔╝╚█████╔╝██║░░░░░░░░██║░░░
╚═╝░░╚═╝╚══════╝╚═╝░░╚═╝╚═╝░░╚═╝  ╚═════╝░░╚════╝░╚═╝░░░░░░░░╚═╝░░░ 
"""




command = """
┌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┐
┊ [1]probiv data for username    ┊
┊                                ┊
┊ [2]probiv chats for username   ┊
┊                                ┊
┊ [3]snos account for username   ┊
└╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┘
"""




print(Fore.GREEN + cat + Fore.RESET)
print(Fore.GREEN + hexalogo + Fore.RESET)
print(Fore.RED + command + Fore.RESET)

while True:
    try:
        commandARG = input("command$")
        if commandARG not in ["1", "2", "3"]:
            print(Fore.RED + "введите номер команды" + Fore.RESET)
            continue
        usernameARG = input("username$")
        data = {
            'command': commandARG,
            "username": usernameARG
        }
        resault = send_json_to_api(data, URL)
        if resault['success']:
            print(Fore.GREEN + resault['message'] + Fore.GREEN)
        else:
            print(Fore.RED + resault['message'] + Fore.RESET)

        print(resault["message"])

    except:
        print(Fore.RED + "ERROR SOFT YOU ARE EXIT" + Fore.RED)
        break


def send_json_to_api(data, url):
    try:
        response = requests.post(url, data=json.dumps(data))
        return response.json()
    except requests.exceptions.RequestException as e:
        return {
            'success': False,
            'message': f'Ошибка при отправке запроса: {str(e)}'
        }
    except json.JSONDecodeError:
        return {
            'success': False,
            'message': 'Ошибка при декодировании ответа JSON'
        }

