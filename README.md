# vue-hk-video
海康web插件1.5.2版本组件

前言:

使用前请确保index.html已正确引入官方插件包query-1.12.4.min.js、jsencrypt.min.js、jsWebControl-1.0.0.min.js



**Props**

| 参数 |说明  |类型  | 默认值| 可选值 |是否必须 |
| --- | --- | --- | --- | --- | --- |
width|组件宽(单位px)|Number	|1000|——	|否|
height	|组件高(单位px)|	Number	|600|	——	|否
playMode|	模式，0：预览，1：回放|	Number|	0|	1|	否
autoResize|	浏览器窗口改变时候是否动态改变组件宽度，开启的话将按照初始化组件占浏览器可视区域比例缩放组件宽度，如果设置false，请手动监听浏览器窗口大小变化动态设置width值	|Boolean	|true|	false|	否
downloadDialog|	未安装海康视频插件时候是否显示插件下载对话框提示用户下载功能,需支持element的el-dialog组件|	Boolean|	false|	true|	否
downloadText|	海康视频插件下载对话框提示文字|	String|插件启动失败，请检查插件是否安装，如果未安装请点击下载安装，安装后刷新页面|	——|否|
downloadUrl|	海康视频插件下载地址|	String|	——	|——	|downloadDialog为true必须
argument|	初始化组件参数，具体看下表，argument内的playMode优先级高于props属性playMode|	Object|	——|——|	是



**argument**
| 参数 |说明  |类型  | 默认值| 可选值 |是否必须 |
| --- | --- | --- | --- | --- | --- |
appkey|	API网关提供的appkey|String|	——|——|	是
secret|	API网关提供的secret	|String|	——|	——	|是
ip	|API网关IP地址|	String	|——	|——	|是
port	|平台端口	Number	|443|	——|——|	否
playMode|	初始播放模式，优先级高于prop的playMode	|Number	|0	|1|	否
layout|	布局|	String|	'2x2'	|可选值有“1x1”、“2x2”、 “3x3”、“4x4”、“5x5”、“1x2”、“1+2”、 “1+5”、“1+7”、“1+8”、“1+9”、“1+12”、 “1+16”、“4+9”、“1+1+12”、“3+4”、 “1x4”、“4x6	|否
encryptedFields|	加密字段|	String	|secret|——|否
videoDir|	紧急录像或录像剪辑存储 路径|	String|	——|	——	|否
showToolbar|	是否显示工具栏，0不显示其他值显示|	Number|	非0|	0|	否
buttonIDs	|工具条按钮字符串，多个 之间以“,”分割，值具体看开发指南	|Sting|	——|——|否
toolBarButtonIDs	|工具栏按钮字符串，多个 之间以“,”分割，值具体看开发指南	|String|	——|——|否
evelType|	时间轴级别|	String	|24h|”24h，12h，6h，1h，36m，24m， 12m”	|否


**Event**

| 事件名 |说明  |回调参数
| --- | --- |--- |
windowChang	 |选中窗口改变	|（windId）windId：窗口号，从1开始
layoutChange	|布局分屏改变	|（e） e:{layout:，//布局例如‘3x3’ wnNum//窗口数例如9}
initFinish|	组件初始化完成	|无
pluginError|	海康视频插件启动失败（未安装）	|无
clickDownload	|海康视频插件下载对话框，点击下载按钮事件	|无


**方法**
通过实例调用例如：this.$refs.hkvideo.setLayout('3x3');
参数argument：api参数具体查看开发指南，argument内部参数优先级高于方法参数

| 方法名 |说明  |参数
| --- | --- |--- |
startPreview|	单个窗口预览	|（cameraIndexCode, argument = {})cameraIndexCode：监控点编号，必填，
stopAllPreview	|停止所有窗口预览	|无
stopListPreview	|批量(指定窗口)停止播放	|（idArr）idArr：播放窗口序号数组，必填
startPlayBack|根据监控点编号录像回放|(cameraIndexCode, startTime, endTime, recordLocation=0,argument = {}) cameraIndexCode :获取输入的监控点编号值，必填，startTime:开始时间，endTime:结束时间，recordLocation://录像存储位置：0-中心存储，1-设备存储
stopAllPlayBack	|停止所有回放|	无
setLayout|	设置窗口布局	|(layout)layout：布局例如（‘3x3’），必填
drawText|画面字符叠加|(text, x = 5,y = 5, fontSize = 20, color = 16777215,argument = {}) ，text :文字，必填， x:相对播放窗口左上角的横坐标起点，y:相对播放窗口左上角的纵坐标起点，fontSize:字体大小，color:字体颜色，默认白色
setFullScreen	|进入全屏	|无
exitFullScreen|	退出全屏|	无
snapShot	|播放抓图	|无
setResize|设置组件尺寸	|（width,height）width:组件宽，height:组件高


**demo**

```html
<template>
  <div class="container">
    <hk-video ref="hkvideo" :argument="argument" @windowChang="onWindChange"   :playMode="playMode"></hk-video>
    <div class="opt-view">
      <button class="btn" @click="preview">预览</button>
      <button class="btn" @click="stop">停止所有预览</button>
      <button class="btn" @click="setLayout('1x1')">1x1</button>
      <button class="btn" @click="setLayout('2x2')">2x2</button>
      <button class="btn" @click="setLayout('3x3')">3x3</button>
      <button class="btn" @click="setLayout('4x4')">4x4</button>
      <button class="btn" @click="stopList">停止当前窗口预览</button>
      <button class="btn" @click="changeMode">切换模式</button>
      <button class="btn" @click="startPlayBack">回放</button>
      <button class="btn" @click="drawText">叠加文字</button>
      <button class="btn" @click="setFullScreen">进入全屏</button>
      <button class="btn" @click="exitFullScreen">退出全屏</button>
    </div>
  </div>
</template>
```

```javascript
<script>
import hkVideo from "../components/hk-video/index.vue";
export default {
  data() {
    return {
      argument: {
        appkey: "202xxxxx", //API网关提供的appkey
        secret: "XiXzk3eGDvadxxxxxxxx", //API网关提供的secret
        ip: "192.168.xx.xx", //API网关IP地址
        windId:1,//当前窗口号
      },
      cameraIndexCode:'1e48db29e22143118441bxxxxxxxxxxx',
      playMode:0
    };
  },
  components: {
    hkVideo,
  },
  methods: {
  //预览
    preview() {
      this.$refs.hkvideo.startPreview(this.cameraIndexCode);
    },
    //停止预览
    stop() {
      this.$refs.hkvideo.stopAllPreview();
    },
    //设置布局
    setLayout(layout){
         this.$refs.hkvideo.setLayout(layout);
    },
    //窗口改变监听
    onWindChange(windId){
       this.windId=windId
    },
    //批量停止预览
    stopList(){
      this.$refs.hkvideo.stopListPreview([this.windId])   
    },
    //回放
    startPlayBack(){
        this.$refs.hkvideo.startPlayBack(this.cameraIndexCode,'2022-07-01 9:00','2022-07-27 20:00')
    },
    //切换模式
    changeMode(){
        this.playMode=this.playMode ? 0:1
    },
    //画面字符叠加
    drawText(){
       this.$refs.hkvideo.drawText('叠加文字测试')
    },
    //全屏
    setFullScreen(){
      this.$refs.hkvideo.setFullScreen()
    },
    //退出全屏
    exitFullScreen(){
      this.$refs.hkvideo.exitFullScreen()
    }
  },
};

```

