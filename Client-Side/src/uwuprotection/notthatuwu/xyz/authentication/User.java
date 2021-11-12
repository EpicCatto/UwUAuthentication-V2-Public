package uwuprotection.notthatuwu.xyz.authentication;

import java.util.ArrayList;

public class User {
    private String username;
    private String discordUser;
    private String hwid;
    private String status;
    private String uid;
    private String session;
    private ArrayList<String> ownedClient;

    public User(String username, String discordUser, String hwid, String status, String uid, ArrayList<String> ownedClient, String session) {
        this.username = username;
        this.discordUser = discordUser;
        this.hwid = hwid;
        this.status = status;
        this.uid = uid;
        this.ownedClient = ownedClient;
        this.session = session;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getDiscordUser() {
        return discordUser;
    }

    public void setDiscordUser(String discordUser) {
        this.discordUser = discordUser;
    }

    public String getHwid() {
        return hwid;
    }

    public void setHwid(String hwid) {
        this.hwid = hwid;
    }

    public String getUid() {
        return uid;
    }

    public void setUid(String uid) {
        this.uid = uid;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public ArrayList<String> getOwnedClient() {
        return ownedClient;
    }

    public void setOwnedClient(ArrayList<String> ownedClient) {
        this.ownedClient = ownedClient;
    }

    public String getSession() {
        return session;
    }

    public void setSession(String session) {
        this.session = session;
    }
}
