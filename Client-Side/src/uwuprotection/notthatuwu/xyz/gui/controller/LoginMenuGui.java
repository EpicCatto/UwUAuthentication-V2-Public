package uwuprotection.notthatuwu.xyz.gui.controller;

import javafx.fxml.FXML;
import javafx.fxml.Initializable;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.TextField;
import uwuprotection.notthatuwu.xyz.handler.impl.LoginMenuHandler;

import java.awt.*;
import java.io.IOException;
import java.net.URL;
import java.util.ResourceBundle;

public class LoginMenuGui extends Component implements Initializable {
    private static LoginMenuGui instance;

    @Override
    public void initialize(URL location, ResourceBundle resources) {
        instance = this;
        new LoginMenuHandler().initialize(location, resources, this);
    }

    @FXML
    public TextField sessionTextField;

    @FXML
    public Button loginButton;


    @FXML
    public void onLoginClicked() throws Exception {
        LoginMenuHandler.getInstance().onLoginClicked();
    }

    public static LoginMenuGui getInstance() {
        return instance;
    }

}
