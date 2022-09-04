var pubKey;
//获取公钥
export function getPubKey(oWebControl,callback) {
    // eslint-disable-next-line no-undef
    oWebControl.JS_RequestInterface({
        funcName: "getRSAPubKey",
        argument: JSON.stringify({
            keyLength: 1024
        })
    }).then(function (oData) {
        if (oData.responseMsg.data) {
            pubKey = oData.responseMsg.data;
            callback()
        }
    })
}

//RSA加密
export function setEncrypt(value) {
    // eslint-disable-next-line no-undef
    var encrypt = new JSEncrypt();
    encrypt.setPublicKey(pubKey);
    return encrypt.encrypt(value);
} 