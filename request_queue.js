function RequestQueue(ph, page) {
  this.queueIndex = 0;
  this.loadInProgess = false;
  this.page = page;
  this.ph = ph;
  this.queue = [];
  this.init();
}

RequestQueue.prototype.init = function() {
  self = this;

  this.page.set('onLoadFinished', function() {
    self.loadInProgress = false;
  });

  this.page.set('onLoadStarted', function() {
    self.loadInProgress = true;
  });

  this.page.set('onConsoleMessage', function(msg) {
    console.log(msg)
  });
}
 
RequestQueue.prototype.start = function() {
  self = this;
  
  interval = setInterval(function() {
    if (!self.loadInProgress && typeof self.queue[self.queueIndex] == "function") {
      self.queue[self.queueIndex](self.ph, self.page);
      self.queueIndex++;
    }
    if (typeof self.queue[self.queueIndex] != "function") {
      //self.ph.exit();
      clearInterval(interval);
    }

  }, 500);

 return interval;
}

module.exports = function(ph, page) {
  return new RequestQueue(ph, page);
}
