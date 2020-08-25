import asyncio
import logging
import os
import sys
from pathlib import Path
from queue import Queue

import aiohttp_jinja2
import jinja2
from aiohttp import web

ROOT = os.path.dirname(__file__)
THIS_DIR = Path(__file__).parent
sys.path.append(os.path.join(ROOT, '..', '..', 'dope'))

input_queue = Queue()
output_queue = Queue()
pcs = set()
logger = logging.getLogger("pc")

from app.dope_thread import DopeThread
from app.views import index, video, offer

async def on_shutdown(app):
    # close peer connections
    coros = [pc.close() for pc in pcs]
    await asyncio.gather(*coros)
    pcs.clear()


async def create_app(debug=False, port=8080):

    if debug:
        logging.basicConfig(level=logging.DEBUG)
    else:
        logging.basicConfig(level=logging.INFO)

    ssl_context = None

    app = web.Application(client_max_size=1028**4)
    app.on_shutdown.append(on_shutdown)

    jinja2_loader = jinja2.FileSystemLoader(str(THIS_DIR / 'templates'))
    aiohttp_jinja2.setup(app, loader=jinja2_loader)

    app.add_routes([web.static('/static', 'static')])

    app.router.add_get("/", index)
    app.router.add_post("/offer", offer)
    app.router.add_post("/video", video)

    dope_thread = DopeThread(input_queue, output_queue)

    #web.run_app(app, access_log=None, port=port, ssl_context=ssl_context)

    return app
