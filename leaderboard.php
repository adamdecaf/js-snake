<?php
/**
 * JS-Snake
 * Adam Shannon
 */

require_once "config.php";

/**
 * Requests
 *
 * GET /leaderboard.php
 * POST /leaderboard.php
 * - score, name, grid_spots_moved, targets_hit, game_duration
 */

if (empty($_GET)) {
   display_leaderboard();
} else {
  accept_leaderboard_submission();
}

function display_leaderboard() {
         echo "<a href='leaderboard.php'>Refresh</a><br />";

         $rows = MySQL::search("SELECT * FROM `js_snake`.`leaderboard` ORDER BY `score` DESC, `grid_spots_moved` ASC LIMIT 20;");

         $scores = "";
         foreach ($rows as $row) {
                 $scores .= "<tr>";
                 $scores .= "<td>" . $row["score"] . "</td>";
                 $scores .= "<td>" . $row["name"] . "</td>";
                 $scores .= "<td>" . $row["grid_spots_moved"] . "</td>";
                 //$scores .= "<td>" . $row["targets_hit"] . "</td>";
                 $scores .= "<td>" . ($row["grid_spots_moved"] / $row["score"]) . "</td>";
                 $scores .= "<td>" . $row["game_duration"] . "</td>";
                 $scores .= "<td>" . $row["time"] . "</td>";
                 $scores .= "</tr>";
         }

         $html = file_get_contents("leaderboard.html");
         $html = str_replace("%CONTENT%", $scores, $html);
         echo $html;
}

function accept_leaderboard_submission() {
         $score            = MySQL::clean($_GET["score"]);
         $name             = MySQL::clean($_GET["name"]);
         $grid_spots_moved = MySQL::clean($_GET["grid_spots_moved"]);
         $targets_hit      = MySQL::clean($_GET["targets_hit"]);
         $game_duration    = MySQL::clean($_GET["game_duration"]);

         if (!empty($score) && !empty($name) && !empty($grid_spots_moved) && !empty($targets_hit) && !empty($game_duration)) {
                  $sql = "INSERT INTO `js_snake`.`leaderboard` (`score`,`name`,`grid_spots_moved`,`targets_hit`,`game_duration`,`time`) VALUES";
                  $sql .= "('{$score}','{$name}','{$grid_spots_moved}','{$targets_hit}','{$game_duration}',CURRENT_TIMESTAMP)";
                  MySQL::query($sql);
         }
}
