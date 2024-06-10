let boxes = Array.from(document.getElementsByClassName("box"))
let restart_button = document.getElementById("reset-button")
let currentPlayerInput = document.getElementById("playerInput")
let x_has_won;
let o_has_won;

const x_txt = "O";
const o_txt = "X";
let currentMove = x_txt;
const boardSize = 5;
let board = Array(boardSize * boardSize).fill(null); //Create new array of 25 null elements

//Získání znaku od COOKIES
function getCookie(name) {
    // Create a regular expression to match the cookie name
    const match = document.cookie.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]*)'));

    // If the cookie is found, return its value; otherwise, return null
    return match ? decodeURIComponent(match[1]) : null;
}

// Usage example
const userId = getCookie('userId');
const pCharacter = getCookie('playerCharacter');
console.log('User ID:', userId);
console.log('Player Character:', pCharacter);



//ssh -p 20353 jouda@dev.spsejecna.net # molic-wa2 (heslo: jooouda)
function recieveDataFromServer(){
    fetch('/win')
        .then(response => {
            // Check if the response was successful
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            // Parse the JSON response
            return response.json();
        })
        .then(data => {
                let value = data.value;
                let win = data.win;
                if(value = 'O'){
                    x_has_won = win;
                }else if(value = 'X'){
                    o_has_won = win;
                }
            }
        )
        .catch(error => {
            // Handle any errors that occurred during the fetch
            console.error('Fetch error:', error);
        });
}
let myTurn;

//Kontrola, jestli je moje kolo
function checkIfItIsMyTurn(){
    fetch('/current')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Save the received data
            myTurn = data == pCharacter ? true : false;
            let txt = myTurn ? "Your turn " + pCharacter : "Enemy's turn";
            currentPlayerInput.innerHTML = txt;
        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        });
}

function updateInterface(){
    recieveDataFromServer();
    checkIfItIsMyTurn();
    fetch('/array')
        .then(response => {
            // Check if the response was successful
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            // Parse the JSON response
            return response.json();
        })
        .then(data => {
            // Handle the JSON data
            console.log(data);

            for(var i = 0; i < data.length; i++){
                var elementID = i.toString();
                var element = document.getElementById(elementID);
                if(data[i] == 1){
                    board[i] = 'O';
                    loadClickedBoxes(i, 'O');
                }else if(data[i] == 2){
                    board[i] = 'X';
                    loadClickedBoxes(i, 'X');
                }
            }
        })
        .catch(error => {
            // Handle any errors that occurred during the fetch
            console.error('Fetch error:', error);
        });
}
setInterval(updateInterface, 1000);

const startGame = () => {
    currentPlayerInput.innerHTML =`You are ${pCharacter}`;
    console.log("Game Started")
    boxes.forEach(box => box.addEventListener('click', boxClicked))
}

/*
Metody HTTP protokolu:
GET - když se naloaduje stránka
POST -
PUT -
DELETE -
*/

function boxClicked(e){
    let value = 0;
    const id = e.target.id;
    if(!board[id] && (!o_has_won && !x_has_won) && myTurn){ //If the element's id is in the array (null)
        board[id] = pCharacter; // current move
        e.target.textContent = pCharacter; // current move
        switch(pCharacter){ // current move
            case 'O':
                value = 1;
                //console.log('Looks like value = ' + value);
                break;
            case 'X':
                value = 2;
                //console.log('Looks like value = ' + value);
                break;
        }
        fetch(`/click?id=${id}&value=${value}`,{
            method: 'POST'
        });
        if(findAChampion()){
            currentPlayerInput.innerHTML = `${pCharacter} has won!`;
        }
        //if x_txt then change to o_txt, else change to x_txt

        if (currentMove === x_txt) {
            currentMove = o_txt;
        } else {
            currentMove = x_txt;
        }
    }
}

function loadClickedBoxes(id, value){
    document.getElementById(id).textContent = value;
}

function findAChampion() {
    if(checkRows() || checkColumns() || checkDiagonals() || checkAntiDiagonals()){
        if(currentMove == x_txt) {
            x_has_won = true;
            let value = 'X';
            fetch(`/win?win=${x_has_won}&value=${value}`,{
                method: 'POST'
            });
        }else {
            o_has_won = true;
            let value = 'O';
            fetch(`/win?win=${o_has_won}&value=${value}`,{
                method: 'POST'
            });
        }
    }
    return (checkRows() || checkColumns() || checkDiagonals() || checkAntiDiagonals());
}
function checkRows() {
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col <= boardSize - 4; col++) {
            const startIndex = row * boardSize + col;
            const rowSlice = board.slice(startIndex, startIndex + 4);
            if (rowSlice.every(cell => cell === currentMove)) {
                return true;
            }
        }
    }
    return false;
}
function checkColumns() {
    for (let col = 0; col < boardSize; col++) {
        for (let row = 0; row <= boardSize - 4; row++) {
            const startIndex = row * boardSize + col;
            const colSlice = [board[startIndex], board[startIndex + boardSize], board[startIndex + 2 * boardSize], board[startIndex + 3 * boardSize]];
            if (colSlice.every(cell => cell === currentMove)) {
                return true;
            }
        }
    }
    return false;
}
function checkDiagonals() {
    for (let row = 0; row <= boardSize - 4; row++) {
        for (let col = 0; col <= boardSize - 4; col++) {
            const startIndex = row * boardSize + col;
            const diagonalSlice = [board[startIndex], board[startIndex + boardSize + 1], board[startIndex + 2 * (boardSize + 1)], board[startIndex + 3 * (boardSize + 1)]];
            if (diagonalSlice.every(cell => cell === currentMove)) {
                return true;
            }
        }
    }
    return false;
}
function checkAntiDiagonals() {
    for (let row = 0; row <= boardSize - 4; row++) {
        for (let col = 3; col < boardSize; col++) {
            const startIndex = row * boardSize + col;
            const antiDiagonalSlice = [board[startIndex], board[startIndex + boardSize - 1], board[startIndex + 2 * (boardSize - 1)], board[startIndex + 3 * (boardSize - 1)]];
            if (antiDiagonalSlice.every(cell => cell === currentMove)) {
                return true;
            }
        }
    }
    return false;
}


restart_button.addEventListener('click', restart)
function restart(){
    board.fill(null) //reset array --> nulls
    boxes.forEach(box => {
        box.innerText = null;
    })
    currentMove = o_txt;
    x_has_won = false;
    currentPlayerInput.innerHTML =`You are ${pCharacter}`;
    o_has_won = false;
    console.clear()
    localStorage.clear()
    startGame();
}

startGame()