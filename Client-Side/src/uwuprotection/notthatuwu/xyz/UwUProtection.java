package uwuprotection.notthatuwu.xyz;

import javafx.application.Application;
import javafx.stage.Stage;
import org.apache.commons.io.FileUtils;
import uwuprotection.notthatuwu.xyz.authentication.Authentication;
import uwuprotection.notthatuwu.xyz.authentication.User;
import uwuprotection.notthatuwu.xyz.gui.manager.GuiManager;

import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;

public class UwUProtection  extends Application {

    public static User user;

    public static void main(String[] args) {
        launch(args);
    }

    @Override
    public void start(Stage primaryStage) throws IOException {
        GuiManager.init(primaryStage);
        GuiManager.getManager().setScene(GuiManager.getLoginGui());
        GuiManager.getManager().show();
    }
}
