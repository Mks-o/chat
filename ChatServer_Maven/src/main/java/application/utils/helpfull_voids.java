package application.utils;

import java.io.File;
import java.io.IOException;
import java.sql.Array;
import java.util.Arrays;
import java.util.regex.Pattern;

public class helpfull_voids {
    // #region//console colors
    
    // https://stackoverflow.com/questions/5762491/how-to-print-color-in-console-using-system-out-println
    public static final String ANSI_RESET = "\u001B[0m";
    public static final String ANSI_BLACK = "\u001B[30m";
    public static final String ANSI_RED = "\u001B[31m";
    public static final String ANSI_GREEN = "\u001B[32m";
    public static final String ANSI_YELLOW = "\u001B[33m";
    public static final String ANSI_BLUE = "\u001B[34m";
    public static final String ANSI_PURPLE = "\u001B[35m";
    public static final String ANSI_CYAN = "\u001B[36m";
    // #endregion

    // #region logs_colors
    public static void log(boolean log, String title, String message) {
        if (log) {
            System.out.println(ANSI_CYAN + title + ANSI_RESET + " " + message);
        }
    }

    public static void log(boolean log, String title, Integer message) {
        if (log) {
            System.out.println(ANSI_CYAN + title + ANSI_RESET + " " + message);
        }
    }

    public static void log(boolean log, String title, Object message) {
        if (log) {
            System.out.println(ANSI_CYAN + title + ANSI_RESET + " " + message.toString());
        }
    }

    public static void log_err(boolean log, String title, String message) {
        if (log) {
            System.out.println(ANSI_RED + title + ANSI_RESET + " " + message);
        }
    }

    public static void log_err(boolean log, String title, Integer message) {
        if (log) {
            System.out.println(ANSI_RED + title + ANSI_RESET + " " + message);
        }
    }

    public static void log_err(boolean log, String title, Object message) {
        if (log) {
            System.out.println(ANSI_RED + title + ANSI_RESET + " " + message.toString());
        }
    }

    // #endregion
    
    // #region source
    public static class source {
        public static boolean isNull(Object t) {
            return t == null;
        }

        public static boolean isNullorEmpty(String string) {
            return string == null || string.isBlank();
        }
        public static void checkPassword(String password,int password_length) {
		
            if (password == null)
                throw new IllegalArgumentException("null");
            
            if (password.length() <password_length)
                throw new ArrayIndexOutOfBoundsException("wrong length");
            
            if(Pattern.compile("\\s", 2).matcher(password).find())
                throw new RuntimeException("wrong symbol"); 
    
            String[][] messages = {  
                    {"[A-Z]" , "no upper case letter"},
                    {"[a-z]" , "no lower case letter"},
                    {"[\\d]" , "no digit"},
                    {"[\\W]" , "no symbol"}};
            
            StringBuilder stb = new StringBuilder();
            
            for (int i = 0; i < messages.length; i++) {
                if (!Pattern.compile(messages[i][0]).matcher(password).find())
                    stb.append(messages[i][1]+"\n");
            }
            if (!stb.isEmpty())
            throw new RuntimeException(stb.toString());	
        }
    }

    // #endregion
    
    // #region filesandfolders
    public static class FilesAndFilders {
        public static File createNewFile(String path) throws IOException {
            File file = new File(path);
            if (!file.exists())
                file.createNewFile();
            return file;
        }

        public static File createNewFolders(String path) throws IOException {
            File folder = new File(path);
            if (!folder.exists())
                folder.mkdirs();
            return folder;
        }
    }
    // #endregion

    // #region regexMatchers
    public static class regexMatchers {
        public static boolean isNumber(String str) {
            String exp = "\\d+";
            return str.matches(exp);
        }

        public static boolean isNumberAdv(String str) {
            String exp = "-?(0|(0\\.\\d+)|[1-9]\\d*(\\.\\d+)?)";
            return str.matches(exp);
        }

        public static boolean isProgrammingName(String str) {
            String exp = "[_a-zA-Z]\\w*";
            return str.matches(exp);
        }

        public static boolean isWord(String str) {
            String exp = "([a-zA-Z][a-z-]*[a-z])|[a-zA-Z]";
            return str.matches(exp);
        }
    }

    // endregion

    // #region strings
    public static class stringUtils {
        private static boolean isNumber(String str) {
            try {
                Double.parseDouble(str);
                return true;
            } catch (Exception e) {
                return false;
            }
        }

        private static Integer getNumberFromString(String string) {
            return Integer.parseInt(string);
        }

        private static Double getDoubleFromString(String string) {
            return Double.parseDouble(string);
        }
    }

    // #endregion

    // #region Arrays
    public static class ArraysUtils {
        public static <T> void printArray(T[] arr) {
            for (T obj : arr)
                System.out.println(obj);
        }

        public static <T extends Array> T[] add(T[] ar) {
            if (ar == null)
                return ar;
            T[] res = Arrays.copyOf(ar, ar.length + 1);
            return res;
        }

        public static <T extends Array> T[] remove(T[] ar) {
            if (ar == null)
                return ar;
            T[] res = Arrays.copyOf(ar, ar.length - 1);
            return res;
        }
    }
    // #endregion
}
