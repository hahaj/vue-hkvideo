
import { getPubKey, setEncrypt } from './pubKey'
var initCount = 0;
var oWebControl;
/**
 * 
 * @param {*} id :组件容器id
 * @param {*} iWidth :组件容器宽
 * @param {*} iHeight :组件容器高
 * @param {*}cbIntegrationCallBack：消息推送回调函数
 * @param {*} argument:初始化api参数
 * @param {*} completeCallBack：初始化成功回调函数
 *  @param {*} plugErrorCallBack：插件启动失败回调函数
 */
const initPlugin = (id, iWidth, iHeight, argument, cbIntegrationCallBack = () => { }, completeCallBack = () => { }, plugErrorCallBack = () => { }) => {
    // eslint-disable-next-line no-undef
    oWebControl = new WebControl({
        szPluginContainer: id,                       // 指定容器id
        iServicePortStart: 15900,                           // 指定起止端口号，建议使用该值
        iServicePortEnd: 15909,
        szClassId: "23BF3B0A-2C56-4D97-9C03-0CB103AA8F11",   // 用于IE10使用ActiveX的clsid
        cbConnectSuccess: function () {                     // 创建WebControl实例成功											
            oWebControl.JS_StartService("window", {         // WebControl实例创建成功后需要启动服务
                dllPath: "./VideoPluginConnect.dll"         // 值"./VideoPluginConnect.dll"写死 
            }).then(function () {                           // 启动插件服务成功
                oWebControl.JS_SetWindowControlCallback({   // 设置消息回调
                    cbIntegrationCallBack: cbIntegrationCallBack
                });

                oWebControl.JS_CreateWnd(id, iWidth, iHeight).then(function () { //JS_CreateWnd创建视频播放窗口，宽高可设定
                    init(argument, iWidth, iHeight,completeCallBack());  // 创建播放实例成功后初始化
                    
                });

            }, function () { // 启动插件服务失败

            });
        },
        // eslint-disable-next-line no-unused-vars
        cbConnectError: function (e) { // 创建WebControl实例失败
            oWebControl = null;
            // eslint-disable-next-line no-undef
            // $(id).html("插件未启动，正在尝试启动，请稍候...");
                // eslint-disable-next-line no-undef
                WebControl.JS_WakeUp("VideoWebPlugin://"); // 程序未启动时执行error函数，采用wakeup来启动程序
 
            initCount++;
            if (initCount < 2) {
                setTimeout(function () {
                    initPlugin(id, iWidth, iHeight, argument, cbIntegrationCallBack,completeCallBack,plugErrorCallBack);
                }, 1000)
            } else {

                // eslint-disable-next-line no-undef
                // $(id).html("插件启动失败，请检查插件是否安装！");
                plugErrorCallBack()

            }
        },
        // eslint-disable-next-line no-unused-vars
        cbConnectClose: function (bNormalClose) {
            // 异常断开：bNormalClose = false
            // JS_Disconnect正常断开：bNormalClose = true	
            console.log("cbConnectClose");
            oWebControl = null;
        }
    });
    return oWebControl
}


//初始化
function init(argument, iWidth, iHeight,callback=()=>{}) {
    getPubKey(oWebControl, function () {

        oWebControl.JS_RequestInterface({
            funcName: "init",
            argument: JSON.stringify({
                ...argument,
                secret: setEncrypt(argument.secret)
            })
            // eslint-disable-next-line no-unused-vars
        }).then(function (oData) {
            callback()
            //oWebControl.JS_Resize(iWidth, iHeight);  // 初始化后resize一次，规避firefox下首次显示窗口后插件窗口未与DIV窗口重合问题
            
        });
    })
}

export default initPlugin