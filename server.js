const express = require("express");
const app = express();

//body-parser
app.use(express.urlencoded({ extended: true }));

const MongoClient = require("mongodb").MongoClient;
app.set("view engine", "ejs");

let db;

MongoClient.connect(
  "mongodb+srv://mongo:mongo123@cluster0.cxma51e.mongodb.net/?retryWrites=true&w=majority",
  function (err, client) {
    if (err) return console.log(err);

    db = client.db("todoapp");

    //서버띄우는 코드 여기로 옮기기
    app.listen("8080", function () {
      console.log("listening on 8080");
    });

    // 누가 /add로 post요청하면 데이터 전송
    // write로 가서 submit하면 db에 저장됨
    app.post("/add", function (req, res) {
      res.send("전송완료");

      //데이터를 하나만 찾고 싶을 때 -> findOne()
      db.collection("counter").findOne(
        { name: "number of posts" },
        function (err, result) {
          let totalPost = result.totalPost;

          db.collection("post").insertOne(
            { _id: totalPost, 제목: req.body.title, 날짜: req.body.date },
            function () {
              console.log("저장완료");

              //counter에서 totalPost 1증가
              //데이터 수정하기 -> updateOne(), updateMany()
              //$set -> 변경 operator, $inc -> 증가 operator...
              db.collection("counter").updateOne(
                //totalPost는 계속 바뀌므로 {name}을 수정해준다
                { name: "number of posts" },
                { $inc: { totalPost: 1 } }
              );
            }
          );
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

//list로 get요청으로 접속하면 실제 db 데이터가 있는 html 보여줌
//ejs를 보여주려면 views폴더 안에 있어야함
app.get("/list", function (req, res) {
  //db에 저장된 post라는 collection안의 데이터를 꺼내기
  //모든 데이터 찾기 -> find().toArray()
  db.collection("post")
    .find()
    .toArray(function (err, result) {
      console.log(result);
      res.render("list.ejs", { posts: result });
    });
});
