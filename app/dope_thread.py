import threading
import time
import os
import sys

ROOT = os.path.dirname(__file__)
sys.path.append(os.path.join(ROOT, '..', '..', 'dope'))

from dope import DopeEstimator
from util import resize_image

class DopeThread(object):

    def __init__(self, input_queue, output_queue, model_path, use_half_computation, default_width, interval=1):
        self.interval = interval
        self.input_queue = input_queue
        self.output_queue = output_queue
        self.default_width = default_width

        self.dope = DopeEstimator(model_path, use_half_comp=use_half_computation)

        thread = threading.Thread(target=self.run, args=())
        thread.daemon = True
        thread.start()

    def run(self):
        while True:
            if not self.input_queue.empty():
                img = self.input_queue.get()
                while not self.input_queue.empty():
                    img = self.input_queue.get()

                img = resize_image(img, width=self.default_width)

                results, _ = self.dope.run(img, visualize=False)

                self.output_queue.put(results)

            else:
                time.sleep(self.interval)
