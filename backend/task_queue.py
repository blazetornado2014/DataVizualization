import threading
import queue
import time

class TaskQueue:
    """A simple in-memory task queue for handling async tasks"""
    
    def __init__(self, num_workers=2):
        self.task_queue = queue.Queue()
        self.workers = []
        self.running = True
        
        for _ in range(num_workers):
            worker = threading.Thread(target=self._worker_loop)
            worker.daemon = True
            worker.start()
            self.workers.append(worker)
    
    def _worker_loop(self):
        """Main worker loop that processes tasks from the queue"""
        while self.running:
            try:
                task, args, kwargs = self.task_queue.get(timeout=1)
                
                try:
                    task(*args, **kwargs)
                except Exception as e:
                    print(f"Error executing task: {str(e)}")
                
                self.task_queue.task_done()
            
            except queue.Empty:
                continue
    
    def add_task(self, task_fn, *args, **kwargs):
        """Add a task to the queue"""
        self.task_queue.put((task_fn, args, kwargs))
    
    def shutdown(self):
        """Shut down the task queue and worker threads"""
        self.running = False
        
        for worker in self.workers:
            worker.join(timeout=2)
        
        while not self.task_queue.empty():
            try:
                self.task_queue.get_nowait()
                self.task_queue.task_done()
            except queue.Empty:
                break
