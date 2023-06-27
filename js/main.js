const urlGetAllPlayers = "https://wltracker-f4a44-default-rtdb.europe-west1.firebasedatabase.app/players.json";
const urlGetAllClubs = "https://wltracker-f4a44-default-rtdb.europe-west1.firebasedatabase.app/clubs.json";
const urlGetAllNations = "https://wltracker-f4a44-default-rtdb.europe-west1.firebasedatabase.app/nations.json";
const urlGetAllRarities = "https://wltracker-f4a44-default-rtdb.europe-west1.firebasedatabase.app/rarities.json";

// create a new div element with the loader class
const loader = document.createElement("div");
loader.classList.add("loader");

async function loadUser() {
    let lineUp = [];
    if (localStorage.getItem('lineUp') === null) {
        localStorage.setItem('lineUp', JSON.stringify(lineUp));
    } else {
        lineUp = JSON.parse(localStorage.getItem('lineUp'));
        lineUp.sort((a, b) => {
            if (b.goals !== a.goals) {
                return b.goals - a.goals;
            } else {
                return b.assists - a.assists;
            }
        });
    }

    let games = [];
    let gamesWon = 0;
    let gamesLost = 0;
    let cleanSheets = 0;
    if (localStorage.getItem('games') === null) {
        localStorage.setItem('games', JSON.stringify(games));
    } else {
        games = JSON.parse(localStorage.getItem('games'));
        let wonGames = games.filter(game => game.won === true);
        let lostGanes = games.filter(game => game.won === false);
        let drawnGames = games.filter(game => game.won === null);
        gamesWon = wonGames.length;
        gamesLost = lostGanes.length;
        let cleanSheetsGames = games.filter(game => game.cleanSheet === true);
        cleanSheets = cleanSheetsGames.length;

        changeRankImg(gamesWon, gamesLost);
    }
/*
    const playerDivs = document.querySelectorAll('.fieldPlayer .player-content');
    for (let i = 0; i < 11; i++) {
        let player = lineUp[i];
        if (player === undefined) {
            player = {
                common_name: "Empty"
            }
        }
        playerDivs[i].querySelector('span').innerHTML = player.common_name;
        playerDivs[i].id = player.id;
        console.log(playerDivs[i]);
    }

    const benchDivs = document.querySelectorAll('.benchPlayer .player-content');
    for (let i = 11; i < 21; i++) {
        let player = lineUp[i];
        if (player === undefined) {
            player = {
                common_name: "Empty"
            }
        }
        let benchDiv = benchDivs[i-11];
        benchDiv.querySelector('span').innerHTML = player.common_name;
        benchDiv.id = player.id;
    }

 */
    changeFormation();


    let draggedElement = null;

    document.addEventListener('dragstart', function(event) {
        draggedElement = event.target;
    }, false);

    document.addEventListener('dragover', function(event) {
        event.preventDefault();
    }, false);

    document.addEventListener('drop', function(event) {
        event.preventDefault();
        if (event.target.className == 'player') {
            let swapPosition = {top: event.target.style.top, left: event.target.style.left};
            event.target.style.top = draggedElement.style.top;
            event.target.style.left = draggedElement.style.left;
            draggedElement.style.top = swapPosition.top;
            draggedElement.style.left = swapPosition.left;
        }
    }, false);
    /*
    const positions = {
        'GK': {top: '300px', left: '200px'},
        'LB': {top: '200px', left: '100px'},
        'CB': {top: '200px', left: '200px'},
        'RB': {top: '200px', left: '300px'},
        'LM': {top: '100px', left: '100px'},
        'CM': {top: '100px', left: '200px'},
        'RM': {top: '100px', left: '300px'},
        'LW': {top: '0px', left: '100px'},
        'ST': {top: '0px', left: '200px'},
        'RW': {top: '0px', left: '300px'},
        'CF': {top: '25px', left: '200px'},
        'CAM': {top: '50px', left: '200px'},
    }

    /*
    const field = document.querySelector('.field');

    for (let player of lineUp) {
        let playerDiv = document.createElement('div');
        console.log(player.common_name);
        playerDiv.className = 'player';
        playerDiv.draggable = true;
        playerDiv.style.top = positions[player.position].top;
        playerDiv.style.left = positions[player.position].left;
        playerDiv.style.position = 'absolute';
        console.log(playerDiv.style.top, playerDiv.style.left)

        let playerImg = document.createElement('img');
        playerImg.src = player.image;
        playerImg.alt = player.name;

        let playerName = document.createElement('p');
        playerName.textContent = player.name;

        playerDiv.appendChild(playerImg);
        playerDiv.appendChild(playerName);

        field.appendChild(playerDiv);
    }
     */




    /*
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

     */

    // Data and options for pie chart
    const pieData = {
        labels: ['Wins', 'Losses'],
        datasets: [
            {
                data: [gamesWon, gamesLost],
                backgroundColor: ['#36A2EB', '#FF6384'],
                hoverBackgroundColor: ['#36A2EB', '#FF6384']
            }
        ]
    };
    const pieOptions = {
        title: {
            fontColor: 'white',
            display: true,
            text: 'Win ratio'
        },
        legend: {
            labels: {
                fontColor: "#fff"
            }
        },
        scales: {
            yAxes: [{
                ticks: {
                    fontColor: "#fff"
                }
            }],
            xAxes: [{
                ticks: {
                    fontColor: "#fff"
                }
            }]
        }
    };

    // Parse the games from local storage
    let allGames = JSON.parse(localStorage.getItem('games'));

    // Create arrays to hold the x and y values for the chart
    let xValues = [];
    let yValues = [];

    // Initialize a variable to hold the current point value
    let currentPoints = 0;

    // Loop through each game
    for (let i = 0; i < allGames.length; i++) {
        // Check if the game was a win or a loss
        if (allGames[i].won === true) {
            currentPoints += 1;
        } else {
            currentPoints -= 1;
        }

        // Add the x and y values for the current point to the arrays
        xValues.push(i+1);
        yValues.push(currentPoints);
    }

// Data and options for line chart
    const lineData = {
        labels: xValues,
        datasets: [{
            label: 'Form',
            data: yValues,
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
        }]
    };
    const lineOptions = {
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Game Number'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'MatchMaking Form'
                },
                ticks: {
                    stepSize: 1
                }
            }
        }
    };

