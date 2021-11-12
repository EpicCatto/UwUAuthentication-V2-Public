package uwuprotection.notthatuwu.xyz.authentication;

import uwuprotection.notthatuwu.xyz.utils.URLUtils;

public class Authentication {

    public static String getUserInfoFromSession(String session){
        return URLUtils.jsonGetRequest("http://uwuprotection.notthatuwu.xyz/api/session/" + session + "/userinfo");
    }

    public static String getClientInfoFromName(String client){
        return URLUtils.jsonGetRequest("http://uwuprotection.notthatuwu.xyz/api/storage/client/" + client);
    }

    public static String changeHWIDFromSession(String session, String newHwid){
        return URLUtils.jsonGetRequest("http://uwuprotection.notthatuwu.xyz/api/session/" + session + "/updatehwid/" + newHwid);
    }

}
