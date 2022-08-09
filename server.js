const express = require("express");
const app = express();

//fetch() 이용하려고
app.use(express.json()); //X

//put요청
const methodOverride = require("method-override");
app.use(methodOverride("_method"));

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
  res.render("write.ejs");
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

app.delete("/delete", function (req, res) {
  db.collection("post").deleteOne(req.body, function (err, result) {
    console.log("삭제완료");
  });
  res.send("삭제완료");
});

app.get("/detail/:id", function (req, res) {
  db.collection("post").findOne(
    { _id: parseInt(req.params.id) },
    function (err, result) {
      res.render("detail.ejs", { data: result });
    }
  );
});

app.get("/edit/:id", function (req, res) {
  db.collection("post").findOne(
    { _id: parseInt(req.params.id) },
    function (err, result) {
      res.render("edit.ejs", { post: result });
    }
  );
});

//updateOne -> (업데이트 할 내용, 수정 내용, 콜백함수)
app.put("/edit", function (req, res) {
  db.collection("post").updateOne(
    { _id: parseInt(req.body.id) },
    { $set: { 제목: req.body.title, 날짜: req.body.date } },
    function () {
      console.log("수정완료");

      //성공실패 상관없이 응답 list로 이동
      res.redirect("/list");
    }
  );
});

const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const session = require("express-session");

//미들웨어 사용
app.use(
  session({ secret: "비밀코드", resave: true, saveUninitialized: false })
);
app.use(passport.initialize());
app.use(passport.session());

app.get("/login", function (req, res) {
  res.render("login.ejs");
});
app.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/fail",
  }),
  function (req, res) {
    res.redirect("/");
  }
);

//id, pw 검사 코드(복붙)
//pw가 암호화 X -> 보안 X (해시...)
passport.use(
  new LocalStrategy(
    {
      usernameField: "id",
      passwordField: "pw",
      session: true,
      passReqToCallback: false,
    },
    function (입력한아이디, 입력한비번, done) {
      //console.log(입력한아이디, 입력한비번);
      db.collection("login").findOne(
        { id: 입력한아이디 },
        function (에러, 결과) {
          if (에러) return done(에러);

          if (!결과)
            return done(null, false, { message: "존재하지않는 아이디요" });
          if (입력한비번 == 결과.pw) {
            return done(null, 결과);
          } else {
            return done(null, false, { message: "비번틀렸어요" });
          }
        }
      );
    }
  )
);

//세션을 저장(로그인 성공시 발동)
//검증완료 후 결과 -> user로 전달
//세션 데이터를 만들고 세션 id 정보를 쿠키로 보냄
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

//이 세션 데이터를 가진 사람을 db에서 찾아줌(마이페이지 접속시 발동)
passport.deserializeUser(function (id, done) {
  done(null, {});
});
