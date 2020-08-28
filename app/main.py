import asyncio
import logging
import os
import ssl
import sys
from pathlib import Path
from queue import Queue

import aiohttp_jinja2
import jinja2
from aiohttp import web

from omegaconf import OmegaConf

default_config = """
default_width: 500
use_half_computation: False
model_path: ../dope/models/DOPErealtime_v1_0_0.pth.tgz
dope_debug: False
use_turn: False
"""

ROOT = os.path.dirname(__file__)
THIS_DIR = Path(__file__).parent
sys.path.append(os.path.join(ROOT, '..', '..', 'dope'))

input_queue = Queue()
output_queue = Queue()
pcs = set()
logger = logging.getLogger("pc")

from .dope_thread import DopeThread
from .views import index, video, offer, test, layout_test

async def on_shutdown(app):
    # close peer connections
    coros = [pc.close() for pc in pcs]
    await asyncio.gather(*coros)
    pcs.clear()


async def create_app(debug=False):

    if debug:
        logging.basicConfig(level=logging.DEBUG)
    else:
        logging.basicConfig(level=logging.INFO)

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
    app.router.add_post("/offer", offer)
    app.router.add_post("/video", video)
    app.router.add_get("/test", test)
    app.router.add_get("/layout", layout_test)

    model_path = app['settings'].model_path
    use_half_computation = app['settings'].use_half_computation
    default_width = app['settings'].default_width
    dope_debug = app['settings'].dope_debug

    dope_thread = DopeThread(input_queue, output_queue, model_path, use_half_computation, default_width, dope_debug)

    return app
