package uwuprotection.notthatuwu.xyz.handler.impl;

import javafx.application.Platform;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import uwuprotection.notthatuwu.xyz.UwUProtection;
import uwuprotection.notthatuwu.xyz.authentication.Authentication;
import uwuprotection.notthatuwu.xyz.authentication.User;
import uwuprotection.notthatuwu.xyz.gui.controller.InstallerMenuGui;
import uwuprotection.notthatuwu.xyz.gui.controller.LoginMenuGui;
import uwuprotection.notthatuwu.xyz.gui.manager.GuiManager;
import uwuprotection.notthatuwu.xyz.handler.Handler;
import uwuprotection.notthatuwu.xyz.utils.HWID;

import javax.swing.*;
import java.net.URL;
import java.util.ArrayList;
import java.util.Objects;
import java.util.ResourceBundle;

public class LoginMenuHandler extends Handler {

    private static LoginMenuHandler instance;
    private LoginMenuGui loginMenuGuiInstance;

    public void initialize(URL location, ResourceBundle resources, LoginMenuGui loginMenu) {
        instance = this;
        loginMenuGuiInstance = loginMenu;
    }

    public void onLoginClicked() throws Exception {
        String info = Authentication.getUserInfoFromSession(loginMenuGuiInstance.sessionTextField.getText());
            InstallerMenuHandler.onLog("Authenticating user .....");
            InstallerMenuHandler.onLog("Loading User info...");
            InstallerMenuHandler.onLog("Getting User Info: " + info);
            //JSON parser object to parse read file
            // parsing file "JSONExample.json"
            Object obj = null;
            try {
                obj = new JSONParser().parse(info);
            } catch (ParseException e) {
                e.printStackTrace();
            }

            // typecasting obj to JSONObject
            JSONObject jo = (JSONObject) obj;

            String status = (String) jo.get("status");

            if (status.equals("Success")) {
                String hwid = (String) jo.get("hwid");
                if (!Objects.equals(hwid, HWID.getComputerHWID())) {
                    InstallerMenuHandler.onLog("HWID is invalid automatically update your hwid.");
                    InstallerMenuHandler.onLog("Updating HWID: " + Authentication.changeHWIDFromSession(loginMenuGuiInstance.sessionTextField.getText(), HWID.getComputerHWID()));
                    InstallerMenuHandler.onLog("Updated User Info: " + Authentication.getUserInfoFromSession(loginMenuGuiInstance.sessionTextField.getText()));
                }
                String username = (String) jo.get("username");
                Object uid = (Object) jo.get("uid");
                String discordUser = (String) jo.get("discordUser");
                ArrayList<String> clients = (ArrayList<String>) jo.get("ownedClient");

                UwUProtection.user = new User(username, discordUser, hwid, status, uid.toString(), clients, loginMenuGuiInstance.sessionTextField.getText());
                UwUProtection.user.getOwnedClient().forEach(name -> InstallerMenuGui.getInstance().comboBox.getItems().add(name));
                InstallerMenuGui.getInstance().fileLocField.setText(HWID.OSHelper.getOS().getMc());

                GuiManager.getManager().setScene(GuiManager.getInstaller());
            } else {
                String reason = (String) jo.get("reason");
                System.err.println(info);
                JOptionPane.showMessageDialog(null, reason);
            }
    }

    public static LoginMenuHandler getInstance() {
        return instance;
    }

}
