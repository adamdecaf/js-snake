/**
 * JS-Snake
 */

CREATE TABLE IF NOT EXISTS `leaderboard` (
  `score` int(32) NOT NULL,
  `name` varchar(128) NOT NULL,
  `grid_spots_moved` int(32) NOT NULL,
  `targets_hit` int(32) NOT NULL,
  `game_duration` int(32) NOT NULL,
  `time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `time` (`time`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
