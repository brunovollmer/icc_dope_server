import ssl
from aiohttp import web
import aiohttp_jinja2
import jinja2
from omegaconf import OmegaConf
import asyncio

from app.main import index, master_video, user_video, on_shutdown, input_queue
from app.dope_thread import DopeThread

if __name__ == "__main__":
   settings = OmegaConf.load("app/settings.yaml")

   app = web.Application(client_max_size=1028**4)
   app.on_shutdown.append(on_shutdown)

   app.update(settings=settings)

   jinja2_loader = jinja2.FileSystemLoader(str('app/templates'))
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

   ssl_context = ssl.create_default_context(ssl.Purpose.CLIENT_AUTH)
   ssl_context.check_hostname = False
   ssl_context.load_cert_chain('sslcert.crt','sslcert.key')

   web.run_app(app, ssl_context=ssl_context)