// Create pie chart
    const pieChart = new Chart(document.getElementById('win-loss-chart'), {
        type: 'doughnut',
        data: pieData,
        options: pieOptions
    });

// Create line chart
    const lineChart = new Chart(document.getElementById('lineGraph'), {
        type: 'line',
        data: lineData,
        options: lineOptions
    });


    const divWins = document.querySelector('.wins');
    divWins.innerHTML = gamesWon;
    const divLosses = document.querySelector('.losses');
    divLosses.innerHTML = "- " + gamesLost;
    //const divDraws = document.querySelector('.draws');
    //divDraws.innerHTML = gamesDrawn;
    const divGoals = document.querySelector('.goals');
    divGoals.innerHTML = lineUp.reduce((total, player) => total + player.goals, 0);
    const divConceded = document.querySelector('.conceded');
    let goalsConceded = 0;
    for (let game of games) {
        let conceded = game.score.opponent;
        goalsConceded += Number(conceded);
    }
    divConceded.innerHTML = goalsConceded;
    /*const divAssists = document.querySelector('.assists');
    divAssists.innerHTML = lineUp.reduce((total, player) => total + player.assists, 0);
     */
    const cleanSheetsDiv = document.getElementById('cleanSheets');
    cleanSheetsDiv.innerHTML = cleanSheets;
    const bestResultDiv = document.getElementById('bestResult');
    let bestGoalDifference = 0;
    let bestResult = "0 - 0";
    for (let game of games) {
        const goalDifference = game.score.you - game.score.opponent;
        console.log(goalDifference);
        if (goalDifference > bestGoalDifference) {
            bestResult = game.result;
            bestGoalDifference = goalDifference;
        }
        else if (goalDifference === bestGoalDifference) {
            if (game.score.opponent > bestResult.charAt(Number(4))) {
                bestResult = game.result;
                bestGoalDifference = goalDifference;
            }
        }
    }
    bestResultDiv.innerHTML = bestResult;
    const averageGoalsDiv = document.getElementById('averageScored');
    let scoredGoals = 0;
    let concededGoals = 0;
    for (let game of games) {
        let scored = Number(game.score.you);
        scoredGoals += scored;
        let conceded = Number(game.score.opponent);
        concededGoals += conceded;
    }
    const averageGoals = scoredGoals / games.length;
    const averageConceded = concededGoals / games.length;
    averageGoalsDiv.innerHTML = averageGoals.toFixed(1);
    const averageConcededDiv = document.getElementById('averageConceded');
    averageConcededDiv.innerHTML = averageConceded.toFixed(1);

    const totalGoals = scoredGoals + concededGoals;
    const goalsScoredPercentage = (scoredGoals / totalGoals) * 100;
    const goalsConcededPercentage = (concededGoals / totalGoals) * 100;

    const progressBarScored = document.querySelector('.progress-bar2.bg-success');
    const progressBarConceded = document.querySelector('.progress-bar2.bg-danger');
    progressBarScored.style.width = goalsScoredPercentage + "%";
    progressBarConceded.style.width = goalsConcededPercentage + "%";

    const totalGoalsScoredLabel = document.getElementById('totalGoalsScoredBar');
    totalGoalsScoredLabel.innerHTML = scoredGoals;
    const totalGoalsConcededLabel = document.getElementById('totalGoalsConcededBar');
    totalGoalsConcededLabel.innerHTML = concededGoals;

    lineUp.sort((a, b) => b.goals - a.goals);
    for (let i = 0; i < 4; i++) {
        const name = document.querySelector(`#topScorer${i + 1} .name`);
        const goals = document.querySelector(`#topScorer${i + 1} .value`);
        const picture = document.querySelector(`#topScorer${i + 1} img`);
        name.innerHTML = lineUp[i].common_name;
        goals.innerHTML = lineUp[i].goals;
        try {
            picture.src = await getPlayerPicture(lineUp[i].id);
            picture.style.backgroundImage = `url(${setImageBackground(lineUp[i])})`;
            picture.style.backgroundSize = '130% 130%';
            picture.style.backgroundPosition = 'center';
        }
        catch (e) {
            console.log(e);
        }
        if (picture.src === undefined) {
            picture.src = "https://1vs1-7f65.kxcdn.com/img/player-placeholder-full.svg"
        }
    }

    lineUp.sort((a, b) => b.assists - a.assists);
    for (let i = 0; i < 4; i++) {
        const name = document.querySelector(`#topAssister${i + 1} .name`);
        const assists = document.querySelector(`#topAssister${i + 1} .value`);
        const picture = document.querySelector(`#topAssister${i + 1} img`);
        name.innerHTML = lineUp[i].common_name;
        assists.innerHTML = lineUp[i].assists;
        try {
            picture.src = await getPlayerPicture(lineUp[i].id);
            picture.style.backgroundImage = `url(${setImageBackground(lineUp[i])})`;
            picture.style.backgroundSize = '130% 130%';
            picture.style.backgroundPosition = 'center';
        }
        catch (e) {
            console.log(e);
        }
        if (picture.src === undefined) {
            picture.src = "https://1vs1-7f65.kxcdn.com/img/player-placeholder-full.svg"
        }
    }

}

