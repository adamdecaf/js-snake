<?php
/**
 * MySQL
 * Adam Shannon
 */

class MySQL {
	static private $hostname;
	static private $username;
	static private $password;
	static private $connection;
	static public $query_count;
	static public $db;

	/**
	 * @name: set_vars
	 * This function will set the private variables to the specified connection.
	 *
	 * @parm: $hostname <- The URI** orIP** to connect to.
	 * @parm: $username <- The username** to connect with.
	 * @parm: $password <- The password** to connect with.
	 * @return: null
	 */
	// Notes:
	// ** - You should use my "validation.class.php" script to check the
	//       validity of the strings before you use them to connect with.
	static public function set_vars($hostname, $username, $password) {
		// Set the vars.
		self::$hostname = $hostname;
		self::$username = $username;
		self::$password = $password;

		// Set the connection.
		self::$connection = self::connect(self::$hostname, self::$username, self::$password);

		return;
	}


	/**
	 * @name: clean
	 * This function will (in effect) run mysql_real_escape_string() on the string
	 *  that is submitted.
	 *
	 * @parm: $string <- The string to clean
	 * @return: string
	 */
	static public function clean($string) {
		// Clean the string
		return mysql_real_escape_string($string);
	}


	/**
	 * @name: connect
	 * This function will connect and return a mysql connection
	 *
	 * @parm: null <- They should be stored locally
	 * @return: MySQL Object [Or string on error]
	 */
	static public function connect() {
		// Connect to a mysql DB and return said connection
		if (self::$hostname == '' || self::$username == '' || self::$password == '') {

			// Send a string back with the error
			// return "Error: You need to run set_vars!";
			return mysql_error();

		} else {

			// Connect
			$tmp = mysql_connect(self::$hostname, self::$username, self::$password);

			// Check to see if it worked
			if (!$tmp) {

				// Send back an error message
				unset($tmp);
				return "Error: Your MySQL connection failed.";

			} else {

				// Send the connection back
				return $tmp;

			}

		}
	}


	/**
	 * @name: close
	 * This function will (alought not really needed) close a MySQL connection.
	 *
	 * @parm: null
	 * @return: bool
	 */
	static public function close() {
		// Close out the connection
		if (mysql_close(self::$connection)) {

			// Return true
			return true;

		} else {

			// Retrurn false
			return false;

		}
	}


	/**
	 * @name: assoc
	 * This function will grab a MYSQL_ASSOC array for the specified query result.
	 *
	 * @parm: $query
	 * @return: array
	 */
	static public function assoc($query) {
		// Send the array back
		$data = array();
		$n = 0;

		while ($row = mysql_fetch_assoc($query)) {
			$data[$n++] = $row;
		}

		return $data;
	}

	/**
	 * @name: query
	 * This function will perform the all famous mysql_query() function.
	 *
	 * @parm: $sql
	 * @return: mysql_object
	 */
	static public function query($sql) {

		// Increment the counter
		self::$query_count += 1;

		// Send the query back
		return mysql_query($sql, self::$connection);

	}


	/**
	 * @name: search
	 * This function will perform a mysql search query.
	 *
	 * @parm: $sql
	 * @return: array
	 */
	static public function search($sql) {

		// Increment the counter
		self::$query_count += 1;

		// Perform the query
		$tmp_query = self::query($sql);

		// Now grab the array.
		return self::assoc($tmp_query);

	}

	/**
	 * @name: single
	 * This will perform a single search in a mysql database.
	 *
	 * @parm: $sql
	 * @return: array
	 */
	static public function single($sql) {

		// Increment the counter
		self::$query_count += 1;

		// Perform the query
		$tmp_query = self::query($sql);

		// Now grab the array.
		return mysql_fetch_assoc($tmp_query);

	}

}
