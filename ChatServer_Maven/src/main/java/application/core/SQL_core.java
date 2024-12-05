package application.core;

import static application.utils.Constants.log_enable;
import static application.utils.helpfull_voids.log;
import static application.utils.helpfull_voids.log_err;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Statement;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;


public class SQL_core {

	String url = System.getenv("JDBC_DATABASE_URL")!=null?System.getenv("JDBC_DATABASE_URL"):"jdbc:mysql://db:3306/chat?createDatabaseIfNotExist=true";
	private static String username = "root";
	private static String password = "root";

	public SQL_core() {
		try {
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            System.out.println("MySQL JDBC Driver not found");
            e.printStackTrace();
            return;
        }

        System.out.println("MySQL JDBC Driver Registered!");
		Init();
	}

	Connection createConnection() {
		System.out.println(url);
		Connection conn = null;
		try {
			conn = DriverManager.getConnection(url,username,password);
					return conn;
		} catch (Exception ex) {
			System.out.println("SQLException: " + ex.getMessage());
			return null;
		}
	}

	void Init() {
		createConnection();
		String query_users = "CREATE TABLE Users(id int NOT NULL PRIMARY KEY AUTO_INCREMENT COMMENT 'Primary Key', name VARCHAR(255),sername VARCHAR(255), login VARCHAR(255), password VARCHAR(255), mail VARCHAR(255))";
		String query_files = "CREATE TABLE Files(id int NOT NULL PRIMARY KEY AUTO_INCREMENT COMMENT 'Primary Key',name VARCHAR(255),length VARCHAR(255), time VARCHAR(255))";
		String query_messages = "CREATE TABLE Messages(id int NOT NULL PRIMARY KEY AUTO_INCREMENT COMMENT 'Primary Key',client_name VARCHAR(255),message VARCHAR(255), time VARCHAR(255))";
		UpdateQuery(query_users);
		UpdateQuery(query_files);
		UpdateQuery(query_messages);
	}

	void saveMessage(String clientUserName, String message) {
		if (message.isBlank())
			return;
		try {
			String request = String.format(
					"insert into Messages(client_name, message, time) values ('%s', '%s', '%s')",
					clientUserName, message.replace("'", ""), LocalDateTime.now().toString());
			Server.sql.UpdateQuery(request);
		} catch (Exception e) {
			log_err(log_enable, "broadcast SQL", e.getMessage());
		}
	}

	void UpdateQuery(String query) {
		try {
			Connection conn = DriverManager.getConnection(url, username, password);
			Statement statement = conn.createStatement();
			statement.executeUpdate(query);
			log(log_enable, "SQL", "UpdateQuery database ...");
		} catch (SQLException e) {
			log_err(log_enable, "SQL", "Loading driver ..." + e.getMessage());
		}
	}

	String SelectQuery(String query) {
		try {
			Connection conn = DriverManager.getConnection(url, username, password);
			Statement statement = conn.createStatement();
			ResultSet resultSet = statement.executeQuery(query);

			ResultSetMetaData metaData = resultSet.getMetaData();
			int columns = metaData.getColumnCount();

			ArrayList<String[]> list = new ArrayList<String[]>();

			while (resultSet.next()) {
				String[] record = new String[columns];

				for (int i = 1; i <= columns; i++) {
					record[i - 1] = "\"" + metaData.getColumnName(i) + "\":" + "\"" + resultSet.getString(i) + "\"";
				}
				list.add(record);
			}
			String res = list.isEmpty() ? "" : Arrays.deepToString(list.toArray());
			String final_res_json = res.isBlank() ? "" : "{" + res.substring(2, res.length() - 2) + "}";
			log(log_enable, "SQL", "request result" + final_res_json);
			return final_res_json;
		} catch (

		SQLException e) {
			log_err(log_enable, "SQL", "Loading driver ..." + e.getMessage());
			return null;
		}
	}
}
