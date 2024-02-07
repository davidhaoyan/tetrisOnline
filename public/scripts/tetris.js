const HEIGHT = 20;
const WIDTH = 10;
const QUEUESIZE = 5;
const LOBBYSIZE = 4;
var garbage = 0;

function createPlayfield() {
    var cells = document.createDocumentFragment();
    for (let j = 0; j < HEIGHT; j++) {
        var row = document.createElement("div");
        row.className = "row";
        cells.appendChild(row);
        for (let i = 0; i < WIDTH; i++) {
            var cell = document.createElement("div");
            cell.id = "r" + j + "c" + i;
            cell.className = "cell";
            row.appendChild(cell);
        }
        document.getElementById("tetris-playfield").appendChild(cells);
    }
}

function createOpponent() {
    var playfields = document.createDocumentFragment();
    for (let p = 0; p < LOBBYSIZE-1; p++) {
        var playfield = document.createElement("div");
        playfield.className = "opponent-playfield";
        playfield.id = "opponent-playfield" + p;
        playfields.appendChild(playfield);
        for (let j = 0; j < HEIGHT; j++) {
            var row = document.createElement("div");
            row.className = "row";
            playfield.appendChild(row);
            for (let i = 0; i < WIDTH; i++) {
                var cell = document.createElement("div");
                cell.id = `o${p}r${j}c${i}`;
                cell.className = "ocell";
                row.appendChild(cell);
            }
        }
        playfields.appendChild(playfield);
    }
    document.getElementById("opponent-container").appendChild(playfields);
}

function createQueue() {
    var cells = document.createDocumentFragment();
    for (let j = 0; j < HEIGHT; j++) {
        var row = document.createElement("div");
        row.className = "row";
        cells.appendChild(row);
        for (let i = 0; i < 4; i++) {
            var cell = document.createElement("div");
            cell.id = "qr" + j + "c" + i;
            cell.className = "qcell";
            row.appendChild(cell);
        }
        document.getElementById("tetris-side").appendChild(cells);
    }   
}

function createHold() {
    var cells = document.createDocumentFragment();
    for (let j = 0; j < 4; j++) {
        var row = document.createElement("div");
        row.className = "row";
        cells.appendChild(row);
        for (let i = 0; i < 4; i++) {
            var cell = document.createElement("div");
            cell.id = "hr" + j + "c" + i;
            cell.className = "qcell";
            row.appendChild(cell);
        }
        document.getElementById("tetris-hold").appendChild(cells);
    }
}

function wipeHold() {
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            activateCell(j, i, "", "h");
        }
    } 
}

function updateHold(shape) {
    wipeHold();
    let offsets = getOffsets(shape);
    for (let i = 0; i < 4; i++) {
        r = 2 + offsets[0][i][0];
        c = 2 + offsets[0][i][1];
        activateCell(r, c, `var(--${shape})`, "h");
    }
}

function updateOpponent(matrix, shape, index) {
    for (let j = 0; j < HEIGHT; j++) {
        for (let i = 1; i < WIDTH+1; i++) {
            if (matrix[j][i] == 0) {
                activateCell(j, i-1, "var(--cell-grey)", `o${index}`);
            }
            else if (matrix[j][i] == 1) {
                activateCell(j, i-1, `var(--${shape})`, `o${index}`);
            }
            else {
                activateCell(j, i-1, `var(--${String.fromCharCode(matrix[j][i])})`, `o${index}`); 
            }
        }
    }
}

function wipeQueue() {
    for (let j = 0; j < HEIGHT; j++) {
        for (let i = 0; i < 4; i++) {
            activateCell(j, i, "", "q");
        }
    }
}

// Queue parameter is an array of 5 tetrominos 
function updateQueue(queue) {
    wipeQueue();
    for (let q = 0; q < QUEUESIZE; q++) {
        shape = queue[q];
        let offsets = getOffsets(shape);
        for (let i = 0; i < 4; i++) {
            r = (q*4) + 2 + offsets[0][i][0];
            c = 2 + offsets[0][i][1];
            activateCell(r, c, `var(--${shape})`, "q")
        }
    }
}

