const express = require('express');

const app = express();

app.use(express.json());


app.set("view engine", "ejs");
app.set("views", "src/views");


app.get("/", (req, res) => {
    res.render("index");
});

app.get("/getanime", (req, res) => {
    try{
        const data = fetch(`https://api.myanimelist.net/v2/users/${user_name}/animelist?fields=list_status=plan_to_watch&limit=1000`).then((res)=>{
        if (res.status === 200){
            return res.json();
        }
        return console.log(`error status: ${res.status}`);
        });
    }catch(error){
        res.send(error.message);
    }
    const selected = Math.floor(Math.random() * (data.length - 0 + 1) + 0);
    
    res.render("index", {anime: data[selected]});
});

const port = 8080;

app.listen(port, () => console.log('servidor conectado na porta ' + port));