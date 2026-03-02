const db = require("../models");
const Log = db.logObj

// Middleware to log request and response
const logMiddleware = async (req, res, next) => {
  let ipAddresss = req.ip
    console.log('---', ipAddresss)

  // If the address is IPv6 and includes an IPv4 address, remove the IPv6 prefix
  if (ipAddresss.startsWith("::ffff:")) {
    ipAddresss = ipAddresss.split("::ffff:")[1];
  }
  const start = Date.now();
  let apiCallBy = 'User'
  if( req.originalUrl.includes('/api/v1/logs') ){
    return next(); // Skip middleware and proceed to the next handler
  }
  else if( req.originalUrl === '/api/v1/auth/login' ){
    var reqBody = {...req.body, password: '******'}
  }else if( req.originalUrl === '/api/v1/auth/register' ){
    var reqBody = {...req.body, password: '******'}
  }else if( req.originalUrl.includes('sync') || req.originalUrl.includes('webhook') ){
    var reqBody = {...req.body}
    apiCallBy = 'System'
  }
  else{
    var reqBody = {...req.body}
  }
  
  // Log the incoming request data
  // const logEntry = await Log.create({
  //   endPoint:req.originalUrl,
  //   apiCallBy:apiCallBy,
  //   ipAddresss:ipAddresss,
  //   request: {
  //     method: req.method,
  //     url: req.originalUrl,
  //     headers: req.headers,
  //     body: reqBody,
  //     query: req.query,
  //   }
  // });

  // Capture the response data after response is sent
  const originalSend = res.send;

  res.send = async function (data) {
    const end = Date.now();

    // Log the response data
    // await logEntry.update({
    //   response: {
    //     statusCode: res.statusCode,
    //     // headers: res.getHeaders(),
    //     body: data,
    //   },
    //   duration: end - start
    // });

    // Call the original send method
    originalSend.apply(res, arguments);
  };

  next();
};

module.exports = logMiddleware;
