const express = require("express");
const app = express();

app.listen(8080, function () {
  console.log("listening on 8080");
});

//누군가가 /pet으로 방문을 하면...
//pet관련된 안내문을 띄워주자
app.get("/pet", function (req, res) {
  res.send("펫 용품 쇼핑 페이지입니다.");
});

app.get("/beauty", function (req, res) {
  res.send("뷰티용품 소개 페이지입니다");
});

//sendFile() 함수는 파일을 보낼 수 있음
//__dirname은 현재 파일 경로를 뜻함
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});
