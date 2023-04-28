const urlGetAllPlayersFromApi = 'https://futdb.app/api/players';
const urlUpdateAllPlayers = "https://localhost:8443/updateAllPlayers";
const urlGetAllPlayers = "https://wltracker-f4a44-default-rtdb.europe-west1.firebasedatabase.app/players.json"
//const urlGetAllPlayers = "https://85.218.151.80:8443/allPlayers";
//const urlGetPlayer = "https://192.168.1.23:8443/player";
const urlGetPlayer = "https://wltracker-f4a44-default-rtdb.europe-west1.firebasedatabase.app/players";

// create a new div element with the loader class
const loader = document.createElement("div");
loader.classList.add("loader");

function loadUser() {
    let lineUp = [];
    if (localStorage.getItem('lineUp') === null) {
        localStorage.setItem('lineUp', JSON.stringify(lineUp));
    } else {
        lineUp = JSON.parse(localStorage.getItem('lineUp'));
        lineUp.sort((a, b) => (a.goals > b.goals) ? -1 : 1);
    }

    let games = [];
    let gamesWon = 0;
    let gamesLost = 0;
    if (localStorage.getItem('games') === null) {
        localStorage.setItem('games', JSON.stringify(games));
    } else {
        games = JSON.parse(localStorage.getItem('games'));
        let wonGames = games.filter(game => game.won === true);
        let lostGanes = games.filter(game => game.won === false);
        let drawnGames = games.filter(game => game.won === null);
        gamesWon = wonGames.length;
        gamesLost = lostGanes.length;

    }

    const lineUpStats = document.getElementById('lineupPlayers');
    lineUp.forEach(function (player) {
        const row = document.createElement('tr');
        const name = document.createElement('td');
        name.innerHTML = player.name;
        const position = document.createElement('td');
        position.innerHTML = player.position;
        const goals = document.createElement('td');
        goals.innerHTML = player.goals;
        const assists = document.createElement('td');
        assists.innerHTML = player.assists;
        const motm = document.createElement('td');
        motm.innerHTML = player.motm;

        row.appendChild(name);
        row.appendChild(position);
        row.appendChild(goals);
        row.appendChild(assists);
        row.appendChild(motm);
        lineUpStats.appendChild(row);
    });

    const data = {
        labels: ['Wins', 'Losses'],
        datasets: [
            {
                data: [gamesWon, gamesLost],
                backgroundColor: ['#36A2EB', '#FF6384'],
                hoverBackgroundColor: ['#36A2EB', '#FF6384']
            }
        ]
    };
    const options = {
        title: {
            display: true,
            text: 'Win ratio'
        }
    };
    const chart = new Chart(document.getElementById('win-loss-chart'), {
        type: 'pie',
        data: data,
        options: options
    });

    const divWins = document.querySelector('.wins');
    divWins.innerHTML = gamesWon;
    const divLosses = document.querySelector('.losses');
    divLosses.innerHTML = gamesLost;
    //const divDraws = document.querySelector('.draws');
    //divDraws.innerHTML = gamesDrawn;
    const divGoals = document.querySelector('.goals');
    divGoals.innerHTML = lineUp.reduce((total, player) => total + player.goals, 0);
    const divAssists = document.querySelector('.assists');
    divAssists.innerHTML = lineUp.reduce((total, player) => total + player.assists, 0);


}

async function getAllPlayersFromApi() {
    let allPlayers = [];
    for (let i = 1; i < 909; i++) {
        let response = await fetch(urlGetAllPlayersFromApi + "?page=" + i, {
            method: 'GET',
            headers: {
                'accept': 'application/json',
                'X-AUTH-TOKEN': '704f6962-4c8b-44b8-81bf-4c20640e51d1'
            }
        });
        let data = await response.json();
        allPlayers.push(data.items);
        console.log(data);
    }
    const extractedItems = [];
    for (let i = 0; i < allPlayers.length; i++) {
        for (let j = 0; j < allPlayers[i].length; j++) {
            extractedItems.push(allPlayers[i][j]);
        }
    }
    console.log(extractedItems);
    return extractedItems;
}

async function getAllPlayers() {
    // add the loader element to the HTML document
    document.body.appendChild(loader);
    let response = await fetch(urlGetAllPlayers, {
        method: 'GET',
        headers: {
            'accept': 'application/json'
        }
    });
    if (response.status === 200) {
        // remove the loader element from the HTML document
        document.body.removeChild(loader);
        let data = await response.json();
        console.log(data);
        return data;
    } else {
        // remove the loader element from the HTML document
        document.body.removeChild(loader);
        console.log("Error: " + response.status);
    }
}

