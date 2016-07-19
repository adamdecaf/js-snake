/**
 * JS-Snake
 * Adam Shannon
 */

/**
   TODO:
   - Start button for games [x]
   - Timed games [x]
   - Multiple Targets [x]
   - Multiplayer
   - Report back the game state every second
     - To record how players move and respond to special targets

   BUGS:
   - You can go off the edge.. [x]
   - When a target is cleared, it seems to wipe out a larger rectangle than it should.
   - Snake doesn't have collisions with itself.
   - Snake should show a full path?
     - Stored as a capped array whose cap increases at each item you pick up?
     - Has to check for collisions with all items in the array on each move. (Costly?)
   - Canvas isn't cleared between games.
**/

var special_tokens = document.querySelector("#special_tokens");
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

var snake_dx = 3;
var snake_dy = 3;

var snake_width = 3;
var snake_height = 3;

var target_width = 3;
var target_height = 3;

var moves_made = 0;

var game_length = 60;
var game_length_ms = game_length * 1000;

var black  = "rgb(0, 0, 0)";
var red    = "rgb(200, 0, 0)";
var yellow = "rgb(223, 255, 0)";
var blue   = "rgb(0, 0, 200)";
var green  = "rgb(0, 200, 0)";
var orange = "rgb(200, 100, 0)";
var purple = "rgb(100, 0, 100)";
var pink   = "rgb(255, 0, 255)";
var gray   = "rgb(100, 100, 100)";

/**
 * Scores
 * Red:    Constant       - 1pt     1/1   games
 * Yellow  1 - 30sec      - 1pt     1/1   games
 * Blue:   1 - 120sec     - 2pt     1/2   games
 * Green:  1 - 300sec     - 3pt     1/5   games
 * Orange: 1 - 500sec     - 4pt     1/9   games
 * Purple: 1 - 1000sec    - 5pt     1/18  games
 * Pink:   1 - 10000sec   - 10pt    1/180 games
 * Gray:   1 - 1000000sec - 1000pts 1/180,000   (Giant box)
 */

var red_score    = 1;
var yellow_score = 1;
var blue_score   = 2;
var green_score  = 3;
var orange_score = 4;
var purple_score = 5;
var pink_score   = 10;
var gray_score   = 1000;

var millis = 1000;
var max_target_lifetime = 6 * millis;

var min_lifetime_yellow = 1;
var max_lifetime_yellow = 20;

var min_lifetime_blue = 1;
var max_lifetime_blue = 120;

var min_lifetime_green = 1;
var max_lifetime_green = 300;

var min_lifetime_orange = 1;
var max_lifetime_orange = 500;

var min_lifetime_purple = 1;
var max_lifetime_purple = 1000;

var min_lifetime_pink = 1;
var max_lifetime_pink = 10000;

var min_lifetime_gray = 1;
var max_lifetime_gray = 1000000;

var yellow_timer;
var blue_timer;
var green_timer;
var orange_timer;
var purple_timer;
var pink_timer;
var gray_timer;

