import os
import uuid
import asyncio

from aiohttp_jinja2 import template
from aiohttp import web

from dope import DopeEstimator
from .main import input_queue

@template('index.html')
async def index(request):
    return {}

async def user_video(request):
    await spawn(request, coro())
    return web.json_response({"test": "test"})

async def master_video(request):
    post = await request.post()
    video = post.get("video")
    video_id = str(uuid.uuid4())

    # tmpfile = "tmp_data/0004.mp4.json"
    # if os.path.exists(tmpfile):
    #     print("Responded with cached poses")
    #     response = open(tmpfile).read()
    #     return web.json_response(response)

    filename = "tmp_data/{}.mp4".format(video_id)

    if video:
        with open(filename, 'wb') as fd:
             video_content = video.file.read()
             fd.write(video_content)

        input_queue.put({'video_id': video_id, 'filename': filename})

    return web.json_response({'id': video_id})
