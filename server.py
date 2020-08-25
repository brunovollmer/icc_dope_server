import ssl
from aiohttp import web
import aiohttp_jinja2
import jinja2
from omegaconf import OmegaConf
import asyncio

from app.main import on_shutdown, index, offer, video, test, layout_test, input_queue, output_queue
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
   app.router.add_post("/offer", offer)
   app.router.add_post("/video", video)
   app.router.add_get("/test", test)
   app.router.add_get("/layout", layout_test)

   model_path = app['settings'].model_path
   use_half_computation = app['settings'].use_half_computation
   default_width = app['settings'].default_width

   dope_thread = DopeThread(input_queue, output_queue, model_path, use_half_computation, default_width)

   ssl_context = ssl.create_default_context(ssl.Purpose.CLIENT_AUTH)
   ssl_context.check_hostname = False
   ssl_context.load_cert_chain('sslcert.crt','sslcert.key')

   web.run_app(app, ssl_context=ssl_context)