// Common, helper methods
function random_int(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function random_xy() {
    return {
        x: random_int(min_x, max_x),
        y: random_int(min_y, max_y)
    }
}

function get_key(e) {
    return e.keyCode;
}


// Global, utility methods
function increment_moves() {
    moves_made += 1;
}

// Snake Locations
var curr_snake_x = 0;
var curr_snake_y = 0;

// Target Locations
var curr_red_target_x = 0;
var curr_red_target_y = 0;

var curr_yellow_target_x = 0;
var curr_yellow_target_y = 0;

var curr_blue_target_x = 0;
var curr_blue_target_y = 0;

var curr_green_target_x = 0;
var curr_green_target_y = 0;

var curr_orange_target_x = 0;
var curr_orange_target_y = 0;

var curr_purple_target_x = 0;
var curr_purple_target_y = 0;

var curr_pink_target_x = 0;
var curr_pink_target_y = 0;

var curr_gray_target_x = 0;
var curr_gray_target_y = 0;

function clear_arena() {
    arena.clearRect(0, 0, max_x + 10, max_y + 10)
}

function update_color_xy(x, y, color) {
    if (color == red) {
        curr_red_target_x = x;
        curr_red_target_y = y;
    }

    if (color == yellow) {
        curr_yellow_target_x = x;
        curr_yellow_target_y = y;
    }

    if (color == blue) {
        curr_blue_target_x = x;
        curr_blue_target_y = y;
    }

    if (color == green) {
        curr_green_target_x = x;
        curr_green_target_y = y;
    }

    if (color == orange) {
        curr_orange_target_x = x;
        curr_orange_target_y = y;
    }

    if (color == purple) {
        curr_purple_target_x = x;
        curr_purple_target_y = y;
    }

    if (color == pink) {
        curr_pink_target_x = x;
        curr_pink_target_y = y;
    }

    if (color == gray) {
        curr_gray_target_x = x;
        curr_gray_target_y = y;
    }
}

function clear_target_by_color(color) {
    update_color_xy(-100, -100, color);

    if (color == red)    clear_target(curr_red_target_x, curr_red_target_y);
    if (color == yellow) clear_target(curr_yellow_target_x, curr_yellow_target_y);
    if (color == blue)   clear_target(curr_blue_target_x, curr_blue_target_y);
    if (color == green)  clear_target(curr_green_target_x, curr_green_target_y);
    if (color == orange) clear_target(curr_orange_target_x, curr_orange_target_y);
    if (color == purple) clear_target(curr_purple_target_x, curr_purple_target_y);
    if (color == pink)   clear_target(curr_pink_target_x, curr_pink_target_y);
    if (color == gray)   clear_target(curr_gray_target_x, curr_gray_target_y);
}

function clear_target(x, y) {
    arena.clearRect(x, y, target_width, target_height);
    update_color_xy(-100, -100);
}

function clear_red_target() {
    clear_target(curr_red_target_x, curr_red_target_y);
}

function start_countdown_to_clear(color) {
    if (color == blue) {
        setTimeout(function(x, y) {
            clear_target(x, y);
        }, max_target_lifetime, curr_blue_target_x, curr_blue_target_y);
    }

    if (color == yellow) {
        setInterval(function(x, y) {
            clear_target(x, y);
        }, max_target_lifetime, curr_yellow_target_x, curr_yellow_target_y);
    }

    if (color == green) {
        setTimeout(function(x, y) {
            clear_target(x, y);
        }, max_target_lifetime, curr_green_target_x, curr_green_target_y);
    }

    if (color == orange) {
        setTimeout(function(x, y) {
            clear_target(x, y);
        }, max_target_lifetime, curr_orange_target_x, curr_orange_target_y);
    }

    if (color == purple) {
        setTimeout(function(x, y) {
            clear_target(x, y);
        }, max_target_lifetime, curr_purple_target_x, curr_purple_target_y);
    }

    if (color == pink) {
        setTimeout(function(x, y) {
            clear_target(x, y);
        }, max_target_lifetime, curr_pink_target_x, curr_pink_target_y);
    }

    if (color == gray) {
        setTimeout(function(x, y) {
            clear_target(x, y);
        }, max_target_lifetime, curr_gray_target_x, curr_gray_target_y);
    }
}

function draw_target(x, y, color) {
    update_color_xy(x, y, color);
    start_countdown_to_clear(color);

    arena.fillStyle = color;
    arena.fillRect(x, y, target_width, target_height);
}

function draw_red_target() {
    var p = random_xy();
    draw_target(p.x, p.y, red);
}

function draw_snake(x, y, width, height, color) {
    clear_last_snake();
    arena.fillStyle = color;
    arena.fillRect(x, y, width, height);

    curr_snake_x = x;
    curr_snake_y = y;
}

function clear_last_snake() {
    arena.clearRect(curr_snake_x, curr_snake_y, snake_width, snake_height);
}

function draw_initial_snake() {
    var p = random_xy();
    draw_snake(p.x, p.y, snake_width, snake_height, black);
}

// Movement
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

function move_snake(dx, dy) {
    var proposedX = curr_snake_x + dx;
    var proposedY = curr_snake_y + dy;

    if (!touching_edge_of_arena(proposedX, proposedY)) {
        draw_snake(proposedX, proposedY, snake_width, snake_height, black);
    }
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

function touching_edge_of_arena(proposedX, proposedY) {
    return (proposedX <= 0) || (proposedY <= 0) || (proposedX >= max_x) || (proposedY >= max_y);
}

function increment_score(n) {
    score_board.innerHTML = parseInt(score_board.innerHTML) + n;
}

function update_special_targets_collected(name) {
    special_tokens.innerHTML += name + "<br />";
}

function start_collision_checks_for_red() {
    window.setInterval(function () {
        var snake_coords = {x: curr_snake_x, y: curr_snake_y, width: snake_width, height: snake_height};
        var target_coords = {x: curr_red_target_x, y: curr_red_target_y, width: target_width, height: target_height};
        var has_collision = check_for_overlap(snake_coords, target_coords);

        if (has_collision) {
            increment_score(red_score);
            clear_red_target();
            draw_red_target();
        }
    }, 20);
}

function handle_non_red_collision(score, color) {
    increment_score(score);
    clear_target_by_color(color);
}

function found_collision(target_x, target_y, score, color, name) {
    var snake_coords = {x: curr_snake_x, y: curr_snake_y, width: snake_width, height: snake_height};
    var target_coords = {x: target_x, y: target_y, width: target_width, height: target_height};
    if (check_for_overlap(snake_coords, target_coords) == true) {
        handle_non_red_collision(score, color);
        clear_target_by_color(color);
        update_special_targets_collected(name);
    }
}

function start_collision_checks_for_other_targets() {
    window.setInterval(function () {
        var blue_coords   = {x: curr_blue_target_x, y: curr_blue_target_y};
        var yellow_coords = {x: curr_yellow_target_x, y: curr_yellow_target_y};
        var green_coords  = {x: curr_green_target_x, y: curr_green_target_y};
        var orange_coords = {x: curr_orange_target_x, y: curr_orange_target_y};
        var purple_coords = {x: curr_purple_target_x, y: curr_purple_target_y};
        var pink_coords   = {x: curr_pink_target_x, y: curr_pink_target_y};
        var gray_coords   = {x: curr_gray_target_x, y: curr_gray_target_y};

        found_collision(blue_coords.x, blue_coords.y, blue_score, blue, "Blue");
        found_collision(yellow_coords.x, yellow_coords.y, yellow_score, yellow, "Yellow");
        found_collision(green_coords.x, green_coords.y, green_score, green, "Green");
        found_collision(orange_coords.x, orange_coords.y, orange_score, orange, "Orange");
        found_collision(purple_coords.x, purple_coords.y, purple_score, purple, "Purple");
        found_collision(pink_coords.x, pink_coords.y, pink_score, pink, "Pink");
        found_collision(gray_coords.x, gray_coords.y, gray_score, gray, "Gray");
    }, 50);
}

function start_timer_for_non_red(color, min_wait, max_wait) {
    if (color == yellow) {
        return setInterval(function () {
            var p = random_xy();
            draw_target(p.x, p.y, color)
        }, random_int(min_wait, max_wait) * millis);
    } else {
        return setTimeout(function () {
            var p = random_xy();
            draw_target(p.x, p.y, color)
        }, random_int(min_wait, max_wait) * millis);
    }
}

function start_timers_for_non_red() {
    blue_timer = start_timer_for_non_red(blue, min_lifetime_blue, max_lifetime_blue);
    yellow_timer = start_timer_for_non_red(yellow, min_lifetime_yellow, max_lifetime_yellow);
    green_timer = start_timer_for_non_red(green, min_lifetime_green, max_lifetime_green);
    orange_timer = start_timer_for_non_red(orange, min_lifetime_orange, max_lifetime_orange);
    purple_timer = start_timer_for_non_red(purple, min_lifetime_purple, max_lifetime_purple);
    pink_timer = start_timer_for_non_red(pink, min_lifetime_pink, max_lifetime_pink);
    gray_timer = start_timer_for_non_red(gray, min_lifetime_gray, max_lifetime_gray);

    console.log(blue_timer);
}

function hide_start_button() {
    var elm = document.querySelector("#start_button")
    elm.disabled = "disabled";
    setTimeout(function (){
        elm.disabled = "";
    }, game_length_ms)
}

// Gameplay oriented functions
function start_game() {
    hide_start_button();
    clear_arena();
    end_game(false);
    moves_made = 0;
    score_board.innerHTML = 0;
    special_tokens.innerHTML = "Special Tokens Collected:<br />";

    clearTimeout(game_end_timer);
    clearInterval(timer);

    timer_elm.innerHTML = game_length;

    draw_initial_snake();
    clear_target_locations();
    clear_red_target();
    draw_red_target();

    start_collision_checks_for_other_targets();
    start_collision_checks_for_red();

    start_timer();
    start_timers_for_non_red();
}

function end_game(report) {
    timer_elm.innerHTML = 0;

    if (report) {
      prompt("Game over! Your score is: " + score_board.innerHTML);

        clear_all_non_red();
        clear_non_red_timers();
    }
}

function clear_target_locations() {
    curr_blue_target_x = 0;
    curr_blue_target_y = 0;
    curr_yellow_target_x = 0;
    curr_yellow_target_y = 0;
    curr_green_target_x = 0;
    curr_green_target_y = 0;
    curr_orange_target_x = 0;
    curr_orange_target_y = 0;
    curr_purple_target_x = 0;
    curr_purple_target_y = 0;
    curr_pink_target_x = 0;
    curr_pink_target_y = 0;
    curr_gray_target_x = 0;
    curr_gray_target_y = 0;
}

function clear_all_non_red() {
    clear_target_by_color(blue);
    clear_target_by_color(yellow);
    clear_target_by_color(green);
    clear_target_by_color(orange);
    clear_target_by_color(purple);
    clear_target_by_color(pink);
    clear_target_by_color(gray);
}

function clear_non_red_timers() {
    clearTimeout(blue_timer);
    clearInterval(yellow_timer);
    clearTimeout(green_timer);
    clearTimeout(orange_timer);
    clearTimeout(purple_timer);
    clearTimeout(pink_timer);
    clearTimeout(gray_timer);
}

var game_end_timer;
var seconds_tick;

function start_timer() {
    game_end_timer = setTimeout(function () {
        end_game(true);
        window.clearInterval(timer);
    }, game_length_ms);

    timer = setInterval(function (){
        timer_elm.innerHTML -= 1;
    }, 1000);
}
