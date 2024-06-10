const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();
const PROJECT_ROOT = path.join(__dirname, "..")
const PORT = process.env.PORT || 8000

let playerCount = 0;
let gameId = 0;
let currentPlayer = 'O';

let array = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

app.use(cookieParser());

app.use(express.static(path.join(PROJECT_ROOT, 'public')))

//listen vytvoří srv
app.get("/", function(req, res){
    res.sendFile('views/index.html', { root: PROJECT_ROOT } )
    console.log('Welcome! Your ID is: ' + req.cookies.userId);
});

app.get("/array", function(req,res){
    res.send(JSON.stringify(array));
});

app.use((req, res, next) => {
    // Kontrola, jestli ma uzivatel cookie id
    if (!req.cookies.userId) {
        // Increment player count and assign player character
        playerCount++;
        let playerCharacter = '';
        if(playerCount == 1){
            playerCharacter = 'O';
        }else{
            playerCharacter = 'X';
        }
        // Generate a new user ID
        const newUserId = Math.random();

        // Set the new ID and player character as cookies that expire in 1 year
        res.cookie('userId', newUserId);
        res.cookie('playerCharacter', playerCharacter);
    }
    if(playerCount == 0){
        gameId = 0;
        res.cookie('gameId', gameId);
    }else if(gameId == 0 && playerCount == 2){
        gameId = Math.random();
        res.cookie('gameId', gameId);
    }
    next();
});

app.get('/logout', (req, res) => {
    // Clear the user ID cookie by setting its expiration date to the past
    res.clearCookie('userId');
    res.clearCookie('playerCharacter');
    // Redirect the user to a different page (or respond with a message)
    res.redirect('/'); // Redirect to the homepage
});

app.get('/win',(req, res)=>{
    let gameFinished = req.query.win;
});

//app.set('view engine', ejs);

// GET /click

// nastavi hodnotu v p>  res.send("ok");
app.post('/click', (req, res) => {
    const id = req.query.id;
    const value = req.query.value;
    currentPlayer = value == 1 ? 'X' : 'O'; //TODO
    console.log(currentPlayer + 's turn is now!');
    console.log('Id: ' + id + ', value: ' + value);
    array[id] = value;
});

app.get('/current', (req, res) => {
    res.send(JSON.stringify(currentPlayer));
});


//app.use("/page",express.static("/TicTacToeSingle Final/HTML")); //pokud se objeví media v adrese, tak se ukážou věci z adresáře
/*app.get("/design",(req, res) => {
	res.send("/TicTacToeSingle Final/HTML");
});*/

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
