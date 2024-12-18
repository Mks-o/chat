package application.utils;

public class helpfull_voids {
    //https://stackoverflow.com/questions/5762491/how-to-print-color-in-console-using-system-out-println
    public static final String ANSI_RESET = "\u001B[0m";
    public static final String ANSI_BLACK = "\u001B[30m";
    public static final String ANSI_RED = "\u001B[31m";
    public static final String ANSI_GREEN = "\u001B[32m";
    public static final String ANSI_YELLOW = "\u001B[33m";
    public static final String ANSI_BLUE = "\u001B[34m";
    public static final String ANSI_PURPLE = "\u001B[35m";
    public static final String ANSI_CYAN = "\u001B[36m";

    public static void log(boolean log, String title, String message) {
        if (log) {
            System.out.println(ANSI_CYAN + title + ANSI_RESET +" "+ message);
        }
    }

    public static void log(boolean log, String title,Integer message) {
        if (log) {
            System.out.println(ANSI_CYAN + title + ANSI_RESET +" "+ message);
        }
    }

    public static void log(boolean log, String title,Object message) {
        if (log) {
            System.out.println(ANSI_CYAN + title + ANSI_RESET +" "+ message.toString());
        }
    }

    public static void log_err(boolean log, String title, String message) {
        if (log) {
            System.out.println(ANSI_RED + title + ANSI_RESET +" "+ message);
        }
    }

    public static void log_err(boolean log, String title,Integer message) {
        if (log) {
            System.out.println(ANSI_RED + title + ANSI_RESET +" "+ message);
        }
    }
    
    public static void log_err(boolean log, String title,Object message) {
        if (log) {
            System.out.println(ANSI_RED + title + ANSI_RESET +" "+ message.toString());
        }
    }

}
