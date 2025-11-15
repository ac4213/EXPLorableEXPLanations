<?php
/**
 * Database Connection Handler
 * Uses PDO for security (prevents SQL injection)
 */

require_once 'config.php';

class Database {
    private $connection = null;

    /**
     * Constructor - establishes database connection
     */
    public function __construct() {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;

            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
            ];

            $this->connection = new PDO($dsn, DB_USER, DB_PASS, $options);

        } catch (PDOException $e) {
            // Log error without exposing sensitive information
            error_log("Database connection failed: " . $e->getMessage());

            // Return generic error to user
            http_response_code(500);
            echo json_encode([
                'error' => 'Database connection failed',
                'message' => 'Unable to connect to database. Please try again later.'
            ]);
            exit;
        }
    }

    /**
     * Get the PDO connection instance
     * @return PDO
     */
    public function getConnection() {
        return $this->connection;
    }

    /**
     * Execute a prepared query
     * @param string $sql SQL query with placeholders
     * @param array $params Parameters to bind
     * @return PDOStatement|false
     */
    public function query($sql, $params = []) {
        try {
            $stmt = $this->connection->prepare($sql);
            $stmt->execute($params);
            return $stmt;
        } catch (PDOException $e) {
            error_log("Query failed: " . $e->getMessage() . " | SQL: " . $sql);
            return false;
        }
    }

    /**
     * Get the last inserted ID
     * @return string
     */
    public function lastInsertId() {
        return $this->connection->lastInsertId();
    }

    /**
     * Begin a transaction
     * @return bool
     */
    public function beginTransaction() {
        return $this->connection->beginTransaction();
    }

    /**
     * Commit a transaction
     * @return bool
     */
    public function commit() {
        return $this->connection->commit();
    }

    /**
     * Rollback a transaction
     * @return bool
     */
    public function rollback() {
        return $this->connection->rollback();
    }
}
?>
