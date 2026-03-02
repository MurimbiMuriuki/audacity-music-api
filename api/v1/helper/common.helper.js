
module.exports = {
  getObjFirstValue(obj) {
    if (typeof obj == "object") {
      return obj[Object.keys(obj)[0]];
    } else {
      return false;
    }
  },
  customizeCatchMsg(errorMsg) {
    return `${errorMsg.name} : ${errorMsg.message} ${errorMsg.stack}`;
  },
  parseErrorRespose(errorMsg) {
    var returnData = {};
    returnData.status = false;
    returnData.message = this.getObjFirstValue(errorMsg);
    returnData.data = { errors: errorMsg };
    return returnData;
  },
  parseSuccessRespose(data = "", successMsg = "") {
    var returnData = {};
    returnData.status = true;
    returnData.message = successMsg;
    if (typeof data == "string") {
      returnData.data = {};
    } else {
      returnData.data = data;
    }
    return returnData;
  },

  
  


};
