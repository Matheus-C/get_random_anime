const express = require('express');

const app = express();

app.use(express.json());

const CLIENT_ID = "76f967452b8f6c2202aa934b10a39800";
const CLIENT_SECRET = "c73f92b68c6298b1a0e0480c9b593bf938783ff9c77ed1c89ce27020fb5d751d";


const randomstring = require("randomstring");
const crypto = require("crypto");
const base64url = require("base64url");

const code_verifier = randomstring.generate(128);

const base64Digest = crypto
  .createHash("sha256")
  .update(code_verifier)
  .digest("base64");

console.log(base64Digest);

const code_challenge = base64url.fromBase64(base64Digest);

console.log(code_challenge);

app.set("view engine", "ejs");
app.set("views", "src/views");

app.get("/auth", (req, res)=>{
    res.redirect(`https://myanimelist.net/v1/oauth2/authorize?response_type=code&client_id=${CLIENT_ID}&code_challenge=${code_challenge}&state=requestauth`);
});

app.get("/oauth", async (req, res) => {
    const url = "https://myanimelist.net/v1/oauth2/token";
    const data = {
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'code': req.query.code,
        'code_verifier': code_verifier,
        'grant_type': 'authorization_code'
    };
    try{
    const response = await fetch(url, {method: "POST", 
    body: data}).then(response=>response.json()).then(response => console.log(JSON.stringify(response)));
    const token = response.json();
    res.redirect("/");
    }catch(error){
        console.log(error.message);
        res.redirect("/");
    }
});

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/getanime", (req, res) => {
    try{
        const data = fetch(`https://api.myanimelist.net/v2/users/@me/animelist?fields=list_status=plan_to_watch&limit=1000`, headers = {
            'Authorization': `Bearer {access_token}`}).then((res)=>{
        if (res.status === 200){
            const selected = Math.floor(Math.random() * (data.length - 0 + 1) + 0);
            return res.render("index", {anime: data[selected], token: token});
        }
        return console.log(`error status: ${res.status}`);
        });
    }catch(error){
        res.send(error.message);
    }
    
});

const port = 8080;

app.listen(port, () => console.log('servidor conectado na porta ' + port));