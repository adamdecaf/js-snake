/**
 * JS-Snake
 * Adam Shannon
 */

/**
   TODO:
   - Start button for games [x]
   - Timed games [x]
   - Leaderboard [x]
   - Multiple Targets
     -- target that is moved far away from you for 2x points.
     -- target that gives you more time.
   - Multiplayer
   - Show all targets when game is over?

   BUGS:
   - You can go off the edge..
   - When a target is cleared, it seems to wipe out a larger rectangle than it should.
   - Snake doesn't have collisions with itself.
   - Snake should show a full path?
     - Stored as a capped array whose cap increases at each item you pick up?
     - Has to check for collisions with all items in the array on each move. (Costly?)
   - Canvas isn't cleared between games.
**/

var leaderboard = document.querySelector("#leaderboard");
var score_board = document.querySelector("#scoreboard");
var timer_elm = document.querySelector("#timer");
var canvas = document.querySelector("#arena");
var arena = canvas.getContext("2d");

var min_x = 1;
var max_x = 297;
var min_y = 1;
var max_y = 147;

var left = 37;
var up = 38;
var right = 39;
var down = 40;

var snake_dx = 2;
var snake_dy = 2;

var snake_width = 3;
var snake_height = 3;

var target_width = 3;
var target_height = 3;

var moves_made = 0;

var game_length = 10;
var game_length_ms = game_length * 1000;

var black = "rgb(0, 0, 0)";
var red = "rgb(200, 0, 0)";
var blue = "rgb(0, 0, 200)";

function random_int(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function random_xy() {
    return {
        x: random_int(min_x, max_x),
        y: random_int(min_y, max_y)
    }
}

var curr_target_x = 0;
var curr_target_y = 0;

function draw_target(x, y, color) {
    clear_last_target();
    arena.fillStyle = color;
    arena.fillRect(x, y, target_width, target_height);

    curr_target_x = x;
    curr_target_y = y;
}

function draw_random_target() {
    var p = random_xy()
    draw_target(p.x, p.y, red);
}

function clear_last_target() {
    arena.clearRect(curr_target_x, curr_target_y, target_width, target_height)
}

var prev_snake_x = 0;
var prev_snake_y = 0;

function draw_snake(x, y, width, height, color) {
    clear_last_snake();
    arena.fillStyle = color;
    arena.fillRect(x, y, width, height);

    prev_snake_x = x;
    prev_snake_y = y;
}

function clear_last_snake() {
    arena.clearRect(prev_snake_x, prev_snake_y, snake_width, snake_height);
}

function move_snake(dx, dy) {
    var proposedX = prev_snake_x + dx;
    var proposedY = prev_snake_y + dy;

    if (!touching_edge_of_arena(proposedX, proposedY)) {
        draw_snake(proposedX, proposedY, snake_width, snake_height, black);
    }
}

function touching_edge_of_arena(proposedX, proposedY) {
    return (proposedX <= 0) || (proposedY <= 0) || (proposedX >= max_x) || (proposedY >= max_y);
}

function draw_initial_snake() {
    var p = random_xy();
    draw_snake(p.x, p.y, snake_width, snake_height, black);
}

function get_key(e) {
    return e.keyCode;
}

/**
   Take two squares and see if they overlap.

     x
     -----------------------------------------
   y |   ____           How To:
     |  |  __|__        - Find top left x1 and x1+dx1, if x1 <= x2 <= x1+dx1  _and_
     |  | |__|  |       - Find top left y1 and y1+dy1, if y1 <= y2 <= y2dy2   -> overlap
     |  |_|__|  |
     |    |_____|
**/
function check_for_overlap(target1, target2) {
    var x1 = target1.x
    var dx1 = target1.width
    var x2 = target2.x

    var y1 = target1.y
    var dy1 = target1.height
    var y2 = target2.y

    // When the targets contain each other..
    return ( (Math.abs(x1 - x2) < dx1) && (Math.abs(y1 - y2) < dy1) && (Math.abs(x2 - x1) < dx1) && (Math.abs(y2 - y1) < dy1) );
}


window.onkeydown = function (e) {
    var key = get_key(e);
    if (key == left) {
        move_snake(-snake_dx, 0);
        increment_moves()
        return false;
    } else if (key == up) {
        move_snake(0, -snake_dy);
        increment_moves()
        return false;
    } else if (key == down) {
        move_snake(0, snake_dy);
        increment_moves()
        return false;
    } else if (key == right) {
        move_snake(snake_dx, 0);
        increment_moves()
        return false;
    }
}

function increment_moves() {
    moves_made += 1;
}

function start_collision_checks() {
    window.setInterval(function () {
        var snake_coords = {x: prev_snake_x, y: prev_snake_y, width: snake_width, height: snake_height}
        var target_coords = {x: curr_target_x, y: curr_target_y, width: target_width, height: target_height}
        var has_collision = check_for_overlap(snake_coords, target_coords)

        if (has_collision) {
            score_board.innerHTML = parseInt(score_board.innerHTML) + 1;
            draw_random_target();
        }
    }, 50)
}

function start_game() {
    score_board.innerHTML = 0;
    moves_made = 0;

    clearTimeout(game_end_timer);
    clearInterval(timer);

    timer_elm.innerHTML = game_length;

    draw_initial_snake();
    draw_random_target();
    start_collision_checks();

    start_timer();
}

function end_game() {
    timer_elm.innerHTML = 0;
    var name = prompt("Game over! Your score is: " + score_board.innerHTML + "\nWhat's your name?");
    var score = score_board.innerHTML;
    var grid_spots_moved = moves_made;
    var targets_hit = score;
    var game_duration = game_length;

    var params = "?score=" + score + "&name=" + encodeURIComponent(name) + "&grid_spots_moved=" + grid_spots_moved +
                 "&targets_hit=" + targets_hit + "&game_duration=" + game_duration;

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "leaderboard.php" + params, true);
    xhr.send(null);

    setTimeout(function () {
        leaderboard.src = leaderboard.src;
    }, 500);
}

var game_end_timer;
var seconds_tick;

function start_timer() {
    game_end_timer = setTimeout(function () {
        end_game();
        window.clearInterval(timer);
    }, game_length_ms);

    timer = setInterval(function (){
        timer_elm.innerHTML -= 1;
    }, 1000);
}
