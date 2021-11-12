package uwuprotection.notthatuwu.xyz.gui.manager;

import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.stage.Stage;

import java.io.IOException;
import java.util.Objects;

public class GuiManager {
    private static Stage windows;
    private static Scene login, installer;

    public static void init(Stage stage) throws IOException {
        windows = stage;

        windows.setResizable(false);

        Parent loginGui = FXMLLoader.load(Objects.requireNonNull(GuiManager.class.getResource("fxml/LoginMenu.fxml")));
        Parent installerGui = FXMLLoader.load(Objects.requireNonNull(GuiManager.class.getResource("fxml/InstallerMenu.fxml")));

        login = new Scene(loginGui);
        installer = new Scene(installerGui);
    }

    public static Stage getManager() {
        return windows;
    }

    public static Scene getLoginGui() {
        windows.setTitle("Authentication");
        return login;
    }

    public static Scene getInstaller() {
        windows.setTitle("UwUProtectionV2");
        return installer;
    }
}