async function getPlayer(id) {
    let allPlayers = await getAllPlayers();
    let player = allPlayers.find(player => player.id === id);
    console.log(player);
    return player;

    /*console.log(id);
    id--;
    console.log(id);
    let response = await fetch(urlGetPlayer + "/" + id + ".json", {
        method: 'GET',
        headers: {
            'accept': 'application/json',
        }
    });
    let data = await response.json();
    console.log(data);
    return data;

     */
}

async function addGame() {
    const homePage = document.getElementById('homePage');
    homePage.classList.add('unFocus');
    const addGameOverlay = document.createElement('div');
    addGameOverlay.classList.add('add-game-overlay');
    addGameOverlay.innerHTML = `
        <div class="add-game">
            <div class="add-game-header">
                <h2>Add Game</h2>
                <div class="search-container">
                    <input type="text" placeholder="Search for a player">
                </div>
                <div class="game-score">
                    <h4>You</h4>
                    <input class="homeGoals" type="number" value="0" min="0" max="10" disabled>
                    <h4 class="divider">:</h4>
                    <input type="number" value="0" min="0" max="10">
                    <h4>Opponent</h4>
                </div>
                <br>
                <table class="add-game-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Position</th>
                            <!--<th>Rating</th>-->
                            <!--<th>Nation</th>
                            <th>Club</th>-->
                            <th>Goals</th>
                            <th>Assists</th>
                            <th>MOTM</th>
                            <!--<th>Add</th>-->
                    </thead>
                    <tbody>
                    </tbody>
                </table>
            </div>
            <br>
            <button class="close-add-game" onclick="location.reload()">X</button>
            <button class="add-game-button" onclick="saveGame()">Submit!</button>
        </div>`
    document.body.appendChild(addGameOverlay);

    const addGameTable = document.querySelector('.add-game-table tbody');
    const searchInput = document.querySelector('.search-container input');
    let lineup = JSON.parse(localStorage.getItem('lineUp'));
    lineup.sort((a, b) => (a.goals > b.goals) ? -1 : 1);
    for (let i = 0; i < lineup.length; i++) {
        let player = lineup[i];
        console.log(player);
        const playerRow = document.createElement('tr');
        printAddGameRows(player, addGameTable, playerRow);
    }

    searchInput.addEventListener('keyup', (e) => {
        const input = document.querySelector('.search-container input');
        const searchString = input.value.toLowerCase();
        const filteredPlayers = lineup.filter(player => {
            return (player.common_name.toLowerCase().includes(searchString));
        });
        console.log(filteredPlayers);
        addGameTable.innerHTML = '';
        for (let i = 0; i < filteredPlayers.length; i++) {
            let player = filteredPlayers[i];
            console.log(player);
            const playerRow = document.createElement('tr');
            printAddGameRows(player, addGameTable, playerRow);
        }
    });
}

function calculateTotalGoals() {
    let goals = 0;
    const goalsInput = document.querySelectorAll('.goals-input');
    goals += Array.from(goalsInput).reduce((total, input) => total + Number(input.value), 0);
    console.log(goals);
    const homeGoals = document.querySelector('.homeGoals');
    homeGoals.value = goals;
}

function saveGame() {
    let games = JSON.parse(localStorage.getItem('games'));
    let newGame = {};
    let lineup = JSON.parse(localStorage.getItem('lineUp'));
    const gameScore = document.querySelector('.game-score');
    const homeScore = gameScore.children[1].value;
    const awayScore = gameScore.children[3].value;
    const addGameTable = document.querySelector('.add-game-table tbody');
    const rows = addGameTable.children;
    if (games === null) {
        games = [];
    }
    newGame.won = homeScore > awayScore;
    newGame.draw = homeScore === awayScore;
    newGame.lost = homeScore < awayScore;
    newGame.id = games.length + 1;
    newGame['score'] = {
        you: homeScore,
        opponent: awayScore
    }
    newGame['lineup'] = lineup;
    let players = [];
    newGame['players'] = players;
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const playerName = row.children[0].innerText;
        const goals = row.children[2].children[0].value;
        const assists = row.children[3].children[0].value;
        const motm = row.children[4].children[0].checked;
        console.log(playerName, goals, assists, motm);
        for (let j = 0; j < lineup.length; j++) {
            if (lineup[j].common_name === playerName) {
                lineup[j].goals += parseInt(goals);
                lineup[j].assists += parseInt(assists);
                if (motm) {
                    lineup[j].motm++;
                }
                players.push({
                    id: lineup[j].id,
                    common_name: lineup[j].common_ame,
                    goals: goals,
                    assists: assists,
                    motm: motm
                });
            }
        }
    }
    console.log(newGame);
    games.push(newGame);
    localStorage.setItem('games', JSON.stringify(games));
    localStorage.setItem('lineUp', JSON.stringify(lineup));
    location.reload();

}

