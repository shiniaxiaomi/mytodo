var express = require("express"); //导入express模块
const path = require("path");
var bodyParser = require("body-parser");
// 创建 application/x-www-form-urlencoded 编码解析
var urlencodedParser = bodyParser.urlencoded({ extended: false });

const fs = require("fs");
var app = express(); //获取app对象

var targetDir="./";

//设置静态资源路径(将html生成路径设置为静态资源路径)
app.use("", express.static("./"));

//session
var session = require("express-session");
app.use(
  session({
    secret: "this is a string key", //加密的字符串，里面内容可以随便写
    resave: false, //强制保存session,即使它没变化
    saveUninitialized: true //强制将未初始化的session存储，默认为true
  })
);

//启动server并监听再80端口
var server = app.listen(8000, function() {
  console.log("应用实例启动成功!");
});

var failed = 0;
var successed = 1;
var autoLoginFailed = 2; //自动登入失败

var todoListData = readJson(); //读取json数据

//返回首页
app.get("/", function(req, res) {
  res.sendFile(path.join(targetDir, "todo.html"));
});

app.post("/login", bodyParser.json(), function(req, res) {
  if (req.session.isLogin) {
    res.send({ code: successed, data: "登入成功!" });
    return;
  }

  if (req.body.password == "123456") {
    req.session.isLogin = true;
    res.send({ code: successed, data: "登入成功!" });
  } else {
    res.send({ code: failed, data: "密码错误" });
  }
});

app.post("/autoLogin", bodyParser.json(), function(req, res) {
  if (req.session.isLogin) {
    res.send({ code: successed, data: "登入成功!" });
    return;
  }

  if (req.body.password == "123456") {
    req.session.isLogin = true;
    res.send({ code: successed, data: "登入成功!" });
  } else {
    res.send({ code: autoLoginFailed, data: "密码错误" });
  }
});

//获取todoList的数据
app.get("/getTodoList", function(req, res) {
  if (req.session.isLogin == undefined) {
    res.send({ code: failed, data: "请先登入" });
    return;
  }

  res.send(todoListData);
});

//保存todoList的数据
app.post("/saveTodoList", bodyParser.json(), function(req, res) {
  if (req.session.isLogin == undefined) {
    res.send({ code: failed, data: "请先登入" });
    return;
  }

  todoListData = req.body;
  writeJson(todoListData); //保存到文件中
  res.send({ code: successed, data: "保存成功" });
});

//读取json数据
function readJson() {
  var targetPath = path.join(targetDir, "todo.json");
  //现将json文件读出来
  var data = fs.readFileSync(targetPath);
  var buff = data.toString(); //将二进制的数据转换为字符串
  if (buff != "") {
    buff = JSON.parse(buff); //将字符串转换为json对象
  } else {
    buff = [];
  }
  return buff;
}

//写入json数据
function writeJson(params) {
  var targetPath = path.join(targetDir, "todo.json");

  var str = JSON.stringify(params); //因为nodejs的写入文件只认识字符串或者二进制数，所以把json对象转换成字符串重新写入json文件中
  fs.writeFile(targetPath, str, function(err) {
    if (err) {
      console.error(err);
    }
  });
}
