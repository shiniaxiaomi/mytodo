var isPC = IsPC(); //判断是否是PC端

$(function() {
  var todoList = []; //保存todo数据

  //设置排序
  if (isPC) {
    $("#accordion").sortable({
      axis: "y", //只能在y轴上拖拽
      handle: "h3", //指定手柄为h3元素
      delay: 150, //设置延迟,防误触
      stop: function(event, ui) {
        // 当排序时，IE 不能注册 blur，所以触发 focusout 处理程序来移除 .ui-state-focus
        ui.item.children("h3").triggerHandler("focusout");

        saveData(); //排序结束时,保存数据
      }
    });
  } else {
    $("#accordion").sortable({
      axis: "y", //只能在y轴上拖拽
      handle: ".moveButton", //指定手柄为移动按钮元素
      delay: 150, //设置延迟,防误触
      stop: function(event, ui) {
        // 当排序时，IE 不能注册 blur，所以触发 focusout 处理程序来移除 .ui-state-focus
        ui.item.children("h3").triggerHandler("focusout");

        saveData(); //排序结束时,保存数据
      }
    });
  }

  //设置面板内容
  $("#accordion").accordion({
    header: "> div > h3",
    animate: "easeInOutCubic",
    animate: 150, //动画的持续时间
    collapsible: true,
    heightStyle: "content", //每个面板的高度取决于它的内容
    active: false //默认全部关闭
  });

  //先尝试自动登入
  ajaxPostUtil("/autoLogin", { password: "" }, function(data) {
    if (data.code == 1) {
      getData(); //获取数据并刷新
    } else {
      //登入
      login(function(data) {
        getData(); //获取数据并刷新
      });
    }
  });

  // $("#todoTitle").focus(); //输入框自动获取焦点
});

//登入
function login(handleFunction) {
  var password = prompt("输入登入密码");
  if (password == null || password === undefined) {
    return;
  }
  ajaxPostUtil("/login", { password: password }, function(data) {
    handleFunction(data);
  });
}

//从服务器端获取数据并加载
function getData() {
  //从服务器端获取数据
  ajaxGetUtil("/getTodoList", function(data) {
    todoList = data; //更新本地的数据
    initData(); //初始化数据
    refreshContent(); //刷新容器
  });
}

//刷新面板容器
function refreshContent() {
  $("#accordion").accordion("refresh");
}

//初始化todo
function initData() {
  todoList.forEach(item => {
    addTodo(item, true);
  });
  refreshContent();
}

//添加一个todo(isAppend:true表示加在最后面,false表示加在最前面,默认加在最前面)
function addTodo(item, isAppend) {
  var div = $("<div class='group'></div>");
  var h3 = undefined;
  if (isPC) {
    h3 = $("<h3>" + item.title + "</h3>");
  } else {
    var moveButton = $(
      "<div class='moveButton'><i class='iconfont icon-move'></i></div>"
    );
    div.prepend(moveButton);
    h3 = $("<h3>" + item.title + "</h3>");
  }

  var content = $("<div></div>");
  var textarea = $("<textarea>" + item.detail + "</textarea>");

  var btnGroup = $("<div class='btnGroup'></div>");
  var updateTitleButton = $("<button>修改标题</button>");
  var updateDetailButton = $("<button>保存详细</button>");
  var removeTodoButton = $("<button>删除todo</button>");

  btnGroup.append(updateTitleButton);
  btnGroup.append(updateDetailButton);
  btnGroup.append(removeTodoButton);
  content.append(textarea);
  content.append(btnGroup);
  div.append(h3);
  div.append(content);

  //保存title点击事件
  updateTitleButton.click(function() {
    var group = $(this).parents(".group");

    var title = prompt(
      "请输入要修改的title",
      $(group)
        .find("h3")
        .eq(0)
        .text()
    );
    if (title != null) {
      var spanHtml = $(group).find("span")[0].outerHTML; //获取前面的icon

      $(group)
        .find("h3")
        .eq(0)
        .html(spanHtml + title); //设置title

      saveData();
    }
  });

  //保存detail点击事件
  updateDetailButton.click(function() {
    saveData();
  });

  //删除todo
  removeTodoButton.click(function() {
    $(this)
      .parents(".group")
      .eq(0)
      .remove();

    saveData();
  });

  if (isAppend == undefined || isAppend == false) {
    $("#accordion").prepend(div);
  } else {
    $("#accordion").append(div);
  }
}

//回车添加todo事件
function addEnter() {
  var key = event.keyCode;
  if (key == 13) {
    var title = $("#todoTitle").val();
    if (title == "") return;

    addTodo({ title: title, detail: "" });
    $("#todoTitle").val(""); //清空输入框
    saveData();
    refreshContent();
  }
}

//保存数据
function saveData() {
  var json = [];
  var groups = $("#accordion").find(".group");

  groups.map((index, item) => {
    var title = $(item)
      .find("h3")
      .eq(0)
      .text();
    var detail = $(item)
      .find("textarea")
      .eq(0)
      .val();

    json.push({ title: title, detail: detail });
  });

  ajaxPostUtil("/saveTodoList", json, function(response) {
    if (response.code == 1) {
      layer.msg("保存成功", {
        time: 500 //0.5s后自动关闭
      });
    } else {
      layer.msg("保存失败,请稍后再试", {
        time: 2000 //2s后自动关闭
      });
    }
  });
}

//发送get请求
function ajaxGetUtil(url, handleFunction) {
  var httpRequest = new XMLHttpRequest(); //第一步：建立所需的对象
  httpRequest.open("GET", url, true); //第二步：打开连接  将请求参数写在url中  ps:"./Ptest.php?name=test&nameone=testone"
  httpRequest.send(); //第三步：发送请求  将请求参数写在URL中

  httpRequest.onreadystatechange = function() {
    if (httpRequest.readyState == 4 && httpRequest.status == 200) {
      var data = JSON.parse(httpRequest.responseText);
      if (data.code == 0) {
        alert(data.data);
        //自动刷新页面
        location.reload();
        return;
      }
      handleFunction(data); //获取到json字符串，还需解析
    }
  };
}

//发送get请求
function ajaxPostUtil(url, dataObj, handleFunction) {
  var httpRequest = new XMLHttpRequest(); //第一步：创建需要的对象
  httpRequest.open("post", url); //第二步：打开连接/***发送json格式文件必须设置请求头 ；如下 - */
  httpRequest.setRequestHeader("Content-type", "application/json"); //设置请求头 注：post方式必须设置请求头（在建立连接后设置请求头）var obj = { name: 'zhansgan', age: 18 };
  httpRequest.send(JSON.stringify(dataObj)); //发送请求 将json写入send中

  httpRequest.onreadystatechange = function() {
    //请求后的回调接口，可将请求成功后要执行的程序写在其中
    if (httpRequest.readyState == 4 && httpRequest.status == 200) {
      //验证请求是否发送成功
      var data = JSON.parse(httpRequest.responseText);
      if (data.code == 0) {
        alert(data.data);
        //自动刷新页面
        location.reload();
        return;
      }
      handleFunction(data); //获取到json字符串，还需解析
    }
  };
}

//判断是否是PC端
function IsPC() {
  var userAgentInfo = navigator.userAgent;
  var Agents = [
    "Android",
    "iPhone",
    "SymbianOS",
    "Windows Phone",
    "iPad",
    "iPod"
  ];
  var flag = true;
  for (var v = 0; v < Agents.length; v++) {
    if (userAgentInfo.indexOf(Agents[v]) > 0) {
      flag = false;
      break;
    }
  }
  return flag;
}
