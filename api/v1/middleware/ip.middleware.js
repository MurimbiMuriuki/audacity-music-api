function normalize(ip) {
  return ip && ip.startsWith('::ffff:') ? ip.slice(7) : ip;
}

module.exports = function ipWhitelist(
  allowList = [],
  { exceptPaths = [], exceptRoutes = [] } = {}
) {
  // include localhost by default
  const allowed = new Set(
    // ['127.0.0.1', '::1', ...allowList.map(s => normalize(s.trim())).filter(Boolean)]
    ['127.0.0.1', '::1', ...allowList.map(s => normalize(s.trim())).filter(Boolean)]
  );
  // console.log("aaa", allowed)
  return (req, res, next) => {
    // Build a stable path to test (works whether mounted or not)
    const pathToMatch = (req.baseUrl || '') + req.path;
    const method = req.method.toUpperCase();

    // Skip by plain path regex (method-agnostic)
    if (exceptPaths.some(rx => rx.test(pathToMatch))) return next();

    // Skip by method + path
    if (exceptRoutes.some(r => {
      const methodOK = !r.method || r.method.toUpperCase() === method;
      const pathOK = (typeof r.path === 'string')
        ? r.path === pathToMatch
        : r.path instanceof RegExp && r.path.test(pathToMatch);
      return methodOK && pathOK;
    })) return next();
   
    let clientIp = normalize(req.ip);
    // console.log("client Ip ", clientIp )
    if (allowed.has(clientIp)) return next();

    console.warn(`[IP-BLOCK] ${clientIp} -> ${method} ${pathToMatch}`);
    return res.status(403).json({ message: 'something went wrong' });
  };
};
