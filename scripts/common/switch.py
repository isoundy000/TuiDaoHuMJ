# -*- coding: utf-8 -*-


PUBLISH_VERSION = 0

DEBUG_BASE = 0

PHP_SERVER_URL = 'http://10.0.0.4:9981/api/'
PHP_SERVER_SECRET = "zDYnetiVvFgWCRMIBGwsAKaqPOUjfNXS"

#计算消耗
def calc_cost(game_mode, game_round):
	card_number = int(game_round/8) * 4
	diamond_number = int(game_round/8) * 40
	return (card_number, diamond_number)