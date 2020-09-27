import threading
import time
import cv2
import os
import sys
import json
import shutil

ROOT = os.path.dirname(__file__)
sys.path.append(os.path.join(ROOT, '..', 'lib', 'dope_estimator'))

from dope import DopeEstimator
from util import resize_image, NumpyEncoder

class DopeThread(object):

    def __init__(self, input_queue, model_path, use_half_computation, default_width, debug, interval=1):
        self.interval = interval
        self.input_queue = input_queue
        self.default_width = default_width

        self.dope = DopeEstimator(model_path, use_half_comp=use_half_computation)

        thread = threading.Thread(target=self.run, args=())
        thread.daemon = True
        thread.start()

    def run(self):
        while True:
            if not self.input_queue.empty():
                while not self.input_queue.empty():
                    data = self.input_queue.get()

                video_id = data['video_id']
                filename = data['filename']
                orig_video_name = data['video_name']

                output_path = os.path.join("tmp_data", "{}.json". format(video_id))
                cache_path = os.path.join('tmp_data', "{}.json".format(orig_video_name))

                if os.path.isfile(cache_path):
                    shutil.copy(cache_path, output_path)
                    print(f"Copied cached results from {cache_path} to {output_path}")
                    continue
                else:
                    print(f"Could not find {cache_path} in cache")

                cap = cv2.VideoCapture(filename)
                result = []

                total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
                counter = 1

                while(cap.isOpened()):
                    ret, frame = cap.read()
                    if not ret:
                        break

                    frame = resize_image(frame, width=self.default_width)

                    res,_ = self.dope.run(frame, visualize=False)
                    result.append(res)
                    print(f"frame {counter} of {total_frames}")

                    counter += 1
                cap.release()

                print(f"Saving results as {output_path}")
                response = json.dumps(result, cls=NumpyEncoder)
                with open(output_path, "w") as f:
                    f.write(response)

                print(f"Caching results as {cache_path}")
                with open(cache_path, "w") as f:
                    f.write(response)

                print("finished")

            else:
                time.sleep(self.interval)
