
var title = undefined;
var form = undefined;
var todoListData = []; //todo列表
var dragSrcEl = null; //拖拽
var dragSrcElMobile = null;
var isPC=IsPC();//判断是否是PC端
var mobileBuff=undefined;//移动端的拖拽buff
if(!isPC){
  //创建一个移动端的拖拽buff
  mobileBuff=document.createElement("span");
  mobileBuff.style.position="absolute";
  mobileBuff.style.opacity=0.6;//设置透明度
  mobileBuff.style.display="none";//隐藏
  mobileBuff.innerHTML=" move "
  document.getElementsByTagName("body")[0].appendChild(mobileBuff);//添加到body
}

window.onload = function() {

  title = document.getElementById("title");
  form = document.getElementById("form");

  //先尝试自动登入
  ajaxPostUtil("/autoLogin", { password: "" }, function(data) {
    if (data.code == 1) {
      //获取数据
      getData(function(data) {
        todoListData = data; //更新本地的数据
        reloadHtml(todoListData); //重新加载页面
      });
    } else {
      //登入
      login(function(data) {
        //获取数据
        getData(function(data) {
          todoListData = data; //更新本地的数据
          reloadHtml(todoListData); //重新加载页面
        });
      });
    }
  });
};



//删除一个todo
function remove(i) {
  var todo = todoListData.splice(i, 1)[0];
  saveData(todoListData, function(response) {
    reloadHtml(todoListData);
    console.log("删除成功!");
  });
}

//完成一个todo
function finished(i, field, value) {
  var todo = todoListData.splice(i, 1)[0];
  todo[field] = value;
  todoListData.splice(i, 0, todo);
  saveData(todoListData, function() {
    reloadHtml(todoListData);
  });
}

//更改一个todo
function edit(i,index) {
  var id=i.id;
  var p = document.getElementById(id);
  var buff = prompt("修改内容", p.innerHTML);
  if (buff == null) {
    return;
  }
  p.innerHTML = buff;

  var todo = todoListData.splice(index, 1)[0];
  todo["title"] = buff;
  todoListData.splice(index, 0, todo);
  saveData(todoListData, function(response) {
    reloadHtml(todoListData);
    console.log("修改成功!");
  });
}

//添加todo
function addTodo() {
  if (title.value == "") {
    alert("内容不能为空");
  } else {
    var todo = {
      id:
        "p" +
        Math.random()
          .toString()
          .substr(3, 15),
      title: title.value,
      done: false
    };
    todoListData.push(todo);
    form.reset();
    //保存数据
    saveData(todoListData, function() {
      reloadHtml(todoListData); //加载到页面
    });
  }
}

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
function getData(handleFunction) {
  //从服务器端获取数据
  ajaxGetUtil("/getTodoList", function(data) {
    handleFunction(data);
  });
}

//将数据保存到服务器端
function saveData(params, handleFunction) {
  ajaxPostUtil("/saveTodoList", params, function(response) {
    handleFunction(response);
  });
}

//将data数据加载到页面
function reloadHtml(data) {
  var todolist = document.getElementById("todolist");
  var donelist = document.getElementById("donelist");

  if (data != undefined && data.length != 0) {
    var todoCount = 0;
    var doneCount = 0;
    var todoString = "";
    var doneString = "";

    var finishedIndex = 1;
    var unFinishedIndex = 1;
    var li = undefined;
    var input = undefined;
    var div = undefined;
    var p1 = undefined;
    var p2 = undefined;
    var a = undefined;
    var span=undefined;
    for (var i = data.length - 1; i >= 0; i--) {
      li = undefined;
      input = undefined;
      div = undefined;
      p1 = undefined;
      p2 = undefined;
      a = undefined;
      span=undefined;

      //已经完成的todo
      if (data[i].done) {
        li = document.createElement("li");
        li.setAttribute("draggable", true);

        input = document.createElement("input");
        input.setAttribute("type", "checkbox");
        input.setAttribute("onchange", "finished(" + i + ",'done',false)");
        input.setAttribute("checked", "checked");
        li.appendChild(input);

        div = document.createElement("div");
        div.setAttribute("onclick", "edit(" + data[i].id + ","+i+")");
        p1 = document.createElement("p");
        p1.innerHTML = finishedIndex++ + ". ";
        p2 = document.createElement("p");
        p2.setAttribute("id", data[i].id);
        p2.innerHTML = data[i].title;
        div.appendChild(p1);
        div.appendChild(p2);
        li.appendChild(div);

        a = document.createElement("a");
        a.setAttribute("href", "javascript:remove(" + i + ")");
        a.innerHTML = " - ";
        li.appendChild(a);

        if(!isPC){
          span = document.createElement("span");
          span.setAttribute("index",i);
          span.innerHTML = " move ";
          li.appendChild(span);
        }

        doneString += li.outerHTML;
        doneCount++;
      } else {
        //未完成的todo
        li = document.createElement("li");
        li.setAttribute("draggable", true);

        input = document.createElement("input");
        input.setAttribute("type", "checkbox");
        input.setAttribute("onchange", "finished(" + i + ",'done',true)");
        li.appendChild(input);

        div = document.createElement("div");
        div.setAttribute("onclick", "edit(" + data[i].id + ","+i+")");
        p1 = document.createElement("p");
        p1.innerHTML = unFinishedIndex++ + ". ";
        p2 = document.createElement("p");
        p2.setAttribute("id", data[i].id);
        p2.innerHTML = data[i].title;
        div.appendChild(p1);
        div.appendChild(p2);
        li.appendChild(div);

        a = document.createElement("a");
        a.setAttribute("href", "javascript:remove(" + i + ")");
        a.innerHTML = " - ";
        li.appendChild(a);

        if(!isPC){
          span = document.createElement("span");
          span.setAttribute("index",i);
          span.innerHTML = " move ";
          li.appendChild(span);
        }

        todoString += li.outerHTML;
        todoCount++;
      }
    }
    todocount.innerHTML = todoCount;
    todolist.innerHTML = todoString;
    donecount.innerHTML = doneCount;
    donelist.innerHTML = doneString;
  } else {
    todocount.innerHTML = 0;
    todolist.innerHTML = "";
    donecount.innerHTML = 0;
    donelist.innerHTML = "";
  }

  var lis = todolist.querySelectorAll("ol li");
  [].forEach.call(lis, function(li) {
    //设置pc端拖拽
    li.addEventListener("dragstart", handleDragStart, false);
    li.addEventListener("dragover", handleDragOver, false);
    li.addEventListener("drop", handleDrop, false);
  });

  var spans=todolist.querySelectorAll("ol li span");
  [].forEach.call(spans, function(span) {
    //设置移动端拖拽
    span.addEventListener("touchmove", handleMove, false);
    span.addEventListener("touchstart", handleStart, false);
    span.addEventListener("touchend", handleEnd, false);
  });

}

