package application;

import static application.utils.Constants.log_enable;
import static application.utils.helpfull_voids.log;

import java.io.IOException;
import application.core.Server;

public class WebSocketServer{
	public static void main(String[] args){
        int portNumber = 3015;
        try {
            new Server(portNumber).start();
            log(log_enable,"MAIN","server was created!");
        } catch (IOException exception) {
            throw new IllegalStateException("Could not create web server", exception);
        }
        log(log_enable, "MAIN","serwer was end!");    
	}
}