function printAddGameRows(player, addGameTable, playerRow) {
    const name = document.createElement('td');
    name.innerHTML = player.common_name;
    const position = document.createElement('td');
    position.innerHTML = player.position;
    const goals = document.createElement('td');
    goals.innerHTML = `<input class="goals-input" type="number" value="0" min="0" max="10" onchange="calculateTotalGoals()">`;
    const assists = document.createElement('td');
    assists.innerHTML = `<input type="number" value="0" min="0" max="10">`;
    const motm = document.createElement('td');
    motm.innerHTML = `<input type="checkbox">`;

    playerRow.appendChild(name);
    playerRow.appendChild(position);
    playerRow.appendChild(goals);
    playerRow.appendChild(assists);
    playerRow.appendChild(motm);
    addGameTable.appendChild(playerRow);
}

function removeGame() {
    const games = JSON.parse(localStorage.getItem('games'));
    const removeGameOverlay = document.createElement('div');
    removeGameOverlay.classList.add('remove-game-overlay');
    removeGameOverlay.innerHTML = `
        <div class="remove-game">
            <div class="remove-game-header">
                <h3>Remove Game</h3>
            </div>
            <br>
            <table class="remove-game-table">
                <thead>
                    <tr>
                        <th>Game</th>
                        <th>Score</th>
                        <th>Remove</th>
                </thead>
                <tbody>
                </tbody>
            </table>
        </div>`
    document.body.appendChild(removeGameOverlay);

    const removeGameTable = document.querySelector('.remove-game-table tbody');
    for (let i = 0; i < games.length; i++) {
        let game = games[i];
        console.log(game);
        const gameRow = document.createElement('tr');
        printRemoveGameRows(game, removeGameTable, gameRow);
    }

}

function printRemoveGameRows(game, removeGameTable, gameRow) {
    const gameNumber = document.createElement('td');
    gameNumber.innerHTML = game.id;
    const score = document.createElement('td');
    score.innerHTML = `${game.score.you} - ${game.score.opponent}`;
    const remove = document.createElement('td');
    remove.innerHTML = `<button class="remove-game-button" onclick="removeGameFromStorage(${game.id})">Remove</button>`;

    gameRow.appendChild(gameNumber);
    gameRow.appendChild(score);
    gameRow.appendChild(remove);
    removeGameTable.appendChild(gameRow);
}

function removeGameFromStorage(gameId) {
    const games = JSON.parse(localStorage.getItem('games'));
    const lineUp = JSON.parse(localStorage.getItem('lineUp'));
    for (let i = 0; i < games.length; i++) {
        if (games[i].id === gameId) {
            console.log(games[i].players);
            let players = games[i].players;
            console.log(players.length);
            for (let j = 0; j < players.length; j++) {
                let player = games[i].players[j];
                console.log(player);
                for (let k = 0; k < lineUp.length; k++) {
                    if (lineUp[k].common_name === player.common_name) {
                        console.log(lineUp[k].common_name);
                        lineUp[k].goals -= player.goals;
                        lineUp[k].assists -= player.assists;
                        if (player.motm) {
                            lineUp[k].motm--;
                        }
                    }
                }
            }
        }
        games.splice(i, 1);
    }
    localStorage.setItem('games', JSON.stringify(games));
    localStorage.setItem('lineUp', JSON.stringify(lineUp));
    location.reload();
}

