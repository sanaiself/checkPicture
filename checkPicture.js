/*
* @function for check pictures
* created by XiaoMingwei at 2021年5月27日10:10:12
* options{
*   url: '', // 当前显示图片
*   list: [], // 图片列表 可选，如果没有或者空表示只查看一张图 
* }
* */

function checkPicture(options) {
  var _this = this;
  // 生成uuid
  _this.guid = function () {
    return 'sa' + 'xxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0;
      var v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    })
  };

  // 初始化私有变量
  _this.initPrivateOptions = function () {
    _this.options.more = _this.options.list.length > 0;
    _this.options.id = _this.guid();
    if(_this.options.more){
      _this.options.index = _this.options.list.indexOf(_this.options.url) || 0;
    }
    if( _this.options.index < 0 ){
      _this.options.index = 0;
    }
    _this.temporaryData = {
      clickEl: null,
      timer: null,
      top: 0,
      left: 0
    }
  };

  // 初始化参数
  _this.setOptions = function (options) {
    _this.options = {};
    _this.options.url = (options && options.url) ? options.url : '';
    _this.options.list = (options && options.list && options.list.length>0) ? options.list : [];
    _this.initPrivateOptions()
  };

  // 绑定关闭按钮
  _this.onClickCLose = function () {
    document.getElementsByTagName('body')[0].removeChild(_this.cover)
  };

  // 初始化图片状态
  _this.initPictureStatus = function () {
    _this.temporaryData.top = 0;
    _this.temporaryData.left = 0;
    _this.img.style.top = '0';
    _this.img.style.left = '0'
  };

  // 设置图片地址
  _this.setPictureUrl = function (url) {
    console.log('设置图片地址:' + url);
    _this.initPictureStatus();
    _this.img.setAttribute('src',url);
    _this.img.removeAttribute('hidden');
  };

  // 放大图片
  _this.enlargePicture = function () {
    _this.img.className = _this.img.className + ' sa-check-picture-img-scale2';
  };

  // 缩小图片
  _this.narrowPicture = function () {
    var className = _this.img.className.split(' ') || [];
    _this.img.className = removeFromArray(className, 'sa-check-picture-img-scale2').join(' ');
  };

  // 双击图片操作
  _this.doubleClick = function () {
    var className = _this.img.className.split(' ') || [];
    var scale = className.indexOf('sa-check-picture-img-scale2');
    if(scale === -1){
      _this.enlargePicture();
    }else{
      _this.narrowPicture();
    }
  };

  // 绑定左右按钮--左
  _this.onClickPre = function () {
    _this.narrowPicture();
    _this.options.index--;
    if(_this.options.index < 0){
      _this.options.index++;
      alert("当前是第一张");
    }else{
      _this.setPictureUrl(_this.options.list[_this.options.index]);
    }
  };

  // 绑定左右按钮--右
  _this.onClickNext = function () {
    _this.narrowPicture();
    _this.options.index++;
    if(_this.options.index >= _this.options.list.length){
      _this.options.index--;
      alert("已经是最后一张了");
      return;
    }else{
      _this.setPictureUrl(_this.options.list[_this.options.index]);
    }
  };

  // 从数组中删除某一项--不能使用prototype，可能对全局方法造成污染
  function removeFromArray(array, item) {
    var newArray = [];
    for (var i = 0; i<array.length; i++) {
      if(array[i] !== item){
        newArray.push(array[i]);
      }
    }
    return newArray;
  }

  // 判断点击事件是单击还是双击
  _this.checkCLickOrDouble = function ( e ) {
    var el = e.currentTarget;
    var events = {click: new Function(), double: _this.doubleClick};
    // 根据后面判定处理事件
    function triggerEvent( type ) {
      if( typeof events[type] === 'function' ){
        events[type]()
      }else{
        console.warn('您未设置当前操作')
      }
      // 方法结束清空记录
      clearInterval(_this.temporaryData.timer);
      _this.temporaryData.clickEl = null;
    }
    
    // 进来之后开启定时器，如果时间到了视为点击，否则小于200ms接收到新的点击视为双击
    function setTimer() {
      if(_this.temporaryData.timer) {
        clearInterval(_this.temporaryData.timer);
      }
      _this.temporaryData.timer = setInterval(function () {
        triggerEvent( 'click' );
      }, 200);
    }
    
    // 记录当前时间和点击的元素
    if(_this.temporaryData.clickEl){
      // 下一次进来对比与上一次的元素
      if( el === _this.temporaryData.clickEl ){
        // 相同，视为双击，运行events.double
        triggerEvent( 'double' )
      }else{
        _this.temporaryData.clickEl = el;
        // 启动timer
        setTimer();
      }
    }else{
      _this.temporaryData.clickEl = el;
      // 启动timer
      setTimer();
    }
  };

  // 设置拖拽
  _this.initPictureDraggable = function (e) {
    var oEvent = e || event;
    var sentX = oEvent.clientX;
    var sentY = oEvent.clientY;
    document.onmousemove = function (e) {
      var oEvent = e || event;
      var offsetLeft = oEvent.clientX - sentX;
      var offsetTop = oEvent.clientY - sentY;
      _this.img.style.top = _this.temporaryData.top + offsetTop + 'px';
      _this.img.style.left = _this.temporaryData.left + offsetLeft + 'px'
    };
    document.onmouseup = function (){
      document.onmousemove = null;
      document.onmouseup = null;
      _this.temporaryData.top = parseFloat(_this.img.style.top);
      _this.temporaryData.left = parseFloat(_this.img.style.left);
    };
  };

  // 添加图片框架
  _this.init = function () {
    // 1，初始化数据
    _this.setOptions(options);
    if(!_this.options.url && !_this.options.more){
      console.error('请检查参数 options.url 或 options.list 是否存在');
    }else{
      // 2，初始化页面
      _this.cover = document.createElement('div');
      _this.cover.id = 'saCheckPictures';
      _this.cover.className = 'sa-check-pictures';
      _this.cover.onmousedown = _this.initPictureDraggable;
      // 创建图片
      _this.img = document.createElement('img');
      _this.img.className = 'sa-check-picture-img';
      _this.img.hidden = true;
      _this.setPictureUrl(_this.options.url);
      _this.img.onclick = _this.checkCLickOrDouble;
      _this.img.onmousedown = _this.initPictureDraggable;
      _this.img.ondragstart=function (){return false;};
      _this.cover.appendChild(_this.img);

      // 左右按钮
      if(_this.options.more){
        // 上一个
        _this.pre = document.createElement('div');
        _this.pre.className = 'sa-check-button sa-check-pre';
        _this.pre.innerHTML = '<svg t="1622184096227" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1116" width="64" height="64"><path d="M218.442816 513.05498m20.73513199-21.599745l0 0q20.735131-21.599745 42.33487601-0.864613l502.194064 482.091806q21.599745 20.735131 0.864614 42.334876l0 0q-20.735131 21.599745-42.334877 0.864613l-502.194064-482.091806q-21.599745-20.735131-0.86461301-42.334876Z" p-id="1117" fill="#cdcdcd"></path><path d="M763.710585-12.60292599m20.735131 21.59974499l0 0q20.735131 21.599745-0.864613 42.334876l-502.194065 482.09180599q-21.599745 20.735131-42.334876-0.86461299l0 0q-20.735131-21.599745 0.864613-42.334876l502.194065-482.091807q21.599745-20.735131 42.334876 0.864614Z" p-id="1118" fill="#cdcdcd"></path></svg>';
        _this.pre.onclick = _this.onClickPre;
        _this.cover.appendChild(_this.pre);
        // 下一个
        _this.next = document.createElement('div');
        _this.next.className = 'sa-check-button sa-check-next';
        _this.next.innerHTML = '<svg t="1622183911002" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2509" width="64" height="64"><path d="M805.557184 510.94502m-20.735132 21.599745l0 0q-20.735131 21.599745-42.334876 0.864613l-502.194064-482.091806q-21.599745-20.735131-0.864614-42.334876l0 0q20.735131-21.599745 42.334877-0.864613l502.194064 482.091806q21.599745 20.735131 0.864613 42.334876Z" p-id="2510" fill="#cdcdcd"></path><path d="M260.289415 1036.602926m-20.735131-21.599745l0 0q-20.735131-21.599745 0.864613-42.334876l502.194065-482.091806q21.599745-20.735131 42.334876 0.864613l0 0q20.735131 21.599745-0.864613 42.334876l-502.194065 482.091807q-21.599745 20.735131-42.334876-0.864614Z" p-id="2511" fill="#cdcdcd"></path></svg>';
        _this.next.onclick = _this.onClickNext;
        _this.cover.appendChild(_this.next);
      }
      // 关闭
      _this.close = document.createElement('div');
      _this.close.className = 'sa-check-button sa-check-close';
      _this.close.innerHTML = '<svg t="1622184756825" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2812" width="48" height="48"><path d="M583.168 523.776L958.464 148.48c18.944-18.944 18.944-50.176 0-69.12l-2.048-2.048c-18.944-18.944-50.176-18.944-69.12 0L512 453.12 136.704 77.312c-18.944-18.944-50.176-18.944-69.12 0l-2.048 2.048c-19.456 18.944-19.456 50.176 0 69.12l375.296 375.296L65.536 899.072c-18.944 18.944-18.944 50.176 0 69.12l2.048 2.048c18.944 18.944 50.176 18.944 69.12 0L512 594.944 887.296 970.24c18.944 18.944 50.176 18.944 69.12 0l2.048-2.048c18.944-18.944 18.944-50.176 0-69.12L583.168 523.776z" p-id="2813" fill="#cdcdcd"></path></svg>';
      _this.close.onclick = _this.onClickCLose;
      _this.cover.appendChild(_this.close);

      document.getElementsByTagName('body')[0].appendChild(_this.cover);
    }
  };

  _this.init()
}
