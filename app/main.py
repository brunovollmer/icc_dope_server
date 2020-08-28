import asyncio
import logging
import os
import glob

import ssl
import sys
from pathlib import Path
from queue import Queue

import aiohttp_jinja2
import jinja2
from aiohttp import web
from aiojobs.aiohttp import setup

from omegaconf import OmegaConf

default_config = """
default_width: 500
use_half_computation: False
model_path: ../dope/models/DOPErealtime_v1_0_0.pth.tgz
dope_debug: False
use_turn: False
tmp_data_path: tmp_data/
clear_on_shutdown: True
"""

ROOT = os.path.dirname(__file__)
THIS_DIR = Path(__file__).parent
sys.path.append(os.path.join(ROOT, '..', '..', 'dope'))

input_queue = Queue()

from .views import index, master_video, user_video
from .dope_thread import DopeThread

async def on_shutdown(app):
    if app['settings'].clear_on_shutdown:
        tmp_data_path = app['settings'].tmp_data_path
        files = glob.glob(os.path.join(tmp_data_path, '*'))
        for f in files:
            os.remove(f)

        print('cleared tmp data path')


async def create_app():

    default_settings = OmegaConf.create(default_config)
    settings = OmegaConf.load("app/settings.yaml")
    settings = OmegaConf.merge(default_settings, settings)

    app = web.Application(client_max_size=1028**4)
    app.on_shutdown.append(on_shutdown)

    app.update(settings=settings)

    jinja2_loader = jinja2.FileSystemLoader(str(THIS_DIR / 'templates'))
    aiohttp_jinja2.setup(app, loader=jinja2_loader)

    app.add_routes([web.static('/static', 'static')])

    app.router.add_get("/", index)
    app.router.add_post("/master_video", master_video)
    app.router.add_post("/user_video", user_video)

    model_path = app['settings'].model_path
    use_half_computation = app['settings'].use_half_computation
    default_width = app['settings'].default_width
    dope_debug = app['settings'].dope_debug

    dope_thread = DopeThread(input_queue, model_path, use_half_computation, default_width, dope_debug)

    return app
