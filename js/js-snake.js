/**
 * JS-Snake
 * Adam Shannon
 */

var score_board = document.querySelector("#scoreboard");
var canvas = document.querySelector("#arena");
var arena = canvas.getContext("2d");

var min_x = 1;
var max_x = 295;
var min_y = 1;
var max_y = 145;

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
    draw_snake(prev_snake_x + dx, prev_snake_y + dy, snake_width, snake_height, black);
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


/**
   TODO:
   - Timed games
   - Leaderboard
   - Multiple Targets
   - Multiplayer

   BUGS:
   - When a target is cleared, it seems to wipe out a larger rectangle than it should.
   - Snake doesn't have collisions with itself.
   - Snake should show a full path?
     - Stored as a capped array whose cap increases at each item you pick up?
     - Has to check for collisions with all items in the array on each move. (Costly?)
**/
window.onload = function (e) {
    draw_initial_snake();
    draw_random_target();
    start_collision_checks();
}

window.onkeydown = function (e) {
    var key = get_key(e);
    if (key == left) {
        move_snake(-snake_dx, 0);
    } else if (key == up) {
        move_snake(0, -snake_dy);
    } else if (key == down) {
        move_snake(0, snake_dy);
    } else if (key == right) {
        move_snake(snake_dx, 0);
    }
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
