const logMiddleware = (req, res, next) => {
  if (req.originalUrl.includes('/api/v1/logs')) {
    return next();
  }

  const start = Date.now();

  const originalSend = res.send;
  res.send = function (data) {
    const duration = Date.now() - start;
    console.log(`[${req.method}] ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    originalSend.apply(res, arguments);
  };

  next();
};

module.exports = logMiddleware;