async function addPlayer() {
    const homePage = document.getElementById('homePage');
    homePage.classList.add('unFocus');
    const addPlayerOverlay = document.createElement('div');
    addPlayerOverlay.classList.add('add-player-overlay');
    addPlayerOverlay.innerHTML = `
        <div class="add-player">
            <div class="add-player-header">
                <div class="search-container">
                    <input type="text" placeholder="Search for a player">
                    <button type="submit"><i class="fa fa-search"></i></button>
                </div>
                <br>
                <table class="add-player-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Position</th>
                            <th>Rating</th>
                            <!--<th>Nation</th>
                            <th>Club</th>-->
                            <th>Add</th>
                    </thead>
                    <tbody>
                    </tbody>
                </table>
            </div>
            <button class="close-add-player  pbClose" onclick="location.reload()">X</button>
        </div>`
    document.body.appendChild(addPlayerOverlay);


    const addPlayerTable = document.querySelector('.add-player-table tbody');
    let allPlayers = await getAllPlayers();
    allPlayers.sort((a, b) => (a.rating > b.rating) ? -1 : 1);
    console.log(allPlayers);
    for (let i = 0; i < 10; i++) {
        let player = allPlayers[i];
        console.log(player);
        const playerRow = document.createElement('tr');
        printAddPlayerRows(player, addPlayerTable, playerRow);
    }




    const searchButton = document.querySelector('.search-container button');
    searchButton.addEventListener('click', (e) => {
        const input = document.querySelector('.search-container input');
        const searchString = input.value.toLowerCase();
        const filteredPlayers = allPlayers.filter(player => {
            return (player.common_name.toLowerCase().includes(searchString));
        });
        console.log(filteredPlayers);
        addPlayerTable.innerHTML = '';
        for (let i = 0; i < 10; i++) {
            let player = filteredPlayers[i];
            console.log(player);
            const playerRow = document.createElement('tr');
            printAddPlayerRows(player, addPlayerTable, playerRow);
        }
    });
}

let body = {};

function postAllPlayers(players) {
    body = JSON.stringify(players);
    console.log(body);
    postPlayerRequest.body = body;
    fetch(urlUpdateAllPlayers, postPlayerRequest).catch((error) => console.log(error));
}

const postPlayerRequest = {
    method: "POST",
    headers: {
        "content-type": "application/json"
    },
    body: body
}

function printAddPlayerRows(player, addPlayerTable, playerRow) {
    playerRow.innerHTML = `
                <td>${player.common_name}</td>
                <td>${player.position}</td>
                <td>${player.rating}</td>
                <!--<td>${player.nation}</td>
                <td>${player.club}</td>-->
                <td><button class="add-player-button" id="${player.id}">Add</button></td>
            `
    addPlayerTable.appendChild(playerRow);

    const addPlayerButton = document.getElementById(`${player.id}`);

    addPlayerButton.addEventListener("click", function() {
        addPlayerToLineup(player);
    });
}

async function addPlayerToLineup(player) {
    let lineUp = JSON.parse(localStorage.getItem('lineUp'));
    lineUp.push(player);
    localStorage.setItem('lineUp', JSON.stringify(lineUp));
    location.reload();
}

function printRemovePlayerRows(player, removePlayerTable, playerRow) {
    playerRow.innerHTML = `
                <td>${player.common_name}</td>
                <td>${player.position}</td>
                <td>${player.rating}</td>
                <!--<td>${player.nation}</td>
                <td>${player.club}</td>-->
                <td><button class="remove-player-button" id="${player.id}">Remove</button></td>
            `
    removePlayerTable.appendChild(playerRow);

    const removePlayerButton = document.getElementById(`${player.id}`);

    removePlayerButton.addEventListener("click", function() {
        removePlayerFromLineup(player);
    });
}

function removePlayerFromLineup(player) {
    let playerId = player.id;
    let lineUp = JSON.parse(localStorage.getItem('lineUp'));
    for (let i = 0; i < lineUp.length; i++) {
        if (lineUp[i].id === playerId) {
            lineUp.splice(i, 1);
        }
    }
    localStorage.setItem('lineUp', JSON.stringify(lineUp));
    location.reload();
}

function removePlayer() {
    const homePage = document.getElementById('homePage');
    homePage.classList.add('unFocus');
    const editLineupOverlay = document.createElement('div');
    editLineupOverlay.classList.add('edit-lineup-overlay');
    editLineupOverlay.innerHTML = `
        <div class="edit-lineup">
            <div class="edit-lineup-header">
                <h2>Lineup</h2>
                <table class="edit-lineup-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Position</th>
                            <th>Rating</th>
                            <!--<th>Nation</th>
                            <th>Club</th>-->
                            <th>Remove</th>
                    </thead>
                    <tbody>
                    </tbody>
                </table>
            </div>
            <br>
            <button class="close-edit-lineup pbClose" onclick="location.reload()">X</button>
        </div>`
    document.body.appendChild(editLineupOverlay);

    const editLineupTable = document.querySelector('.edit-lineup-table tbody');
    let lineUp = JSON.parse(localStorage.getItem('lineUp'));
    for (let i = 0; i < lineUp.length; i++) {
        let player = lineUp[i];
        console.log(player);
        const playerRow = document.createElement('tr');
        printRemovePlayerRows(player, editLineupTable, playerRow);
    }

}

