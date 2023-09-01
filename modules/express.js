const express = require('express');
const request = require("request");
const app = express();
const session = require('express-session');
var sess = {
    secret: "secret",
    cookie: {},
    token: undefined,
    resave: true,
    saveUninitialized: false
};
app.use(session(sess));



app.use(express.urlencoded({ extended: false }));

app.use(express.json());


const randomstring = require("randomstring");


const code_verifier = randomstring.generate(128);

const code_challenge = code_verifier;

app.set("view engine", "ejs");
app.set("views", "src/views");

app.get("/auth", (req, res)=>{
    res.redirect(`https://myanimelist.net/v1/oauth2/authorize?response_type=code&client_id=${process.env.CLIENT_ID}&code_challenge=${code_challenge}&state=requestauth`);
});

app.get("/oauth", async (req, res) => {
    const url = "https://myanimelist.net/v1/oauth2/token";
    const data = new URLSearchParams({
        'client_id': process.env.CLIENT_ID,
        'client_secret': process.env.CLIENT_SECRET,
        'code': req.query.code,
        'code_verifier': code_verifier,
        'grant_type': "authorization_code"
    });
    
    try{
        
    const response = await fetch(url, {method: "POST", 
    headers:{'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}, body: data}).then(response=>response.json());
    req.session.token = response;
    
    
    res.redirect("/");
    }catch(error){
        console.log(error.message);
        res.redirect("/");
    }
});

app.get("/", (req, res) => {
    res.render("index", {session: req.session.token});
});




app.get("/getanime", async (req, res) => {
    try{
        const response = await fetch(`https://api.myanimelist.net/v2/users/@me/animelist?status=plan_to_watch&limit=1000`, {Method: 'GET', headers: {
            Authorization: `${req.session.token.token_type} ${req.session.token.access_token}`, Accept: 'application/json'}}).then((resp)=>{
        if (resp.status === 200){
            return resp.json();
        }
        return console.log(`error status: ${resp.status}`);
        });
        const selected = Math.floor(Math.random() * (response.data.length - 0 + 1) + 0);
        const img = response.data[selected].node.main_picture.medium;
        const titulo = response.data[selected].node.title;
        const anime_data = await fetch(`https://api.myanimelist.net/v2/anime/${response.data[selected].node.id}?fields=synopsis`, {Method: 'GET', headers: {
            Authorization: `${req.session.token.token_type} ${req.session.token.access_token}`, Accept: 'application/json'}}).then((resp)=>{
            if (resp.status === 200){
                const response = resp.json();
                return response;
            }
            return console.log(`error status: ${resp.status}`);
        });
        return res.render("index", {titulo: titulo, img: img, sinopse: anime_data.synopsis, session: req.session.token});
    }catch(error){
        res.send(error.message);
    }
    
});
app.get("/logout", (req, res)=> {
    req.session.destroy();
    res.redirect("/");
});
const port = 8080;

app.listen(port, () => console.log('servidor conectado na porta ' + port));