function activateCell(row, col, colour, type) {
    $(`#${type}r${row}c${col}`).css("background-color", colour);
}

// Matrix has a border of 2 cells on left, right and bottom border. Top border is 0.
function wipeCells(matrix) {
    let newMatrix = new Array(HEIGHT+3);

    // New matrix wipes the existing 1s but keeps the 2s (dead cells/border)
    for (var j = 0; j < HEIGHT+3; j++) {
        newMatrix[j] = new Array(WIDTH+2).fill(0);
        for (var i = 0; i < WIDTH+2; i++) {
            if (matrix[j][i] > 1) {
                newMatrix[j][i] = matrix[j][i];    
            }
        }
    }
    return newMatrix;
}

function getOffsets(shape) {
    let offsets;
    switch (shape) {
        case "I":
            offsets = [[[-2, 0], [-1, 0], [0, 0], [1, 0]],
                        [[0, -2], [0, -1], [0, 0], [0, 1]],
                        [[-2, -1], [-1, -1], [0, -1], [1, -1]],
                        [[-1, -2], [-1, -1], [-1, 0], [-1, 1]]];
            break;
        case "O":
            offsets = [[[0, 0], [0, -1], [-1, -1], [-1, 0]],
                        [[0, 0], [0, -1], [-1, -1], [-1, 0]],
                        [[0, 0], [0, -1], [-1, -1], [-1, 0]],
                        [[0, 0], [0, -1], [-1, -1], [-1, 0]]];
            break;
        case "T":
            offsets = [[[0, 0], [0, -1], [0, 1], [-1, 0]],
                        [[0, 0], [-1, 0], [1, 0], [0, 1]],
                        [[0, 0], [0, -1], [0, 1], [1, 0]],
                        [[0, 0], [-1, 0], [1, 0], [0, -1]]];
            break;
        case "S":
            offsets = [[[0, 0], [-1, 0], [-1, 1], [0, -1]],
                        [[0, 0], [-1, 0], [0, 1], [1, 1]],
                        [[0, 0], [0, 1], [1, 0], [1, -1]],
                        [[0, 0], [1, 0], [0, -1], [-1, -1]]];
            break;
        case "Z":
            offsets = [[[-1, 0], [-1, -1], [0, 0], [0, 1]],
                        [[0, 0], [1, 0], [0, 1], [-1, 1]],
                        [[0, 0], [0, -1], [1, 0], [1, 1]],
                        [[0, 0], [-1, 0], [0, -1], [1, -1]]];
            break;
        case "J":
            offsets = [[[0, 0], [0, 1], [0, -1], [-1, -1]],
                        [[0, 0], [1, 0], [-1, 0], [-1, 1]],
                        [[0, 0], [0, -1], [0, 1], [1, 1]],
                        [[0, 0], [-1, 0], [1, 0], [1, -1]]];
            break;
        case "L":
            offsets = [[[0, 0], [0, 1], [0, -1], [-1, 1]],
                        [[0, 0], [1, 0], [-1, 0], [1, 1]],
                        [[0, 0], [0, -1], [0, 1], [1, -1]],
                        [[0, 0], [-1, 0], [1, 0], [-1, -1]]];
            break;        
    }
    return offsets;
}

// Returns points as the indices the are on the matrix
function findPoints(shape, rotation, row, col) {
    let points = [];
    let offsets = getOffsets(shape);
    if (offsets == undefined) {
        return points;
    }
    for (var i = 0; i < 4; i++) {
        r = row+offsets[rotation][i][0]+2;
        c = col+offsets[rotation][i][1]+1; // Matrix offset
        points.push([r,c]);
    }
    return points;
}