//移动端移动时不断改变位置
function handleMove(e){
  mobileBuff.style.top=e.changedTouches[0].clientY-2+"px";
  mobileBuff.style.right=document.body.clientWidth-e.changedTouches[0].clientX-21+"px";
}
//开始移动时,记录拖拽的元素,并显示拖拽buff
function handleStart(e){
  dragSrcElMobile=this;
  
  mobileBuff.style.top=e.changedTouches[0].clientY-2+"px";
  mobileBuff.style.right=document.body.clientWidth-e.changedTouches[0].clientX-21+"px";
  mobileBuff.style.display="block";//显示
}
//移动结束时,保存移动后的数据,并隐藏拖拽buff
function handleEnd(e){
  mobileBuff.style.display="none";//隐藏
  var span=document.elementFromPoint(e.changedTouches[0].clientX,e.changedTouches[0].clientY);
  var index=span.getAttribute("index");
  if(index==null){
    return;
  }

  if (dragSrcElMobile != span) {
    var srcId = dragSrcElMobile.parentElement.getElementsByTagName("p")[1].id;
    var targetId = span.parentElement.getElementsByTagName("p")[1].id;

    var buffList = [];
    var srcIndexBuff = 0;
    var targetIndexBuff = 0;

    //找出src和target的Id
    for (var i = 0; i < todoListData.length; i++) {
      if (todoListData[i].id == srcId) {
        srcIndexBuff = i;
      } else if (todoListData[i].id == targetId) {
        targetIndexBuff = i;
      }
    }

    for (var i = 0; i < todoListData.length; i++) {
      if (i == srcIndexBuff) {
        continue;
      } else if (i == targetIndexBuff) {
        buffList.push(todoListData[srcIndexBuff]);
        buffList.push(todoListData[targetIndexBuff]);
      } else {
        buffList.push(todoListData[i]);
      }
    }
    todoListData = buffList;
    //保存数据
    saveData(todoListData, function() {
      reloadHtml(todoListData);
    });
  }

}


// 清空已完成的任务
function clearFinished() {
  var dataBuff = [];
  for (var i = 0; i < todoListData.length; i++) {
    if (!todoListData[i].done) {
      dataBuff.push(todoListData[i]);
    }
  }
  //保存数据
  todoListData = dataBuff;
  saveData(todoListData, function() {
    reloadHtml(todoListData);
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

//设置PC端拖拽
function handleDragStart(e) {
  dragSrcEl = this;
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/html", this.innerHTML);
}
function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }
  e.dataTransfer.dropEffect = "move";

  return false;
}
function handleDrop(e) {
  if (e.stopPropagation) {
    e.stopPropagation();
  }
  if (dragSrcEl != this) {
    var srcId = dragSrcEl.children[1].children[1].id;
    var targetId = this.children[1].children[1].id;

    var buffList = [];
    var srcIndexBuff = 0;
    var targetIndexBuff = 0;

    //找出src和target的Id
    for (var i = 0; i < todoListData.length; i++) {
      if (todoListData[i].id == srcId) {
        srcIndexBuff = i;
      } else if (todoListData[i].id == targetId) {
        targetIndexBuff = i;
      }
    }

    for (var i = 0; i < todoListData.length; i++) {
      if (i == srcIndexBuff) {
        continue;
      } else if (i == targetIndexBuff) {
        buffList.push(todoListData[srcIndexBuff]);
        buffList.push(todoListData[targetIndexBuff]);
      } else {
        buffList.push(todoListData[i]);
      }
    }
    todoListData = buffList;
    //保存数据
    saveData(todoListData, function() {
      reloadHtml(todoListData);
    });
  }
  return false;
}

//判断是否是PC端
function IsPC() {
  var userAgentInfo = navigator.userAgent;
  var Agents = ["Android", "iPhone",
     "SymbianOS", "Windows Phone",
     "iPad", "iPod"];
  var flag = true;
  for (var v = 0; v < Agents.length; v++) {
     if (userAgentInfo.indexOf(Agents[v]) > 0) {
        flag = false;
        break;
     }
  }
  return flag;
}