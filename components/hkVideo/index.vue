<template>
  <div class="hk-video-container" id="playWnd">
    <!-- 下载插件提示框 -->
    <el-dialog
      v-if="downloadDialog"
      title="提示"
      :visible.sync="dialogVisible"
      width="30%"
    >
      <span
        >{{downloadText}}</span
      >
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleDownloadExe">下载</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import initPlugin from "./lib/initPlugin";
export default {
  name: "hkVideo",
  props: {
    width: {
      type: Number,
      default: 1000,
    },
    height: {
      type: Number,
      default: 600,
    },
    //初始化参数，
    //           appkey: appkey,                            //API网关提供的appkey
    //             secret: secret,                            //API网关提供的secret
    //             ip: ip,                                    //API网关IP地址
    //             playMode: playMode,                        //播放模式（决定显示预览还是回放界面）
    //             port: port,                                //端口
    //             snapDir: snapDir,                          //抓图存储路径
    //             videoDir: videoDir,                        //紧急录像或录像剪辑存储路径
    //             layout: layout,                            //布局
    //             enableHTTPS: enableHTTPS,                  //是否启用HTTPS协议
    //             encryptedFields: encryptedFields,          //加密字段
    // 			showToolbar: showToolbar,                  //是否显示工具栏
    // 			showSmart: showSmart,                      //是否显示智能信息
    // 			buttonIDs: buttonIDs                       //自定义工具条按钮
    argument: {
      type: Object,
      default: () => {},
    },
    //模式：0：预览，1回放
    playMode: {
      type: Number,
      default: 0,
    },
    //浏览器窗口改变时候是否动态变化组件宽度，将按照初始化组件占浏览器可视区域比例缩放组件宽度
    autoResize: {
      type: Boolean,
      default: true,
    },
    //未安装插件时候是否显示插件下载对话框提示用户下载功能
    downloadDialog: {
      type: Boolean,
      default: false,
    },
    //海康插件下载url
    downloadUrl: {
      type: String,
      default: "",
    },
    downloadText:{
      type:String,
      default:'插件启动失败，请检查插件是否安装,如果未安装请点击下载安装,安装后刷新页面'
    }
  },
  data() {
    return {
      curWindIndex: 1, //当前选中窗口号，从1开始
      oWebControl: null, //插件实例
      iWidth: "", //组件宽
      iHeight: "", //组件高
      options: {
        appkey: "", //API网关提供的appkey
        secret: "", //API网关提供的secret
        ip: "", //API网关IP地址
        playMode: 0, //播放模式（决定显示预览还是回放界面）
        port: 443, //端口
        snapDir: "D:\\SnapDir", //抓图存储路径
        videoDir: "D:\\VideoDir", //紧急录像或录像剪辑存储路径
        layout: "2x2", //布局
        enableHTTPS: 1, //是否启用HTTPS协议
        encryptedFields: "secret", //加密字段
        showToolbar: 1,
        showSmart: 1,
        buttonIDs:
          "0,1,16,256,257,258,259,260,512,513,514,515,516,517,768,769,770", //自定义工具条按钮
      },
      rate: 0, //组件宽度与窗口宽度比例
      isInitComolete: false, //第一次初始化是否完成
      dialogVisible: false,
    };
  },
  watch: {
    width: {
      handler(val) {
        this.iWidth = val;
        if (this.isInitComolete) {
          this.setRate();
          this.setResize(this.iWidth, this.iHeight);
        }
      },
      immediate: true,
    },
    height: {
      handler(val) {
        this.iHeight = val;
        if (this.isInitComolete) {
          this.setRate();
          this.setResize(this.iWidth, this.iHeight);
        }
      },
      immediate: true,
    },
    playMode() {
      this.reInit();
    },
  },
  mounted() {
    this.init();
    this.handleWindEvent();
    this.$nextTick(() => {
      this.setRate();
    });
  },
  beforeDestroy() {
    if (this.oWebControl != null) {
      this.oWebControl.JS_HideWnd(); // 先让窗口隐藏，规避可能的插件窗口滞后于浏览器消失问题
      this.oWebControl.JS_Disconnect().then(
        function () {
          // 断开与插件服务连接成功
        },
        function () {
          // 断开与插件服务连接失败
        }
      );
    }
  },
  methods: {
    //初始化插件
    init() {
      let argument = {
        ...this.options,
        ...this.argument,
      };
      if (this.playMode > -1 && this.playMode < 2) {
        argument.playMode = this.playMode;
      }
      // eslint-disable-next-line no-undef
      this.iWidth = Math.min(this.iWidth, $(window).width());
      this.oWebControl = initPlugin(
        "playWnd",
        this.iWidth,
        this.iHeight,
        argument,
        this.cbIntegrationCallBack,
        () => {
          this.setRate();
          this.setResize(this.iWidth, this.iHeight);
          this.isInitComolete = true;
          this.$emit("initFinish");
        },
        () => {
          if (this.downloadDialog) {
            this.dialogVisible = true;
          }
          this.$emit("pluginError");
        }
      );
    },
    //重新初始化
    reInit() {
      if (this.oWebControl) {
        this.oWebControl
          .JS_RequestInterface({
            funcName: "uninit",
          })
          .then(() => {
            this.init();
          });
      }
    },
    setRate() {
      // eslint-disable-next-line no-undef
      var iWidth = $(window).width();
      this.rate = this.iWidth / iWidth;
    },
    //窗口事件
    handleWindEvent() {
      // 监听resize事件，使插件窗口尺寸跟随DIV窗口变化
      // eslint-disable-next-line no-undef
      if (this.autoResize) {
        // eslint-disable-next-line no-undef
        $(window).resize(() => {
          if (this.oWebControl) {
            // eslint-disable-next-line no-undef
            var iWidth = $(window).width();
            // eslint-disable-next-line no-undef
            this.iWidth = iWidth * this.rate;
            this.oWebControl.JS_Resize(this.iWidth, this.iHeight);
            this.setWndCover();
          }
        });
      }
      // 监听滚动条scroll事件，使插件窗口跟随浏览器滚动而移动
      // eslint-disable-next-line no-undef
      $(window).scroll(() => {
        if (this.oWebControl) {
          this.oWebControl.JS_Resize(this.iWidth, this.iHeight);
          this.setWndCover();
        }
      });
    },
    //推送消息回调
    cbIntegrationCallBack(oData) {
      if (oData?.responseMsg?.type) {
        let data = oData.responseMsg;
        switch (data.type) {
          //窗口号改变
          case 1:
            if (this.curWindIndex !== data.msg.wndId) {
              this.curWindIndex = data.msg.wndId;
              this.$emit("windowChange", this.curWindIndex);
            }
            break;
          //布局改变
          case 6:
            this.$emit("layoutChange", data.msg);
            break;
        }
      }
    },
    // 设置窗口裁剪，当因滚动条滚动导致窗口需要被遮住的情况下需要JS_CuttingPartWindow部分窗口
    setWndCover() {
      // eslint-disable-next-line no-undef
      var iWidth = $(window).width();
      // eslint-disable-next-line no-undef
      var iHeight = $(window).height();
      // eslint-disable-next-line no-undef
      var oDivRect = $("#playWnd").get(0).getBoundingClientRect();

      var iCoverLeft = oDivRect.left < 0 ? Math.abs(oDivRect.left) : 0;
      var iCoverTop = oDivRect.top < 0 ? Math.abs(oDivRect.top) : 0;
      var iCoverRight =
        oDivRect.right - iWidth > 0 ? Math.round(oDivRect.right - iWidth) : 0;
      var iCoverBottom =
        oDivRect.bottom - iHeight > 0
          ? Math.round(oDivRect.bottom - iHeight)
          : 0;

      iCoverLeft = iCoverLeft > this.iWidth ? this.iWidth : iCoverLeft;
      iCoverTop = iCoverTop > this.iHeight ? this.iHeight : iCoverTop;
      iCoverRight = iCoverRight > this.iWidth ? this.iWidth : iCoverRight;
      iCoverBottom = iCoverBottom > this.iHeight ? this.iHeight : iCoverBottom;

      this.oWebControl.JS_RepairPartWindow(
        0,
        0,
        this.iWidth + 1,
        this.iHeight + 1
      ); // 多1个像素点防止还原后边界缺失一个像素条
      if (iCoverLeft != 0) {
        this.oWebControl.JS_CuttingPartWindow(0, 0, iCoverLeft, this.iHeight);
      }
      if (iCoverTop != 0) {
        this.oWebControl.JS_CuttingPartWindow(
          0,
          0,
          this.iWidth + 1,
          iCoverTop + 1
        ); // 多剪掉一个像素条，防止出现剪掉一部分窗口后出现一个像素条
      }
      if (iCoverRight != 0) {
        this.oWebControl.JS_CuttingPartWindow(
          this.iWidth - iCoverRight,
          0,
          iCoverRight,
          this.iHeight
        );
      }
      if (iCoverBottom != 0) {
        this.oWebControl.JS_CuttingPartWindow(
          0,
          this.iHeight - iCoverBottom,
          this.iWidth,
          iCoverBottom
        );
      }
    },
    /** 预览
     * @param {*} cameraIndexCode :获取输入的监控点编号值，必填
     * @param {*} argument:api参数,
     * argument属性cameraIndexCode优先级高于函数参数cameraIndexCode
     */
    startPreview(cameraIndexCode, argument = {}) {
      if (this.oWebControl) {
        let params = {
          cameraIndexCode: cameraIndexCode, //监控点编号
          streamMode: 0, //主子码流标识
          transMode: 1, //传输协议
          gpuMode: 1, //是否开启GPU硬解
          wndId: -1,
        };
        this.oWebControl
          .JS_RequestInterface({
            funcName: "startPreview",
            argument: JSON.stringify({
              ...params,
              ...argument,
            }),
          })
          .then(() => {});
      }
    },
    //停止所有预览
    stopAllPreview() {
      this.oWebControl.JS_RequestInterface({
        funcName: "stopAllPreview",
      });
    },

    //批量(指定窗口)停止播放
    /**
     * idArr:播放窗口序号数组
     */
    stopListPreview(idArr) {
      let list = idArr.map((item) => {
        return {
          wndId: item,
        };
      });
      this.oWebControl.JS_RequestInterface({
        funcName: "stopMultiPlay",
        argument: {
          list,
        },
      });
    },

    /** 根据监控点编号录像回放
     * @param {*} cameraIndexCode :获取输入的监控点编号值，必填
     * @param {*} startTime:开始时间
     * @param {*} endTime:结束时间
     * @param {*} recordLocation://录像存储位置：0-中心存储，1-设备存储
     * @param {*} argument:api参数
     * argument属性cameraIndexCode优先级高于函数参数cameraIndexCode
     */
    startPlayBack(
      cameraIndexCode,
      startTime,
      endTime,
      recordLocation = 0,
      argument = {}
    ) {
      var startTimeStamp = new Date(
        startTime.replace("-", "/").replace("-", "/")
      ).getTime(); //回放开始时间戳，必填
      var endTimeStamp = new Date(
        endTime.replace("-", "/").replace("-", "/")
      ).getTime(); //回放结束时间戳，必填
      // var recordLocation = 0; //录像存储位置：0-中心存储，1-设备存储
      var transMode = 1; //传输协议：0-UDP，1-TCP
      var gpuMode = 0; //是否启用GPU硬解，0-不启用，1-启用
      var wndId = -1; //播放窗口序号（在2x2以上布局下可指定播放窗口）

      this.oWebControl.JS_RequestInterface({
        funcName: "startPlayback",
        argument: JSON.stringify({
          cameraIndexCode: cameraIndexCode, //监控点编号
          startTimeStamp: Math.floor(startTimeStamp / 1000).toString(), //录像查询开始时间戳，单位：秒
          endTimeStamp: Math.floor(endTimeStamp / 1000).toString(), //录像结束开始时间戳，单位：秒
          recordLocation: recordLocation, //录像存储类型：0-中心存储，1-设备存储
          transMode: transMode, //传输协议：0-UDP，1-TCP
          gpuMode: gpuMode, //是否启用GPU硬解，0-不启用，1-启用
          wndId: wndId, //可指定播放窗口
          ...argument,
        }),
      });
    },
    //停止所有回放
    stopAllPlayBack() {
      this.oWebControl.JS_RequestInterface({
        funcName: "stopAllPlayback",
      });
    },

    //设置布局
    //latyou布局：2x2
    setLayout(layout) {
      this.oWebControl.JS_RequestInterface({
        funcName: " setLayout",
        argument: {
          layout,
        },
      });
    },

    /** 画面字符叠加
     * @param {*} text :文字
     * @param {*} x:相对播放窗口左上角的横坐标起点
     * @param {*} y:相对播放窗口左上角的纵坐标起点
     * @param {*} fontSize:字体大小
     * @param {*} color:字体颜色，默认白色
     * @param {*} argument:api参数
     * argument属性cameraIndexCode优先级高于函数参数cameraIndexCode
     */
    drawText(
      text,
      x = 5,
      y = 5,
      fontSize = 20,
      color = 16777215,
      argument = {}
    ) {
      this.oWebControl.JS_RequestInterface({
        funcName: "drawOSD",
        argument: {
          text,
          x,
          y,
          fontSize,
          color,
          ...argument,
        },
      });
    },
    //进入全屏
    setFullScreen() {
      this.oWebControl.JS_RequestInterface({
        funcName: "setFullScreen",
      });
    },
    //退出全屏
    exitFullScreen() {
      this.oWebControl.JS_RequestInterface({
        funcName: "exitFullScreen",
      });
    },
    //播放抓图
    snapShot(argument = {}) {
      this.oWebControl.JS_RequestInterface({
        funcName: "snapShot",
        argument,
      });
    },
    //隐藏窗口
    hideWindow() {
      this.oWebControl.JS_HideWnd();
    },
    //显示窗口
    showWindow() {
      this.oWebControl.JS_ShowWnd();
    },
    //设置窗口尺寸
    setResize(width, height) {
      this.oWebControl.JS_Resize(width, height);
      this.setWndCover();
    },
    //下载安装包
    handleDownloadExe() {
      this.dialogVisible = false;
      if (this.downloadUrl) {
        this.downloadFile(this.downloadUrl);
      } else {
        console.log("下载地址为空");
      }
      this.$emit("clickDownload");
    },
    //下载文件
    downloadFile(url, fileName = "") {
      const a = document.createElement("a");
      a.style.display = "none";
      if (fileName) {
        a.setAttribute("download", fileName);
      }
      a.setAttribute("href", url);
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(a.href);
      document.body.removeChild(a);
    },
  },
};
</script>
<style scoped>
</style>