// Wipes matrix and updates current tetromino on to matrix
function updateTetromino(matrix, shape, rotation, row, col) {
    matrix = wipeCells(matrix);
    let points = findPoints(shape, rotation, row, col);
    for (var i = 0; i < points.length; i++) {
        let r = points[i][0];
        let c = points[i][1];
        if (r >= 0 && r <= HEIGHT+2 && c >= 0 && c <= WIDTH+1) {
            matrix[r][c] = 1;
        }
    }
    return {matrix, points};
}

function createBag() {
    let pool = ["I", "O", "T", "S", "Z", "J", "L"];
    // Fisher-Yates shuffle algorithm
    for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool;
}

// Draws matrix onto display
function drawMatrix(matrix, shape, rotation, row, col) {
    let points;
    ({ matrix, points } = updateTetromino(matrix, shape, rotation, row, col));
    for (j = 2; j < HEIGHT+3; j++) {
        for (i = 1; i < WIDTH+1; i++) {
            $(`#r${j-2}c${i-1}`).css("opacity", "1");
            if (matrix[j][i] == 1) {
                activateCell(j-2, i-1, `var(--${shape})`, "");
            }
            else if (matrix[j][i] == 0) {
                activateCell(j-2, i-1, "var(--cell-grey)", "");
            }
            else {
                activateCell(j-2, i-1, `var(--${String.fromCharCode(matrix[j][i])})`, ""); 
            }
        }
    }
    updateGhost(matrix, points, shape);
    return {matrix, points};
}

function checkValidXY(direction, matrix, points) {
    if (points == undefined) {
        return false;
    }
    switch (direction) {
        case ("right"):
            offset = [0, 1]
            break;
        case ("left"):
            offset = [0, -1]
            break;
        case ("down"):
            offset = [1, 0]
            break;
        case ("up"):
            offset = [-1, 0];
            break;
    }
    for (let i = 0; i < points.length; i++) {
        let r = points[i][0];
        let c = points[i][1];
        if ((r >= 0) && (r <= HEIGHT+2) && (c >= 0) && (c <= WIDTH+1) && (matrix[r+offset[0]][c+offset[1]] > 1)) {
            return false;
        }
    }
    return true;
}

// Returns adjustments = [+row, +col]. If [0, 0], then it is okay to rotate. If [-1, -1], disable rotation.
function checkValidRotation(direction, matrix, row, col, shape, rotation) {
    switch (direction) {
        case ("clockwise"):
            rotation = (rotation + 1) % 4;
            break;
        case ("anticlockwise"):
            rotation = (rotation - 1) % 4;
            if (rotation < 0) {
                rotation += 4;
            }
            break;
    }
    let points = findPoints(shape, rotation, row, col);
    for (let i = 0; i < points.length; i++) {
        let r = points[i][0];
        let c = points[i][1];
        if (r >= 0 && r <= HEIGHT+2 && c >= 0 && c <= WIDTH+1 && matrix[r][c] > 1) {
            if (checkValidXY("right", matrix, points)) { 
                return [0, 1];
            }
            if (checkValidXY("left", matrix, points)) {
                return [0, -1];
            }
            if (checkValidXY("up", matrix, points)) {
                return [-1, 0];
            }
            return [-1, -1];      
        }
    }
    return [0, 0];
}

function initializeMatrix() {
    let matrix = new Array(HEIGHT+3)
    for (var j = 0; j < HEIGHT+3; j++) {
        if (j == HEIGHT+2) {
            matrix[j] = new Array(WIDTH+2).fill(2);
        } else {
            row = new Array(WIDTH+2).fill(0);
            row[0] = 2;
            row[WIDTH+1] = 2;
            matrix[j] = row;
        }
    } 
    console.log("init", matrix);
    return matrix;

}

function killCells(matrix, points, shape) {
    console.log(points);    
    if (points == undefined || shape == undefined) {
        return matrix;
    }
    for (var i = 0; i < points.length; i++) {
        r = points[i][0];
        c = points[i][1];
        matrix[r][c] = shape.charCodeAt(0);
    }
    return matrix;

}