function showSection(id) {
    // Hide all sections
    document.querySelectorAll('section').forEach(section => {
        section.style.display = 'none';
    });

    // Show the selected section
    document.getElementById(id).style.display = 'block';
    if (id === 'past-wl') {
        printWeekendLeagues();
    }
    else if (id === 'all-time-stats') {
        showAllTimeStats();
    }

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

async function addGame() {
    const homePage = document.getElementById('homePage');
    homePage.classList.add('unFocus');
    const addGameOverlay = document.createElement('div');
    addGameOverlay.classList.add('add-game-overlay');
    const addGameOverlayContent = document.createElement('div');
    addGameOverlayContent.classList.add('add-game-overlay-content');
    addGameOverlayContent.innerHTML = `
        <div class="add-game">
            <div class="add-game-header">
                <h2>Add Game</h2>
                <div class="game-score">
                    <h4>You</h4>
                    <input class="homeGoals" type="number" value="0" min="0" max="10">
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
    addGameOverlay.appendChild(addGameOverlayContent);
    document.body.appendChild(addGameOverlay);

    const addGameTable = document.querySelector('.add-game-table tbody');
    let lineup = JSON.parse(localStorage.getItem('lineUp'));
    lineup.sort((a, b) => {
        if (b.goals !== a.goals) {
            return b.goals - a.goals;
        } else {
            return b.assists - a.assists;
        }
    });
    for (let player of lineup) {
        console.log(player);
        const playerRow = document.createElement('tr');
        printAddGameRows(player, addGameTable, playerRow);
    }
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
    console.log(awayScore);
    const addGameTable = document.querySelector('.add-game-table tbody');
    const rows = addGameTable.children;
    if (games === null) {
        games = [];
    }
    newGame.won = homeScore > awayScore;
    newGame.lost = homeScore < awayScore;
    newGame.result = homeScore + " - " + awayScore;
    newGame.cleanSheet = awayScore === "0";
    newGame.id = games.length + 1;
    newGame['score'] = {
        you: homeScore,
        opponent: awayScore
    }
    newGame['lineup'] = lineup;
    let players = [];
    newGame['players'] = players;

    let playerId = 0;
    for (let player of lineup) {
        let playerGoals = sessionStorage.getItem(`goals-${player.id}`);
        console.log(playerGoals);
        let goals = JSON.parse(playerGoals);
        console.log(goals);
        let playerAssists = sessionStorage.getItem(`assists-${player.id}`);
        let assists = JSON.parse(playerAssists);
        let motm = sessionStorage.getItem(`motm-${player.id}`);

        if (playerGoals === null) {
            goals = 0;
        }
        if (playerAssists === null) {
            assists = 0;
        }
        if (motm === null) {
            motm = false;
        }

        for (let j = 0; j < lineup.length; j++) {
            if (lineup[j].common_name === player.common_name) {
                lineup[j].goals += parseInt(goals);
                lineup[j].assists += parseInt(assists);
                if (motm) {
                    lineup[j].motm++;
                }
                players.push({
                    id: lineup[j].id,
                    common_name: lineup[j].common_name,
                    goals: parseInt(goals),
                    assists: parseInt(assists),
                    motm: motm
                });
            }
        }

    }

    sessionStorage.clear();


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
                    common_name: lineup[j].common_name,
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
    goals.innerHTML = `<input class="goals-input"  id="g${player.id}" type="number" value="0" min="0" max="10">`;
    const assists = document.createElement('td');
    assists.innerHTML = `<input type="number" id="a${player.id}" value="0" min="0" max="10">`;
    const motm = document.createElement('td');
    motm.innerHTML = `<input type="checkbox" id="m${player.id}">`;

    playerRow.appendChild(name);
    playerRow.appendChild(position);
    playerRow.appendChild(goals);
    playerRow.appendChild(assists);
    playerRow.appendChild(motm);
    addGameTable.appendChild(playerRow);

    const goalsInput = document.getElementById(`g${player.id}`);
    goalsInput.addEventListener('change', calculateTotalGoals);
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
            <br>
            <button class="close-remove-game" onclick="location.reload()">X</button>
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
    const removeGameButton = document.createElement('button');
    removeGameButton.classList.add('remove-game-button');
    removeGameButton.setAttribute('data-id', game.id);
    removeGameButton.textContent = 'Remove';
    remove.appendChild(removeGameButton);

    removeGameButton.addEventListener('click', function(e) {
        removeGameFromStorage(game.id);
    });

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
                    console.log(lineUp[k].common_name, player.common_name)
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
                            <!--<th>Position</th>-->
                            <th>Rating</th>
                            <th>Rarity</th>
                            <th>Nation</th>
                            <th>Club</th>
                            <th>Add</th>
                    </thead>
                    <tbody>
                    </tbody>
                </table>
            </div>
            <br>
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


    const searchInput = document.querySelector('.search-container input');
    searchInput.addEventListener('keydown', (e) => {
        if (e.keyCode === 13) {
            const input = document.querySelector('.search-container input');
            const filteredPlayers = search(allPlayers, input);
            console.log(filteredPlayers);
            addPlayerTable.innerHTML = '';
            for (let i = 0; i < 10; i++) {
                let player = filteredPlayers[i];
                console.log(player);
                const playerRow = document.createElement('tr');
                printAddPlayerRows(player, addPlayerTable, playerRow);
            }
        }
    });

    const searchButton = document.querySelector('.search-container button');
    searchButton.addEventListener('click', (e) => {
        const input = document.querySelector('.search-container input');
        const filteredPlayers = search(allPlayers, input);
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

function normalizeString(str) {
    const charMap = {
        "á": "a",
        "é": "e",
        "í": "i",
        "ó": "o",
        "ú": "u",
        "ü": "u",
        "ñ": "n",
        "ń": "n",
        "æ": "ae",
        "ø": "o",
        "ö": "o",
        "å": "a",
        // add more mappings as needed
    };

    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .split("")
        .map(char => charMap[char] || char)
        .join("");
}

function search(allPlayers, input) {
    const searchString = normalizeString(input.value.toLowerCase());
    const filteredPlayers = allPlayers.filter(player => {
        const playerName = normalizeString(player.common_name.toLowerCase());
        return playerName.includes(searchString);
    });
    console.log(filteredPlayers);
    return filteredPlayers;
}

function printAddPlayerRows(player, addPlayerTable, playerRow) {
    playerRow.innerHTML = `
                <td>${player.common_name}</td>
                <!--<td>${player.position}</td>-->
                <td>${player.rating}</td>
                <td>${player.rarityName}</td>
                <td>${player.nationName}</td>
                <td>${player.clubName}</td>
                <td><button class="add-player-button" id="${player.id}">Add</button></td>
            `
    addPlayerTable.appendChild(playerRow);

    const addPlayerButton = document.getElementById(`${player.id}`);

    addPlayerButton.addEventListener("click", function() {
        addPlayerToLineup(player);
    });
}

async function addPlayerToLineup(player) {
    if (!checkIfPlayerIsAlreadyInLineup(player)) {
        let lineUp = JSON.parse(localStorage.getItem('lineUp'));
        lineUp.push(player);
        localStorage.setItem('lineUp', JSON.stringify(lineUp));
        reloadAddPlayerOverlay(player);
    } else {
        alert("Player is already in lineup");
    }
}

function reloadAddPlayerOverlay(player) {
    showNotification(player.common_name + " added to lineup", "success")
    const addPlayerOverlay = document.querySelector('.add-player-overlay');
    addPlayerOverlay.remove();
    addPlayer();
}

function checkIfPlayerIsAlreadyInLineup(player) {
    console.log(player);
    let lineUp = JSON.parse(localStorage.getItem('lineUp'));
    for (let i = 0; i < lineUp.length; i++) {
        if (lineUp[i].common_name === player.common_name) {
            return true;
        }
    }
    return false;
}

function printRemovePlayerRows(player, removePlayerTable, playerRow) {
    playerRow.innerHTML = `
                <td>${player.common_name}</td>
                <!--<td>${player.position}</td>-->
                <td>${player.rating}</td>
                <td>${player.rarityName}</td>
                <td>${player.nationName}</td>
                <td>${player.clubName}</td>
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
    reloadRemovePlayerOverlay(player);
}

function reloadRemovePlayerOverlay(player) {
    showNotification(player.common_name + " removed from lineup", "success")
    const removePlayerOverlay = document.querySelector('.edit-lineup-overlay');
    removePlayerOverlay.remove();
    removePlayer();
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
                            <!--<th>Position</th>-->
                            <th>Rating</th>
                            <th>Rarity</th>
                            <th>Nation</th>
                            <th>Club</th>
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

function changeRankImg(gamesWon, gamesLost) {
    const rankImg = document.getElementById('rankImg');
    const winPoints = 4;
    const lossPoints = 1;
    const currentPoints = gamesWon * winPoints + gamesLost * lossPoints;
    const gamesPlayed = gamesWon + gamesLost;
    const gamesNeeded = 20;
    const gamesLeft = gamesNeeded - gamesPlayed;
    let predictedPoints = currentPoints + gamesLeft * lossPoints;
    console.log(predictedPoints);


    const currentRankText = document.getElementById('currentRankText');
    const remainingPointsNeededProgress = document.getElementById('remainingPointsNeededProgress');

    if (currentPoints >= 76) {
        remainingPointsNeededProgress.innerHTML = "76";
        currentRankText.innerHTML = "Rank I";
        rankImg.src = "./assets/rank1.webp";
    }
    else if (currentPoints >= 72) {
        remainingPointsNeededProgress.innerHTML = "76";
        currentRankText.innerHTML = "Rank II";
        rankImg.src = "./assets/rank2.webp";
    }
    else if (currentPoints >= 67) {
        remainingPointsNeededProgress.innerHTML = "72";
        currentRankText.innerHTML = "Rank III";
        rankImg.src = "./assets/rank3.webp";
    }
    else if (currentPoints >= 60) {
        remainingPointsNeededProgress.innerHTML = "67";
        currentRankText.innerHTML = "Rank IV";
        rankImg.src = "./assets/rank4.webp";
    }
    else if (currentPoints >= 51) {
        remainingPointsNeededProgress.innerHTML = "60";
        currentRankText.innerHTML = "Rank V";
        rankImg.src = "./assets/rank5.webp";
    }
    else if (currentPoints >= 45) {
        remainingPointsNeededProgress.innerHTML = "51";
        currentRankText.innerHTML = "Rank VI";
        rankImg.src = "./assets/rank6orlower.webp";
    }
    else if (currentPoints >= 36) {
        remainingPointsNeededProgress.innerHTML = "45";
        currentRankText.innerHTML = "Rank VII";
        rankImg.src = "./assets/rank6orlower.webp";
    }
    else if (currentPoints >= 24) {
        remainingPointsNeededProgress.innerHTML = "36";
        currentRankText.innerHTML = "Rank VIII";
        rankImg.src = "./assets/rank6orlower.webp";
    }
    else if (currentPoints >= 12) {
        remainingPointsNeededProgress.innerHTML = "24";
        currentRankText.innerHTML = "Rank IX";
        rankImg.src = "./assets/rank6orlower.webp";
    }
    else if (currentPoints >= 0) {
        remainingPointsNeededProgress.innerHTML = "12";
        currentRankText.innerHTML = "Rank X";
        rankImg.src = "./assets/rank6orlower.webp";
    }

    const currentPointsProgress = document.getElementById('currentPointsProgress');
    currentPointsProgress.innerHTML = currentPoints;

    const progressToNextRank = document.getElementById('remainingPointsNeededProgress').textContent;
    console.log(progressToNextRank);
    let percentage = (currentPoints / progressToNextRank) * 100;
    const progressBar = document.getElementById('progress-bar');
    progressBar.style.width = `${percentage}%`;



}

function resetWeekendLeague() {
    if (confirm("Are you sure you want to reset or end the weekend league?")) {
        let games = JSON.parse(localStorage.getItem('games'));
        for (let game of games) {
            removeGameFromStorage(game.id);
        }
        localStorage.setItem('games', JSON.stringify([]));

        let lineUp = JSON.parse(localStorage.getItem('lineUp'));
        for (let player of lineUp) {
            player.goals = 0;
            player.assists = 0;
            player.motm = 0;
            console.log(player.assists)
        }
        localStorage.setItem('lineUp', JSON.stringify(lineUp));

        location.reload();
    }
}

function endWeekendLeague() {
    const lineUp = JSON.parse(localStorage.getItem('lineUp'));
    let assists = 0;
    let motm = 0;
    for (let player of lineUp) {
        assists += player.assists;
        motm += player.motm;
    }
    const games = JSON.parse(localStorage.getItem('games'));
    let wins = 0;
    let losses = 0;
    for (let game of games) {
        if (game.won === true) {
            wins++;
        }
        else {
            losses++;
        }
    }

    let weekendLeague = {};
    weekendLeague.games = JSON.parse(localStorage.getItem('games'));
    weekendLeague.lineUp = JSON.parse(localStorage.getItem('lineUp'));
    weekendLeague.gamesPlayed = weekendLeague.games.length;
    weekendLeague.date = new Date().toLocaleDateString();
    weekendLeague.rank = document.getElementById('currentRankText').textContent;
    weekendLeague.points = document.getElementById('currentPointsProgress').textContent;
    weekendLeague.wins = wins;
    weekendLeague.losses = losses;
    weekendLeague.goals = document.querySelector('.goals').textContent;
    weekendLeague.conceded = document.querySelector('.conceded').textContent;
    weekendLeague.assists = assists;
    weekendLeague.motm = motm;
    weekendLeague.averageGoals = document.getElementById('averageScored').textContent;
    weekendLeague.averageConceded = document.getElementById('averageConceded').textContent;
    weekendLeague.bestResult = document.getElementById('bestResult').textContent;
    weekendLeague.id = Date.now();
    console.log(weekendLeague);
    let weekendLeagues = JSON.parse(localStorage.getItem('weekendLeagues'));
    if (weekendLeagues == null) {
        weekendLeagues = [];
    }
    weekendLeagues.push(weekendLeague);
    localStorage.setItem('weekendLeagues', JSON.stringify(weekendLeagues));
    resetWeekendLeague();
}

function printWeekendLeagues() {
    let weekendLeagues = JSON.parse(localStorage.getItem('weekendLeagues'));
    if (weekendLeagues == null) {
        weekendLeagues = [];
    }
    weekendLeagues.sort();
    console.log(weekendLeagues);
    const weekendLeaguesTable = document.querySelector('.weekend-leagues-table tbody');
    weekendLeaguesTable.innerHTML = ''; // Clear the table before adding rows
    for (let weekendLeague of weekendLeagues) {
        console.log(weekendLeague)
        printWeekendLeagueRows(weekendLeague, weekendLeaguesTable);
    }
}

function printWeekendLeagueRows(weekendLeague, weekendLeaguesTable) {
    const weekendLeagueRow = document.createElement('tr');
    weekendLeagueRow.innerHTML = `
        <td>${weekendLeague.date}</td>
        <td>${weekendLeague.rank}</td>
        <td>${weekendLeague.points}</td>
        <!--<td>${weekendLeague.gamesPlayed}</td>-->
        <td>${weekendLeague.wins}</td>
        <td>${weekendLeague.losses}</td>
        <td>${weekendLeague.goals}</td>
        <td>${weekendLeague.conceded}</td>
        <td>${weekendLeague.bestResult}</td>
        <!--<td>${weekendLeague.averageGoals}</td>
        <td>${weekendLeague.averageConceded}</td>-->
    `;
    weekendLeaguesTable.appendChild(weekendLeagueRow);
    console.log(weekendLeaguesTable);
}


function showAllTimeStats() {
    let weekendLeagues = JSON.parse(localStorage.getItem('weekendLeagues'));
    if (weekendLeagues == null) {
        weekendLeagues = [];
    }

    let topGoalScorers = [];
    let topAssistMakers = [];

    for (let weekendLeague of weekendLeagues) {
        weekendLeague.lineUp.sort((a, b) => b.goals - a.goals);
        console.log(weekendLeague.lineUp);
        for (let player of weekendLeague.lineUp) {
            console.log("player" + player.common_name);

            let topScorer = topGoalScorers.find((scorer) => scorer.id === player.id);

            if (!topScorer) {
                // This player is not in topGoalScorers. We add them.
                topGoalScorers.push({ id: player.id, first_name: player.first_name, last_name: player.last_name, common_name: player.common_name, goals: player.goals, rarityName: player.rarityName});
                console.log("new topscorer: " + player.common_name + " | goals: " + player.goals)
            } else {
                // This player is already in topGoalScorers. We add their goals to the top scorer's goals.
                console.log("goals to be added: " + player.goals);
                topScorer.goals += player.goals;
                console.log("top scorer: " + topScorer.common_name + " | total goals: " + topScorer.goals)
            }

            // similar changes for topAssistMakers
            let topAssistMaker = topAssistMakers.find((maker) => maker.id === player.id);

            if (!topAssistMaker) {
                // This player is not in topAssistMakers. We add them.
                topAssistMakers.push({ id: player.id, first_name: player.first_name, last_name: player.last_name, common_name: player.common_name, assists: player.assists, rarityName: player.rarityName});
            } else {
                // This player is already in topAssistMakers. We add their assists to the top assist maker's assists.
                topAssistMaker.assists += player.assists;
            }
        }
    }
    topGoalScorers.sort((a, b) => b.goals - a.goals);
    topAssistMakers.sort((a, b) => b.assists - a.assists);
    //localStorage.setItem('topGoalScorers', JSON.stringify(topGoalScorers));
    //localStorage.setItem('topAssistMakers', JSON.stringify(topAssistMakers));
    console.log(topGoalScorers);
    console.log(topAssistMakers);
    printTopGoalScorers(topGoalScorers);
    printTopAssistMakers(topAssistMakers);
    printBestWeekendLeague(weekendLeagues);
}

async function printTopGoalScorers(topGoalScorers) {
    for (let i = 0; i < 8; i++) {
        const name = document.querySelector(`#allTimeTopScorer${i + 1} .name`);
        const goals = document.querySelector(`#allTimeTopScorer${i + 1} .value`);
        const picture = document.querySelector(`#allTimeTopScorer${i + 1} img`);
        name.innerHTML = topGoalScorers[i].common_name;
        goals.innerHTML = topGoalScorers[i].goals;
        try {
            picture.src = await getPlayerPicture(topGoalScorers[i].id);
            picture.style.backgroundImage = `url(${setImageBackground(topGoalScorers[i])})`;
            picture.style.backgroundSize = '130% 130%';
            picture.style.backgroundPosition = 'center';
        }
        catch (e) {
            console.log(e);
        }
        if (picture.src === undefined) {
            picture.src = "https://1vs1-7f65.kxcdn.com/img/player-placeholder-full.svg"
        }
    }
}

async function printTopAssistMakers(topAssistMakers) {
    for (let i = 0; i < 8; i++) {
        if (topAssistMakers[i] === undefined) {
            break;
        }
        const name = document.querySelector(`#allTimeAssistMakers${i + 1} .name`);
        const assists = document.querySelector(`#allTimeAssistMakers${i + 1} .value`);
        const picture = document.querySelector(`#allTimeAssistMakers${i + 1} img`);
        name.innerHTML = topAssistMakers[i].common_name;
        assists.innerHTML = topAssistMakers[i].assists;
        try {
            picture.src = await getPlayerPicture(topAssistMakers[i].id);
            picture.style.backgroundImage = `url(${setImageBackground(topAssistMakers[i])})`;
            picture.style.backgroundSize = '130% 130%';
            picture.style.backgroundPosition = 'center';
        }
        catch (e) {
            console.log(e);
        }
        if (picture.src === undefined) {
            picture.src = "https://1vs1-7f65.kxcdn.com/img/player-placeholder-full.svg"
        }
    }
}

function printBestWeekendLeague(weekendLeagues) {
    weekendLeagues.sort((a, b) => b.points - a.points);
    console.log(weekendLeagues);
    const bestWeekendLeague = weekendLeagues[0];
    const bestRankText = document.querySelector('#bestRankText');
    bestRankText.innerHTML = bestWeekendLeague.rank;
    const winsBest = document.querySelector('.winsBest');
    winsBest.innerHTML = bestWeekendLeague.wins;
    const lossesBest = document.querySelector('.lossesBest');
    lossesBest.innerHTML = bestWeekendLeague.losses;
    const goalsBest = document.querySelector('.goalsBest');
    goalsBest.innerHTML = bestWeekendLeague.goals;
    const concededBest = document.querySelector('.concededBest');
    concededBest.innerHTML = bestWeekendLeague.conceded;
    const bestRankImg = document.querySelector('#bestRankImg');
    switch (bestWeekendLeague.rank) {
        case 'Rank I':
            bestRankImg.src = './assets/rank1.webp';
            break;
        case 'Rank II':
            bestRankImg.src = './assets/rank2.webp';
            break;
        case 'Rank III':
            bestRankImg.src = './assets/rank3.webp';
            break;
        case 'Rank IV':
            bestRankImg.src = './assets/rank4.webp';
            break;
        case 'Rank V':
            bestRankImg.src = './assets/rank5.webp';
            break;
        default:
            bestRankImg.src = './assets/rank6orlower.webp';
            break;
    }
}

async function getPlayerPicture(playerId) {
    let response = await fetch(`https://futdb.app/api/players/${playerId}/image`, {
        method: 'GET',
        headers: {
            'accept': 'image/png',
            'X-AUTH-TOKEN': '704f6962-4c8b-44b8-81bf-4c20640e51d1'
        }
    });

    if (!response.ok) {
        console.error(`Error fetching image for player ${playerId}: ${response.status} ${response.statusText}`);
        return null;
    }

    const imageBlob = await response.blob();
    //console.log('Received image blob:', imageBlob);

    const reader = new FileReader();

    return new Promise((resolve, reject) => {
        reader.onloadend = function () {
            const imageUrl = reader.result;
            //console.log('Generated image URL:', imageUrl);
            resolve(imageUrl);
        };

        reader.onerror = function (error) {
            console.error('Error occurred while reading the image:', error);
            reject(error);
        };

        reader.readAsDataURL(imageBlob);
    });
}

function showNotification(message) {
    var notification = document.getElementById('notification');
    notification.textContent = message;
    notification.style.display = 'block';

    setTimeout(function() {
        hideNotification();
    }, 3000); // Change the value to adjust the duration of the notification (in milliseconds)
}

function hideNotification() {
    var notification = document.getElementById('notification');
    notification.style.display = 'none';
}

function setImageBackground(player) {
    console.log(player.rarityName);
    switch (player.rarityName) {
        case 'Common':
            return 'https://game-assets.fut.gg/cdn-cgi/image/quality=80,format=auto,width=50/2023/rarities/0_e_3.png';
        case 'Rare':
            return 'https://game-assets.fut.gg/cdn-cgi/image/quality=80,format=auto,width=50/2023/rarities/1_e_3.png';
        case 'TOTW':
            return 'https://game-assets.fut.gg/cdn-cgi/image/quality=80,format=auto,width=50/2023/rarities/3_e_3.png';
        case 'Hero':
            return 'https://game-assets.fut.gg/cdn-cgi/image/quality=80,format=auto,width=50/2023/rarities/72_e_0.png';
        case 'TOTY':
            return 'https://game-assets.fut.gg/cdn-cgi/image/quality=80,format=auto,width=50/2023/rarities/5_e_0.png';
        case 'Record Breaker':
            return 'https://game-assets.fut.gg/cdn-cgi/image/quality=80,format=auto,width=50/2023/rarities/0_e_0.png';
        case 'MOTM':
            return 'https://game-assets.fut.gg/cdn-cgi/image/quality=80,format=auto,width=50/2023/rarities/8_e_0.png';
        case 'Professional Player card':
            return 'https://game-assets.fut.gg/cdn-cgi/image/quality=80,format=auto,width=50/2023/rarities/121_e_0.png';
        case 'TOTS':
            return 'https://game-assets.fut.gg/cdn-cgi/image/quality=80,format=auto,width=50/2023/rarities/11_e_0.png';
        case 'Icon':
            return 'https://game-assets.fut.gg/cdn-cgi/image/quality=80,format=auto,width=50/2023/rarities/12_e_0.png';
        case 'Ones To Watch':
            return 'https://game-assets.fut.gg/cdn-cgi/image/quality=80,format=auto,width=50/2023/rarities/21_e_0.png';
        case 'Rulebreakers':
            return 'https://game-assets.fut.gg/cdn-cgi/image/quality=80,format=auto,width=50/2023/rarities/22_e_0.png';
        case 'Squad Building Challenge':
            return 'https://game-assets.fut.gg/cdn-cgi/image/quality=80,format=auto,width=50/2023/rarities/22_e_0.png';
        case 'Squad Building Challenge Premium':
            return 'https://game-assets.fut.gg/cdn-cgi/image/quality=80,format=auto,width=50/2023/rarities/22_e_0.png';
        case 'FUT Birthday':
            return 'https://game-assets.fut.gg/cdn-cgi/image/quality=80,format=auto,width=50/2023/rarities/30_e_0.png';
        case 'POTM Bundesliga':
            return 'https://game-assets.fut.gg/cdn-cgi/image/quality=80,format=auto,width=50/2023/rarities/42_e_0.png';
        case 'POTM EPL':
            return 'https://game-assets.fut.gg/cdn-cgi/image/quality=80,format=auto,width=50/2023/rarities/43_e_0.png';
        case 'Europa League MOTM':
            return 'https://game-assets.fut.gg/cdn-cgi/image/quality=80,format=auto,width=50/2023/rarities/125_e_0.png';
        case 'UEL RTTF':
            return 'https://game-assets.fut.gg/cdn-cgi/image/quality=80,format=auto,width=50/2023/rarities/125_e_0.png';
        case 'CL MOTM SBC':
            return 'https://game-assets.fut.gg/cdn-cgi/image/quality=80,format=auto,width=50/2023/rarities/49_e_0.png';
        case 'Champions League RTTK':
            return 'https://game-assets.fut.gg/cdn-cgi/image/quality=80,format=auto,width=50/2023/rarities/50_e_0.png';
        case 'Flashback SBC':
            return 'https://game-assets.fut.gg/cdn-cgi/image/quality=80,format=auto,width=50/2023/rarities/51_e_0.png';
        case 'Sudamericana':
            return 'https://game-assets.fut.gg/cdn-cgi/image/quality=80,format=auto,width=50/2023/rarities/52_e_0.png';
        case 'Libertadores':
            return 'https://game-assets.fut.gg/cdn-cgi/image/quality=80,format=auto,width=50/2023/rarities/53_e_0.png';
        case 'Showdown Upgrade':
            return 'https://game-assets.fut.gg/cdn-cgi/image/quality=80,format=auto,width=50/2023/rarities/57_e_0.png';
        case 'Showdown':
            return 'https://game-assets.fut.gg/cdn-cgi/image/quality=80,format=auto,width=50/2023/rarities/58_e_0.png';
        case 'TOTY Honourable':
            return 'https://game-assets.fut.gg/cdn-cgi/image/quality=80,format=auto,width=50/2023/rarities/64_e_0.png';
        case 'MLS POTM':
            return 'https://game-assets.fut.gg/cdn-cgi/image/quality=80,format=auto,width=50/2023/rarities/67_e_0.png';
        case 'Europa League TOTGS':
            return 'https://game-assets.fut.gg/cdn-cgi/image/quality=80,format=auto,width=50/2023/rarities/46_e_0.png';
        case 'Champions League TOTGS':
            return 'https://game-assets.fut.gg/cdn-cgi/image/quality=80,format=auto,width=50/2023/rarities/50_e_0.png';
        case 'Future Stars':
            return 'https://game-assets.fut.gg/cdn-cgi/image/quality=80,format=auto,width=50/2023/rarities/71_e_0.png';
        case 'Heroes':
            return 'https://game-assets.fut.gg/cdn-cgi/image/quality=80,format=auto,width=50/2023/rarities/72_e_0.png';
        case 'POTM Ligue 1':
            return 'https://game-assets.fut.gg/cdn-cgi/image/quality=80,format=auto,width=50/2023/rarities/79_e_0.png';
        case 'ICON Moment':
            return 'https://game-assets.fut.gg/cdn-cgi/image/quality=80,format=auto,width=50/2023/rarities/12_e_0.png';
        case 'Trophy Titans':
            return 'https://game-assets.fut.gg/cdn-cgi/image/quality=80,format=auto,width=50/2023/rarities/85_e_0.png';
        case 'POTM La Liga':
            return 'src="https://game-assets.fut.gg/cdn-cgi/image/quality=80,format=auto,width=50/2023/rarities/86_e_0.png"';
        case 'Squad Foundation':
            return 'https://game-assets.fut.gg/cdn-cgi/image/quality=80,format=auto,width=50/2023/rarities/87_e_0.png';
        case 'Trophy Titans Icon':
            return 'https://game-assets.fut.gg/cdn-cgi/image/quality=80,format=auto,width=50/2023/rarities/88_e_0.png';
        case 'Player Moments SBC':
            return 'https://game-assets.fut.gg/cdn-cgi/image/quality=80,format=auto,width=50/2023/rarities/90_e_0.png';
        case 'Objective Reward - Storyline':
            return 'https://game-assets.fut.gg/cdn-cgi/image/quality=80,format=auto,width=50/2023/rarities/91_e_0.png';
        case 'Out Of Position':
            return 'https://game-assets.fut.gg/cdn-cgi/image/quality=80,format=auto,width=50/2023/rarities/97_e_0.png';
        case 'Europa Conf MOTM':
            return 'https://game-assets.fut.gg/cdn-cgi/image/quality=80,format=auto,width=50/2023/rarities/103_e_0.png';
        case 'Conference League TOTGS':
            return 'https://game-assets.fut.gg/cdn-cgi/image/quality=80,format=auto,width=50/2023/rarities/104_e_0.png';
        case 'Conference League RTTK':
            return 'https://game-assets.fut.gg/cdn-cgi/image/quality=80,format=auto,width=50/2023/rarities/105_e_0.png';
        case 'Eredivisie POTM SBC':
            return 'https://game-assets.fut.gg/cdn-cgi/image/quality=80,format=auto,width=50/2023/rarities/115_e_0.png';
        case 'Winter Wildcards':
            return 'https://game-assets.fut.gg/cdn-cgi/image/quality=80,format=auto,width=50/2023/rarities/118_e_0.png';
        case 'UCL RTTF':
            return 'https://game-assets.fut.gg/cdn-cgi/image/quality=80,format=auto,width=50/2023/rarities/124_e_0.png';
        case 'UECL RTTF':
            return 'https://game-assets.fut.gg/cdn-cgi/image/quality=80,format=auto,width=50/2023/rarities/126_e_0.png';
        case 'World Cup Icon':
            return 'https://game-assets.fut.gg/cdn-cgi/image/quality=80,format=auto,width=50/2023/rarities/129_e_0.png';
        case 'World Cup PTG':
            return 'https://game-assets.fut.gg/cdn-cgi/image/quality=80,format=auto,width=50/2023/rarities/130_e_0.png';
        case 'World Cup Star':
            return 'https://game-assets.fut.gg/cdn-cgi/image/quality=80,format=auto,width=50/2023/rarities/131_e_0.png';
        case 'World Cup Heroes':
            return 'https://game-assets.fut.gg/cdn-cgi/image/quality=80,format=auto,width=50/2023/rarities/9999_e_0.png';
        case 'Fantasy':
            return 'https://game-assets.fut.gg/cdn-cgi/image/quality=80,format=auto,width=50/2023/rarities/134_e_0.png';
        case 'Fantasy Hero':
            return 'https://game-assets.fut.gg/cdn-cgi/image/quality=80,format=auto,width=50/2023/rarities/135_e_0.png';
        case 'Fantasy Upgrade':
            return 'https://game-assets.fut.gg/cdn-cgi/image/quality=80,format=auto,width=50/2023/rarities/134_e_0.png';
        case 'World Cup TOTT':
            return 'https://game-assets.fut.gg/cdn-cgi/image/quality=80,format=auto,width=50/2023/rarities/138_e_0.png';
        case 'Road to World Cup':
            return 'https://game-assets.fut.gg/cdn-cgi/image/quality=80,format=auto,width=50/2023/rarities/139_e_0.png';
            default:
                return 'https://game-assets.fut.gg/cdn-cgi/image/quality=80,format=auto,width=50/2023/rarities/1_e_3.png';
    }
}

function changeFormation() {
    let formation = document.getElementById("formationSelect").value;
    let field = document.querySelector(".field");
    let lineUp = localStorage.getItem("lineUp");
    let lineUpObj = JSON.parse(lineUp);
    if (lineUpObj === null) {
        lineUpObj = {};
    }

    // Clear existing players
    field.innerHTML = "";

    // Add players based on the selected formation
    switch (formation) {
        case "4-4-2":
            field.innerHTML = `
            <div class="player" style="top: 80%; left: 50%;">
            <img src="https://game-assets.fut.gg/cdn-cgi/image/quality=80,format=auto,width=50/2023/rarities/1_e_3.png" alt="Player 1">
            <span class="player-name">${lineUpObj[0].common_name}</span>
        </div>
        <div class="player" style="top: 60%; left: 20%;">
            <img src="https://game-assets.fut.gg/cdn-cgi/image/quality=80,format=auto,width=50/2023/rarities/1_e_3.png" alt="Player 1">
            <span class="player-name">${lineUpObj[1].common_name}</span>
        </div>
        <div class="player" style="top: 60%; left: 40%;">
            <img src="https://game-assets.fut.gg/cdn-cgi/image/quality=80,format=auto,width=50/2023/rarities/1_e_3.png" alt="Player 1">
            <span class="player-name">${lineUpObj[2].common_name}</span>
        </div>
        <div class="player" style="top: 60%; left: 60%;">
            <img src="https://game-assets.fut.gg/cdn-cgi/image/quality=80,format=auto,width=50/2023/rarities/1_e_3.png" alt="Player 1">
            <span class="player-name">${lineUpObj[3].common_name}</span>
        </div>
        <div class="player" style="top: 60%; left: 80%;">
            <img src="https://game-assets.fut.gg/cdn-cgi/image/quality=80,format=auto,width=50/2023/rarities/1_e_3.png" alt="Player 1">
            <span class="player-name">${lineUpObj[4].common_name}</span>
        </div>
        <div class="player" style="top: 40%; left: 20%;">
            <img src="https://game-assets.fut.gg/cdn-cgi/image/quality=80,format=auto,width=50/2023/rarities/1_e_3.png" alt="Player 1">
            <span class="player-name">${lineUpObj[5].common_name}</span>
        </div>
        <div class="player" style="top: 40%; left: 40%;">
            <img src="https://game-assets.fut.gg/cdn-cgi/image/quality=80,format=auto,width=50/2023/rarities/1_e_3.png" alt="Player 1">
            <span class="player-name">${lineUpObj[6].common_name}</span>
        </div>
        <div class="player" style="top: 40%; left: 60%;">
            <img src="https://game-assets.fut.gg/cdn-cgi/image/quality=80,format=auto,width=50/2023/rarities/1_e_3.png" alt="Player 1">
            <span class="player-name">${lineUpObj[7].common_name}</span>
        </div>
        <div class="player" style="top: 40%; left: 80%;">
            <img src="https://game-assets.fut.gg/cdn-cgi/image/quality=80,format=auto,width=50/2023/rarities/1_e_3.png" alt="Player 1">
            <span class="player-name">${lineUpObj[8].common_name}</span>
        </div>
        <div class="player" style="top: 20%; left: 40%;">
            <img src="https://game-assets.fut.gg/cdn-cgi/image/quality=80,format=auto,width=50/2023/rarities/1_e_3.png" alt="Player 1">
            <span class="player-name">${lineUpObj[9].common_name}</span>
        </div>
        <div class="player" style="top: 20%; left: 60%;">
            <img src="https://game-assets.fut.gg/cdn-cgi/image/quality=80,format=auto,width=50/2023/rarities/1_e_3.png" alt="Player 1">
            <span class="player-name">${lineUpObj[10].common_name}</span>
        </div>
          `;
            break;

        case "4-1-2-1":
            field.innerHTML = `
            <div class="player" style="top: 40%; left: 10%;">1</div>
            <div class="player" style="top: 40%; left: 40%;">2</div>
            <div class="player" style="top: 40%; left: 70%;">3</div>
            <div class="player" style="top: 70%; left: 40%;">4</div>
            <div class="player" style="top: 90%; left: 40%;">5</div>
          `;
            break;

        case "4-3-3":
            field.innerHTML = `
            <div class="player" style="top: 40%; left: 10%;">1</div>
            <div class="player" style="top: 40%; left: 40%;">2</div>
            <div class="player" style="top: 40%; left: 70%;">3</div>
            <div class="player" style="top: 70%; left: 10%;">4</div>
            <div class="player" style="top: 70%; left: 40%;">5</div>
            <div class="player" style="top: 70%; left: 70%;">6</div>
            <div class="player" style="top: 90%; left: 40%;">7</div>
            <div class="player" style="top: 90%; left: 70%;">8</div>
            <div class="player" style="top: 90%; left: 10%;">9</div>
          `;
            break;

        // Add more cases for additional formations if needed

        default:
            field.innerHTML = "<p>Invalid formation.</p>";
            break;
    }
}

