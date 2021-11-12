package uwuprotection.notthatuwu.xyz.gui.controller;

import javafx.fxml.FXML;
import javafx.fxml.Initializable;
import javafx.scene.control.Button;
import javafx.scene.control.ComboBox;
import javafx.scene.control.TextField;
import uwuprotection.notthatuwu.xyz.handler.impl.InstallerMenuHandler;
import uwuprotection.notthatuwu.xyz.handler.impl.LoginMenuHandler;

import java.awt.*;
import java.net.URL;
import java.util.ResourceBundle;

public class InstallerMenuGui extends Component implements Initializable {
    private static InstallerMenuGui instance;

    @FXML
    public ComboBox<String> comboBox;

    @FXML
    public Button installButton;

    @FXML
    public Button fileButton;

    @FXML
    public TextField fileLocField;

    @FXML
    public javafx.scene.control.TextArea logsTextArea;

    @Override
    public void initialize(URL location, ResourceBundle resources) {
        instance = this;
        new InstallerMenuHandler().initialize(location, resources, this);
    }

    public void onInstallClicked() throws Exception {
        InstallerMenuHandler.getInstance().onInstallClicked();
    }

    public void onFilesClicked() throws Exception {
        InstallerMenuHandler.getInstance().onFilesClicked();
    }

    public static InstallerMenuGui getInstance() {
        return instance;
    }
}