function updateGhost(matrix, points, shape) {
    while (checkValidXY("down", matrix, points)) {
        points = points.map((point) => [point[0]+1, point[1]]);
    }
    for (var i = 0; i < points.length; i++) {
        let r = points[i][0];
        let c = points[i][1];
        activateCell(r-2, c-1, `var(--${shape}`, "");
        $(`#r${r-2}c${c-1}`).css("opacity", "0.5");
    }
} 

function nextTetromino(matrix, points, shape, bag) {
    matrix = killCells(matrix, points, shape);
    matrix = checkTetris(matrix);
    shape = bag.shift();
    if (bag.length <= QUEUESIZE) {
        newBag = createBag();
        for (let b = 0; b < newBag.length; b++) {
            bag.push(newBag[b]);
        }
    }
    rotation = 0;
    row = 0;
    col = 5;
    updateQueue(bag.slice(0, QUEUESIZE));
    let holdValid = true;
    return { matrix, shape, rotation, row, col, bag, holdValid }
}

function holdTetromino(shape, hold, bag) {
    if (hold == undefined) {
        hold = shape;
        shape = bag.shift();
        updateQueue(bag.slice(0, QUEUESIZE));
    }
    else {
        temp = hold;
        hold = shape;
        shape = temp;
    }
    updateHold(hold)
    let holdValid = false
    return { shape, hold, holdValid }

}

function checkTetris(matrix) {
    clearRows = new Array()
    let garbageLines = 0;
    outerloop: for (let j = 0; j < HEIGHT+2; j++) {
        for (let i = 1; i < WIDTH+1; i++) {
            if (matrix[j][i] == 0) {
                continue outerloop;
            }
        }
        if (matrix[j][1] == 'G'.charCodeAt(0) || matrix[j][WIDTH] == 'G'.charCodeAt(0)) {
            garbageLines++;
        }
        clearRows.push(j)
    }

    for (let r = 0; r < clearRows.length; r++) {
        row = clearRows[r]
        if (row >= 0 && row <= HEIGHT+1) {
            for (let j = row; j > 0; j--) {
                for (let i = 1; i < WIDTH+1; i++) {
                    matrix[j][i] = matrix[j-1][i]
                }
            }
            matrix[0] = new Array(WIDTH+2).fill(0);
            matrix[0][0] = 2;
            matrix[0][WIDTH+1] = 2;
        }
    }
    let linesCleared = clearRows.length - garbageLines;
    if (linesCleared > 1) {
        if (linesCleared == 4) {
            sendGarbage(4);
        } else {
            sendGarbage(linesCleared-1);
        }
    }
    return matrix;
}

function updateTick(tick, tickInterval, maxSpeed) {
    return Math.max(tick - tickInterval, maxSpeed);
}

function sendGarbage(lines) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "garbage", payload: lines }));
    }
}

function spawnGarbage(lines, matrix) {
    let c = Math.floor(Math.random() * WIDTH) + 1;
    for (let l = 0; l < lines; l++) {
        for (let j = 0; j < HEIGHT; j++) {
            if (j == HEIGHT-1) {
                matrix[j] = new Array(WIDTH+2).fill("G".charCodeAt(0));
                matrix[j][c] = 0;
                matrix[j][0] = 2;
                matrix[j][WIDTH+1] = 2;
            } else {
                for (let i = 1; i < WIDTH+1; i++) {
                    matrix[j][i] = matrix[j+1][i];
                }
            }
        }
    }
    return matrix;
}

function sendMatrix(matrix, shape) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify( { type: "matrix", payload: {matrix: matrix, shape: shape} }));
    }
}

