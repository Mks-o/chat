package application.core;

import static application.utils.Constants.log_enable;
import static application.utils.helpfull_voids.log;
import static application.utils.helpfull_voids.log_err;

import java.io.IOException;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.ArrayList;
import java.util.List;

public class Server {
	private ServerSocket serverSocket;
	static List<ClientHandler> CLIENTS_HANDLERS = new ArrayList<>();
	//int logBack = 50;
	//InetAddress address = InetAddress.getByName("127.0.0.1");
	static SQL_core sql = new SQL_core();

	public Server(int port) throws IOException {
		this.serverSocket = new ServerSocket(port);
		log(log_enable, "SERVER CREATE", port);
		sql.Init();
	}

	public void start() {
		try {
			log(log_enable, "SERVER",
					"Group chat app has started: listening at port '%s'".formatted(serverSocket.getLocalPort()));
			while (!serverSocket.isClosed()) {
				Socket socket = serverSocket.accept();
				ClientHandler clientHandler = new ClientHandler(socket);
				if (CLIENTS_HANDLERS.stream().filter(c -> c.input == clientHandler.input) != null) {
					new Thread(clientHandler).start();
					log(log_enable, "SERVER", "A new client has connected ");
				}
			}
		} catch (Exception e) {
			log_err(log_enable, "SERVER", "Server closed... " + e.getMessage());
			closeServerSocket();
		}

	}

	private void closeServerSocket() {
		try {
			serverSocket.close();
		} catch (Exception e) {
			log_err(log_enable,"SERVER",e.getMessage());
		}
	}
}
