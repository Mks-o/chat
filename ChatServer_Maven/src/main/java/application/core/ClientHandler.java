package application.core;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.UnsupportedEncodingException;
import java.net.Socket;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.Scanner;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantReadWriteLock;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.xml.bind.DatatypeConverter;

import com.fasterxml.jackson.core.StreamReadFeature;
import com.fasterxml.jackson.core.exc.StreamReadException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DatabindException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import com.fasterxml.jackson.databind.json.JsonMapper;

import application.entities.Icon;
import application.entities.User;

import static application.utils.Constants.*;
import static application.utils.helpfull_voids.*;

public class ClientHandler implements Runnable {
	private boolean is_file_send,
			is_file_send_to_others,
			is_file_alredy_exists,
			showVideo,
			stream;
	private static String fileName = "",
			content_type = "",
			videoframe = "",
			sec_k = "",
			origin = "";

	private static ReentrantReadWriteLock LOCK = new ReentrantReadWriteLock(true);
	// private Lock READ_LOCK = LOCK.readLock();
	private Lock WRITE_LOCK = LOCK.writeLock();
	private JsonMapper mapper = JsonMapper.builder()
			.configure(StreamReadFeature.INCLUDE_SOURCE_IN_LOCATION, true)
			.enable(DeserializationFeature.ACCEPT_EMPTY_STRING_AS_NULL_OBJECT)
			.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false).build();
	Socket socket;
	protected InputStream input;
	private OutputStream output;

	private String clientUserName = "";
	long file_size = 0;

	public ClientHandler(Socket socket) {
		try {
			this.socket = socket;
			socket.setReceiveBufferSize(32 * 1024);
			socket.setSendBufferSize(32 * 1024);
			this.input = socket.getInputStream();
			this.output = socket.getOutputStream();
			this.clientUserName = START_CLIENT_NAME;
			Thread disconect = new Thread() {
				@Override
				public void run() {
					int timeout = 15000;
					try {
						sleep(timeout);
					} catch (InterruptedException e) {
						if (clientUserName == START_CLIENT_NAME) {
							log_err(log_enable, "constructor", e.getMessage());
							closeConnection(socket, input, output);
						}
					} finally {
						if (clientUserName == START_CLIENT_NAME) {
							log_err(log_enable, "constructor", "registration time out  " + timeout);
							closeConnection(socket, input, output);
						}
					}
				}
			};
			disconect.setDaemon(true);
			disconect.start();
			mapper.findAndRegisterModules();
			try {
				doHandShakeToInitializeWebSocketConnection(input, output);
				log(log_enable, "CONSTRUCTOR", "Create new user");
			} catch (UnsupportedEncodingException handShakeException) {
				log(log_enable, "handShakeException", "Could not connect to client input stream" + handShakeException);
			}
			try {
				servermessage("connection success! enter your name!");
			} catch (Exception e) {

				log(log_enable, "create user", "Cannot create user " + e.getMessage());
			}

		} catch (Exception e) {
			log_err(log_enable, "Cannot open socket", e.getMessage());
			closeConnection(socket, input, output);
		}
	}

	// #region//icons
	private void getIcons() throws IOException {
		try {
			Icon[] last_icons;
			ObjectWriter ow = new ObjectMapper().writer().withDefaultPrettyPrinter();
			File file = new File(ICONS_PATH + ICONS_FILE);
			if (!file.exists()) {
				file.getParentFile().mkdirs();
				file.createNewFile();
				last_icons = icons;
			} else {
				last_icons = loadImages(file);
				if (last_icons == null) {
					log_err(log_enable, "Can't send images!", "lasticons is null");
					return;
				}
			}
			String json = ow.writeValueAsString(last_icons);
			writeData("::icons::" + json);
			broadcastMessage("::icons::" + json);
			mapper.writerWithDefaultPrettyPrinter().writeValue(file, last_icons);
			log(log_enable, "IMAGES_GET", "success get images");
		} catch (Exception e) {
			log_err(log_enable, "Can't send images!", e.getMessage());
		}
	}

	private Icon[] loadImages(File file) throws StreamReadException, DatabindException, IOException {
		try {
			Icon[] loaded_icons = mapper.readValue(file, new TypeReference<Icon[]>() {
			});
			log(log_enable, "IMAGES_LOAD", "success loaded images");
			return loaded_icons;
		} catch (Exception e) {
			System.out.println("cant load images " + e.getMessage());
			return icons;
		}
	}

	private void saveIcons(String json) {
		try {
			Icon[] last_icons;
			File file = new File(ICONS_PATH + ICONS_FILE);
			if (!file.exists()) {
				file.getParentFile().mkdirs();
				file.createNewFile();
				last_icons = icons;
			} else {
				last_icons = loadImages(file);
			}
			Icon icon = mapper.readValue(json, Icon.class);
			last_icons = Arrays.copyOf(last_icons, last_icons.length + 1);
			last_icons[last_icons.length - 1] = icon;
			mapper.writerWithDefaultPrettyPrinter().writeValue(file, last_icons);
			getIcons();
			log(log_enable, "IMAGES_SAVE", "success saved");
		} catch (Exception e) {
			System.out.println("Can't save images " + e.getMessage());
		}
	}

	// #endregion

	// #region//register and auth area
	private void doHandShakeToInitializeWebSocketConnection(InputStream inputStream, OutputStream outputStream)
			throws UnsupportedEncodingException, NoSuchAlgorithmException {
		@SuppressWarnings("resource")
		String data = new Scanner(inputStream, "UTF-8").useDelimiter("\r\n\r\n").next();
		// log(true, "handshake", data);
		// return;
		Matcher orig_match = Pattern.compile("Origin: .*").matcher(data);
		if (orig_match.find()) {
		}
		Matcher sec_match = Pattern.compile("Sec-WebSocket-Key: (.*)").matcher(data);
		if (sec_match.find()) {
			byte[] response = null;
			origin = orig_match.group(0);
			sec_k = encodeKey(sec_match);
			try {
				response = ("HTTP/1.1 101 Switching Protocols\r\n" + "Connection: Upgrade\r\n"
						+ "Upgrade: websocket\r\n" + "Sec-WebSocket-Accept: "
						+ sec_k + "\r\n" + "Sec-WebSocket-Protocol: soap\r\n"
						+ origin
						+ "\r\n\r\n").getBytes("UTF-8");
			} catch (Exception e) {
				log_err(true, "handshake response", e.getMessage());
			}
			try {
				// READ_LOCK.lock();
				outputStream.write(response, 0, response.length);
				// READ_LOCK.unlock();
			} catch (IOException e) {
				log_err(true, "Cannot read data in handshake2", e.getMessage());
			}
			log(log_enable, "HAND_SHAKE", "success");
		} else {
			log_err(true, "Can't do hand shake to initialize web socket", "");
		}
	}

	private static String encodeKey(Matcher match) throws NoSuchAlgorithmException, UnsupportedEncodingException {
		return DatatypeConverter.printBase64Binary(MessageDigest.getInstance("SHA-1")
				.digest((match.group(1) + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11").getBytes("UTF-8")));
	}

	private void register(String values) throws IOException {
		User user = mapper.readValue(values, User.class);
		String request = String.format(
				"insert into Users(name, sername,login, password, mail) values ('%s', '%s', '%s', '%s', '%s')",
				user.name, user.secondName, user.login, user.password, user.mail);
		String request1 = String.format("Select * from Users where login = '%s'", user.login);
		String exist = Server.sql.SelectQuery(request1);
		User res = exist.isBlank() ? null : mapper.readValue(exist, User.class);
		log(log_enable, "REGISTER", "success");
		if (res != null && res.login.equals(user.login)) {
			servermessage(String.format("User %s already exists", user.login));
			closeConnection(socket, input, output);
		} else
			Server.sql.UpdateQuery(request);
	}

	private String setClientName(String message) throws IOException {
		clientUserName = message.split(": ")[1];
		if (clientUserName.equals("::register::")) {
			System.out.println(message.split(": ")[1]);
			return "";
		}
		String password = message.split(": ")[2];
		try {
			String request1 = String.format("Select * from Users where login = '%s'", clientUserName);
			User res = mapper.readValue(Server.sql.SelectQuery(request1), User.class);
			if (res == null || !res.password.equals(password)) {
				servermessage(String.format("User %s not found"));
				closeConnection(socket, input, output);
				return "";
			}
			getIcons();
			Server.CLIENTS_HANDLERS.add(this);
		} catch (Exception e) {
			servermessage(String.format("User %s with password %s not found", clientUserName, password));
			closeConnection(socket, input, output);
			return "";
		}
		// READ_LOCK.unlock();
		// WRITE_LOCK.unlock();
		servermessage("welcome " + clientUserName);
		List<ClientHandler> clients_handlers_list = current_handlers();
		Optional<ClientHandler> existing_client = clients_handlers_list.stream()
				.filter(c -> c.clientUserName.equals(clientUserName)).findAny();
		if (existing_client.isPresent()) {
			servermessage(clientUserName + "already in chat!");
			closeConnection(socket, input, output);
		}
		String[] clients = Server.CLIENTS_HANDLERS.stream().map(x -> x.clientUserName).toArray(String[]::new);
		broadcastMessage(clientUserName + " enter the chat");
		servermessage("Clients in chat: " + Arrays.deepToString(clients));
		return "";
	}

	// #endregion

	// #region//file send area

	public void readfile(byte[] array) throws IOException {
		try {
			if (array.length == 0) {
				log(log_enable, "READ FILE", "Read new file");
				return;
			}

			File f = new File(PATH + fileName);
			if (f.exists() && f.length() >= file_size || file_size - f.length() <= 0)
				return;
			if (!f.getParentFile().exists()) {
				f.getParentFile().mkdir();
			}
			FileOutputStream out = new FileOutputStream(f, true);// PATH + fileName
			out.write(array);
			out.close();
			log(log_enable, "FILE READ", file_size + " == " + f.length() + "/" + " <--- " + (file_size - f.length()));
		} catch (Exception e) {
			log_err(log_enable, "Cannot read file", e.getMessage());
		}
	}

	public void sendVideoToOthers(String mess) throws IOException {
		log(log_enable, "VIDEO SEND", mess.length());
		List<ClientHandler> clients = current_handlers();
		try {
			// READ_LOCK.lock();
			for (ClientHandler handler : clients)
				if (showVideo) {
					handler.writeData("::video::" + mess);
					// handler.WRITE_LOCK.lock();
				}
		} catch (Exception e) {
			// for (ClientHandler handler : clients)
			// handler.WRITE_LOCK.unlock();
			log(log_enable, "VIDEO SEND", "Send video error: " + e.getMessage());

			// READ_LOCK.unlock();
		} finally {
			// for (ClientHandler handler : clients)
			// handler.WRITE_LOCK.unlock();
			videoframe = "";
			// READ_LOCK.unlock();
		}
	}

	private void sendFilesToOthers(File file) throws IOException {
		if (fileName == "") {
			log(log_enable, clientUserName, "Send file to others: empty file name");
			return;
		}
		List<ClientHandler> clients = current_handlers();
		try {
			servermessage("try send file from server\n");
			long totalLength = new File(PATH + fileName).length();

			int BUFFER_SIZE = 18 * 1024; // kilobytes;
			byte[] buffer = new byte[BUFFER_SIZE];
			double chunks = Math.ceil(totalLength / BUFFER_SIZE);

			log(log_enable, "FILE_SEND", "total chunks to send size is %s file name is %s".formatted(chunks, fileName));
			// System.out.printf("total chunks to send size is %s file name is %s", chunks,
			// fileName);
			for (ClientHandler handler : clients) {
				handler.writeData(SEND_FILE_PREF.formatted(fileName, content_type) + "::" +
						clientUserName + "::" + chunks);
				handler.WRITE_LOCK.lock();
			}
			FileInputStream fis = new FileInputStream(file);
			while (fis.read(buffer, 0, BUFFER_SIZE) > 0) {
				log(log_enable, "CHUNK", chunks -= 1);
				for (ClientHandler handler : clients)
					handler.writeData(DatatypeConverter.printBase64Binary(buffer));
			}
			fis.close();
			for (ClientHandler handler : clients) {
				handler.writeData(END_FILE_SEND_PREF);
				handler.WRITE_LOCK.unlock();
			}
		} catch (Exception e) {
			System.out.println("Send to all error: " + e.getMessage());
			servermessage(END_FILE_SEND_PREF);
			is_file_alredy_exists = false;
			is_file_send_to_others = false;
			is_file_send = false;
			fileName = "";
			file_size = 0;
			content_type = "";
		} finally {
			servermessage("file send success!");
			resetFileData();
			for (ClientHandler handler : clients) {
				handler.writeData(END_FILE_SEND_PREF);
				handler.WRITE_LOCK.unlock();
			}
		}
	}

	private void writeData(String str) throws IOException {
		output.write(encode(str));
		output.flush();
	}

	// endregion

	// #region//source code
	private static byte[] encode(String mess) throws IOException {
		byte[] rawData = mess.getBytes();

		int frameCount = 0;
		byte[] frame = new byte[10];

		frame[0] = (byte) 129;

		if (rawData.length <= 125) {
			frame[1] = (byte) rawData.length;
			frameCount = 2;
		} else if (rawData.length >= 126 && rawData.length <= 65535) {
			frame[1] = (byte) 126;
			int len = rawData.length;
			frame[2] = (byte) ((len >> 8) & (byte) 255);
			frame[3] = (byte) (len & (byte) 255);
			frameCount = 4;
		} else {
			frame[1] = (byte) 127;
			long len = rawData.length; // note an int is not big enough in java
			frame[2] = (byte) ((len >> 56) & (byte) 255);
			frame[3] = (byte) ((len >> 48) & (byte) 255);
			frame[4] = (byte) ((len >> 40) & (byte) 255);
			frame[5] = (byte) ((len >> 32) & (byte) 255);
			frame[6] = (byte) ((len >> 24) & (byte) 255);
			frame[7] = (byte) ((len >> 16) & (byte) 255);
			frame[8] = (byte) ((len >> 8) & (byte) 255);
			frame[9] = (byte) (len & (byte) 255);
			frameCount = 10;
		}

		int bLength = frameCount + rawData.length;

		byte[] reply = new byte[bLength];

		int bLim = 0;
		for (int i = 0; i < frameCount; i++) {
			reply[bLim] = frame[i];
			bLim++;
		}
		for (int i = 0; i < rawData.length; i++) {
			reply[bLim] = rawData[i];
			bLim++;
		}
		return reply;
	}

	private List<ClientHandler> current_handlers() {
		return Server.CLIENTS_HANDLERS.stream()
				.filter(client -> !client.clientUserName.equals(clientUserName) && client.socket != this.socket)
				.toList();
	}

	private void resetFileData() {
		is_file_alredy_exists = false;
		is_file_send_to_others = false;
		is_file_send = false;
		fileName = "";
		file_size = 0;
		content_type = "";
	}

	// endregion

	// #region//client area
	private void broadcastMessage(String messageToSend) {
		try {
			Server.sql.saveMessage(clientUserName, new String(messageToSend));
			if (messageToSend.contains(DISCONECT)) {
				closeConnection(socket, input, output);
				return;
			}

			List<ClientHandler> handlers = current_handlers();
			for (ClientHandler handler : handlers)
				handler.writeData(messageToSend);
		} catch (Exception e) {
			log_err(log_enable, "Run broadcast", e.getMessage());
			closeConnection(socket, input, output);
		}
	}

	private void servermessage(String message) throws IOException {
		// READ_LOCK.lock();
		output.write(encode(SERVER_PREFIX + " " + message));
		output.flush();
		// READ_LOCK.unlock();
	}

	private void removeClientHandler() throws IOException {
		servermessage("disconect from server...");
		try {
			// WRITE_LOCK.lock();
			// READ_LOCK.lock();
			Server.CLIENTS_HANDLERS.remove(this);
			// READ_LOCK.unlock();
		} catch (Exception e) {
			// WRITE_LOCK.unlock();
			log_err(log_enable, "REMOVE CLIENT", e.getMessage());
			removeClientHandler();
		} finally {
			// WRITE_LOCK.unlock();
			log(log_enable, "Server.CLIENTS_HANDLERS", "CLIENTS_HANDLERS: " + Server.CLIENTS_HANDLERS.size());
		}
		if (clientUserName != START_CLIENT_NAME)
			broadcastMessage(USER_LEFT_CHAT_TEMPLATE.formatted(clientUserName));
	}

	private void closeConnection(Socket socketToClose, InputStream input2, OutputStream output2) {
		// READ_LOCK.lock();
		try {
			removeClientHandler();
		} catch (Exception e) {
			log_err(log_enable, "Close exept", e.getMessage());
		}
		try {
			output2.flush();
			output2.close();

		} catch (Exception e) {
			log_err(log_enable, "output", e.getMessage());
		}
		try {
			input2.close();
		} catch (Exception e) {
			log_err(log_enable, "input", e.getMessage());
		}
		try {
			socket.close();
		} catch (Exception e) {
			log_err(log_enable, "socket", e.getMessage());
		} finally {
			output2 = null;
			input2 = null;
			if (!socket.isClosed()) {
				closeConnection(socketToClose, input2, output2);
			}
		}

	}

	// #endregion

	private void getRecieveFileData(byte[] message) throws IOException {
		String[] file_data = new String(message).split(FILE_PREF)[1].split("::");

		fileName = file_data[0].replace(" ", "").toLowerCase();
		if (fileName == "") {
			is_file_send = false;
			is_file_alredy_exists = false;
			return;
		}
		content_type = file_data[1];
		try {
			file_size = Long.parseLong(file_data[2]);
			String request = String.format(
					"insert into Files(name, length, time) values ('%s', '%s', '%s')",
					fileName, file_size, LocalDateTime.now().toString());
			servermessage("file loading " + fileName);
			log(log_enable, "getRecieveFileData", message.toString());

			File f = new File(PATH + fileName);
			if (f.exists()) {
				is_file_alredy_exists = true;
				servermessage("file already exists in server data");
			} else {
				is_file_alredy_exists = false;
				is_file_send = true;
			}
			Server.sql.UpdateQuery(request);
		} catch (Exception e) {
		}
	}

	private String printInputStream() throws IOException, InterruptedException {
		int buffer_size = 58 * 1024;
		byte[] buffer = new byte[buffer_size];// incoming buffer
		byte[] message = null;// buffer to assemble message in
		byte[] masks = new byte[4];
		boolean isSplit = false;// has a message been split over a read
		int length = 0; // length of message
		int totalRead = 0; // total read in message so far
		String resultString = "";
		while (true) {
			int len = 0;// length of bytes read from socket
			BufferedInputStream bf = new BufferedInputStream(input);
			try {
				len = bf.read(buffer);
			} catch (IOException e) {
				log_err(log_enable, "Cant get inputStream", e.getMessage());
				// closeConnection(socket, input, output);
				// wait(5000);
				// len = bf.read(buffer);
				return "";
			}
			if (len != -1) {
				boolean more = false;
				int totalLength = 0;
				do {
					int j = 0;
					int i = 0;
					if (!isSplit) {
						byte rLength = 0;
						int rMaskIndex = 2;
						int rDataStart = 0;
						// b[0] assuming text
						byte data = buffer[1];
						byte op = (byte) 127;
						rLength = (byte) (data & op);
						length = (int) rLength;
						if (rLength == (byte) 126) {
							rMaskIndex = 4;
							length = Byte.toUnsignedInt(buffer[2]) << 8;
							length += Byte.toUnsignedInt(buffer[3]);
						} else if (rLength == (byte) 127)
							rMaskIndex = 10;
						for (i = rMaskIndex; i < (rMaskIndex + 4); i++) {
							masks[j] = buffer[i];
							j++;
						}

						rDataStart = rMaskIndex + 4;
						message = new byte[length];
						totalLength = length + rDataStart;
						for (i = rDataStart, totalRead = 0; i < len && i < totalLength; i++, totalRead++) {
							message[totalRead] = (byte) (buffer[i] ^ masks[totalRead % 4]);
						}

					} else {
						for (i = 0; i < len && totalRead < length; i++, totalRead++) {
							message[totalRead] = (byte) (buffer[i] ^ masks[totalRead % 4]);
						}
						totalLength = i;
					}
					if (totalRead < length) {
						isSplit = true;
					} else {
						isSplit = false;
						String mess = new String(message);
						// log(log_enable, "STREAM", mess.length());
						// log(log_enable, "VIDEO", showVideo + " " + stream + " " +
						// videoframe.length());
						if (mess.startsWith(STREAM_START_PREF)) {
							stream = true;
							servermessage("start stream");
							return resultString;
						}
						if (mess.contains(VIDEO_PREF) && stream) {
							showVideo = true;
							return resultString;
						}
						if (mess.contains(STREAM_END_PREF)) {
							videoframe = "";
							mess = "";
							List<ClientHandler> clients = current_handlers();
							for (ClientHandler handler : clients) {
								handler.input.skip(handler.input.available());
								handler.showVideo = false;
								handler.stream = false;
							}
							bf.skip(bf.available());
							showVideo = false;
							stream = false;
							servermessage("end stream");
							resultString = "";
							return "";
						}
						if (mess.contains(VIDEO_END_PREF)) {
							sendVideoToOthers(videoframe);
							return resultString;
						}
						if (mess.startsWith(NAME_PREF)) {
							setClientName(mess);
							return resultString;
						}
						if (mess.startsWith(REGISTER)) {
							register(new String(mess.replace(REGISTER, "")));
							return resultString;
						}
						if (mess.startsWith(NEW_ICON_PREF)) {
							saveIcons(new String(mess.split("::new_icon::")[1]));
							return resultString;
						}
						if (mess.startsWith(FILE_PREF)) {
							getRecieveFileData(message);
							return is_file_alredy_exists && fileName != "" ? RECIVE_FILE : "";
						}
						if (mess.equals(END_FILE_SEND_PREF)) {
							is_file_send = false;
							boolean wasLoaded = is_file_alredy_exists;
							is_file_alredy_exists = false;
							if (wasLoaded) {
								is_file_send_to_others = false;
								is_file_send = false;
								fileName = "";
								file_size = 0;
								content_type = "";
								return "";
							} else if (fileName != "")
								return RECIVE_FILE;
						}
						if (!is_file_alredy_exists) {
							if (is_file_send)
								readfile(message);
							if (showVideo)
								videoframe += mess;
							if (clientUserName != START_CLIENT_NAME 
							&& clientUserName != REGISTER_PREF 
							&& !stream && !is_file_send) {
								resultString = clientUserName + ": " + new String(message);
								return resultString;
							}
						}

						// buffer = new byte[buffer_size];
					}
					if (totalLength < len) {
						more = true;
						for (i = totalLength, j = 0; i < len; i++, j++)
							buffer[j] = buffer[i];
						len = len - totalLength;

					} else
						more = false;
				} while (more);
			} else
				break;
		}
		return resultString;
	}

	// private String ReadInputData(byte[] message) throws IOException {
	// String resultString = "";
	// String mess = new String(message);
	// if (mess.startsWith(VIDEO_PREF) && stream) {
	// showVideo = true;
	// return resultString;
	// }
	// if (mess.startsWith(STREAM_START_PREF)) {
	// stream = true;
	// servermessage("start stream");
	// return resultString;
	// }
	// if (mess.startsWith(STREAM_END_PREF)) {
	// videoframe = "";
	// showVideo = false;
	// stream = false;
	// servermessage("end stream");
	// return resultString;
	// }
	// if (mess.startsWith(VIDEO_END_PREF)) {
	// sendVideoToOthers(videoframe);
	// return resultString;
	// }
	// if (mess.startsWith(NAME_PREF)) {
	// setClientName(mess);
	// return resultString;
	// }
	// if (mess.startsWith(REGISTER)) {
	// register(new String(mess.replace(REGISTER, "")));
	// return resultString;
	// }
	// if (mess.startsWith(NEW_ICON_PREF)) {
	// saveIcons(new String(mess.split("::new_icon::")[1]));
	// return resultString;
	// }
	// if (mess.startsWith(FILE_PREF)) {
	// getRecieveFileData(message);
	// return is_file_alredy_exists && fileName != "" ? RECIVE_FILE : "";
	// }
	// if (mess.equals(END_FILE_SEND_PREF)) {
	// is_file_send = false;
	// boolean wasLoaded = is_file_alredy_exists;
	// is_file_alredy_exists = false;
	// if (wasLoaded) {
	// is_file_send_to_others = false;
	// is_file_send = false;
	// fileName = "";
	// file_size = 0;
	// content_type = "";
	// return "";
	// } else if (fileName != "")
	// return RECIVE_FILE;
	// }
	// if (!is_file_alredy_exists) {
	// if (is_file_send)
	// readfile(message);
	// if (showVideo)
	// videoframe += mess;
	// else if (clientUserName != START_CLIENT_NAME && clientUserName !=
	// REGISTER_PREF) {
	// resultString = clientUserName + ": " + new String(message);
	// return resultString;
	// }
	// }
	// return resultString;
	// }

	@Override
	public void run() {
		while (!socket.isClosed()) {
			try {
				String res = printInputStream();
				if (res == RECIVE_FILE) {
					is_file_send_to_others = true;
					try {
						sendFilesToOthers(new File(PATH + fileName));
					} catch (Exception e) {
						log_err(log_enable, "Error in sending file", e.getMessage());
						resetFileData();
					} finally {
						resetFileData();
					}
				} else if (!is_file_send && !is_file_send_to_others && !showVideo)
					broadcastMessage(res);
				// if(res=="::close::"){
				// closeConnection(socket, input, output);
				// }
			} catch (Exception e) {
				log_err(log_enable, "Run main exeption", e.getMessage());
				// closeConnection(socket, input, output);
				return;
			}
		}
		closeConnection(socket, input, output);
	}
}
