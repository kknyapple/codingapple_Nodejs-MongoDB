const express = require("express");
const app = express();

//body-parser
app.use(express.urlencoded({ extended: true }));

const MongoClient = require("mongodb").MongoClient;

let db;

MongoClient.connect(
  "mongodb+srv://mongo:mongo123@cluster0.cxma51e.mongodb.net/?retryWrites=true&w=majority",
  function (err, client) {
    if (err) return console.log(err);

    db = client.db("todoapp");

    db.collection("post").insertOne(
      { 이름: "John", 나이: 20, _id: 2 },
      function (에러, 결과) {
        console.log("저장완료");
      }
    );

    //서버띄우는 코드 여기로 옮기기
    app.listen("8080", function () {
      console.log("listening on 8080");
    });

    // 누가 /add로 post요청하면 데이터 전송
    // write로 가서 submit하면 db에 저장됨
    app.post("/add", function (req, res) {
      res.send("전송완료");
      db.collection("post").insertOne(
        { _id: 1, 제목: req.body.title, 날짜: req.body.date },
        function () {
          console.log("저장완료");
        }
      );
    });
  }
);

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

app.get("/write", function (req, res) {
  res.sendFile(__dirname + "/write.html");
});

//post요청
//url은 html에 있음 //action="/add" method="POST"
//req에 input에 적은 정보 저장됨(body-parser 필요)
// app.post("/add", function (req, res) {
//   res.send("전송완료");
//   console.log(req.body.data);
//   console.log(req.body.title);
// });