function gameLoop() {
    let bag = createBag();
    let row = 0;
    let col = 5;
    let tick = 2000;
    let tickInterval = 50;
    let maxSpeed = 500;
    let rotation = 0;
    let points;
    let shape;
    let hold;
    let holdValid = true;
    let matrix = initializeMatrix();
    document.addEventListener("keydown", (e) => {
        if (e.key == 'c') {
            e.preventDefault();
            let adjustments = checkValidRotation("clockwise", matrix, row, col, shape, rotation);
            while (!(adjustments[0] == 0 && adjustments[1] == 0)) {
                if (adjustments[0] == -1 && adjustments[1] == -1) {
                    break;
                }
                row += adjustments[0];
                col += adjustments[1];
                adjustments = checkValidRotation("clockwise", matrix, row, col, shape, rotation);
            }
            if (adjustments[0] == 0 && adjustments[1] == 0) {   
                rotation = (rotation + 1) % 4;
            }
        }
        if (e.key == 'x') {
            e.preventDefault();
            let adjustments = checkValidRotation("anticlockwise", matrix, row, col, shape, rotation);
            while (!(adjustments[0] == 0 && adjustments[1] == 0)) {
                if (adjustments[0] == -1 && adjustments[1] == -1) {
                    break;
                }
                row += adjustments[0];
                col += adjustments[1];
                adjustments = checkValidRotation("anticlockwise", matrix, row, col, shape, rotation);
            }
            if (adjustments[0] == 0 && adjustments[1] == 0) {   
                rotation = (rotation - 1) % 4;
                if (rotation < 0) {
                    rotation += 4;
                }
            }
        }
        if (e.key == ' ') {
            e.preventDefault();
            while (checkValidXY("down", matrix, points)) {
                row++;
                ({ matrix, points } = drawMatrix(matrix, shape, rotation, row, col));
            }
            ({ matrix, shape, rotation, row, col, bag, holdValid } = nextTetromino(matrix, points, shape, bag));
            tick = updateTick(tick, tickInterval, maxSpeed);
        }
        if (e.ctrlKey) {
            e.preventDefault();
            if (holdValid) {
                ({ shape, hold, holdValid } = holdTetromino(shape, hold, bag));
                row = 0;
                col = 5;
                rotation = 0;
            }
        }
        if ((e.key == 'ArrowLeft')) {
            e.preventDefault();
            if (checkValidXY("left", matrix, points)) {
                col--;
            }
        }
        if ((e.key == 'ArrowRight')) {
            e.preventDefault();
            if (checkValidXY("right", matrix, points)) {
                col++;
            }
        }
        if (e.key == 'ArrowDown') {
            e.preventDefault();
            if (checkValidXY("down", matrix, points)) {
                row++;
            }
        }
        matrix = wipeCells(matrix);
        ({ matrix, points } = drawMatrix(matrix, shape, rotation, row, col));
        sendMatrix(matrix, shape);
    });
    for (let j = 0; j < HEIGHT; j++) {
        for (let i = 1; i < WIDTH+1; i++) {
            activateCell(j, i-1, "var(--cell-grey)", ""); 
        }
    }
    ({ matrix, shape, rotation, row, col, bag, holdValid } = nextTetromino(matrix, points, shape, bag));
    var loop = function () {
        console.log(matrix);
        ({ matrix, points } = drawMatrix(matrix, shape, rotation, row, col));
        if (garbage > 0) {
            spawnGarbage(garbage, matrix);
            garbage = 0
        }
        sendMatrix(matrix, shape);
        if (checkValidXY("down", matrix, points)) {
            row++;
        }
        else {
            ({ matrix, shape, rotation, row, col, bag, holdValid } = nextTetromino(matrix, points, shape, bag));
            tick = updateTick(tick, tickInterval, maxSpeed);
        }
        loopTimeout = setTimeout(loop, tick);
    };
    let loopTimeout = setTimeout(loop, tick);
}

createPlayfield();
createOpponent();
createQueue();
createHold();
wipeQueue();
gameLoop();

// TODO:
// - Score
// - Game Over