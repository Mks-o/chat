package application.utils;

import application.entities.Icon;

public class Constants {

        public static final boolean log_enable = true;

        public static final String ICONS_PATH = "icons/",
                        ICONS_FILE = "icons.json",
                        PATH = "data/",
                        SERVER_PREFIX = "Server: ",
                        NAME_PREF = "name:",
                        FILE_PREF = "file::",
                        REGISTER = "::register|",
                        REGISTER_PREF = "::register::",
                        RECIVE_FILE = "resive_file",
                        VIDEO_PREF = "::video::",
                        VIDEO_END_PREF = "::videoEnd::",
                        STREAM_START_PREF = "::streamStart::",
                        STREAM_END_PREF = "::streamEnd::",
                        NEW_ICON_PREF = "::new_icon::",
                        END_FILE_SEND_PREF = "::^end^::",
                        DISCONECT = "disconect",
                        START_CLIENT_NAME = "test";

        public static final String USER_LEFT_CHAT_TEMPLATE = SERVER_PREFIX + "'%s' has left chat!",
                        SEND_FILE_PREF = "file::'%s'::'%s'",
                        CHANGE_PROTOCOL = "::change_protocol::";
        public static Icon[] icons = {
                        new Icon(" -@#&- ",
                                        "https://cdn3.iconfinder.com/data/icons/free-icons-3/512/red_matreshka_big.png"),
                        new Icon(" -$#&- ",
                                        "https://cdn3.iconfinder.com/data/icons/free-icons-3/128/004_money_dollar_cash_coins_riches_wealth.png"),
                        new Icon(" -*#&- ",
                                        "https://cdn3.iconfinder.com/data/icons/free-icons-3/128/002_present_bonus.png"),
                        new Icon(" -%#&- ",
                                        "https://cdn3.iconfinder.com/data/icons/free-icons-3/128/003_palm_beach_travel_vacation_leisure.png"),
                        new Icon(" -::#&- ",
                                        "https://cdn3.iconfinder.com/data/icons/free-icons-3/512/001_wizard_magician_conjure_conjurer.png"),
                        new Icon(" -!!#&- ", "https://cdn3.iconfinder.com/data/icons/free-icons-3/512/cat_3.png"),
                        new Icon(" -&&#&- ",
                                        "https://cdn0.iconfinder.com/data/icons/Mysecret_10icons_by_Artdesigner/128/message_bottle.png"),
                        new Icon(" -^-_-^- ",
                                        "https://cdn1.iconfinder.com/data/icons/IconsLandVistaPeopleIconsDemo/128/Viking_Male.png")
        };
}
