package uwuprotection.notthatuwu.xyz.utils;

import org.json.simple.JSONObject;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLConnection;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.Scanner;

public class URLUtils {
    public static String getTextFromURL(String url) {
        String sex = null;
        try {
            URLConnection connection = (new URL(url).openConnection());
        connection.addRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:25.0) Gecko/20100101 Firefox/25.0");
        BufferedReader in = null;
            in = new BufferedReader(new InputStreamReader(connection.getInputStream()));
        ArrayList response = new ArrayList();

        String currentln;
        while((currentln = in.readLine()) != null) {
            response.add(currentln);
        }

        sex = response.toString();
        } catch (IOException e) {
            e.printStackTrace();
        }
        return sex;

    }

    public static String jsonGetRequest(String urlQueryString) {
        String json = null;
        try {
            URL url = new URL(urlQueryString);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setDoOutput(true);
            connection.setInstanceFollowRedirects(false);
            connection.setRequestMethod("GET");
            connection.setRequestProperty("Content-Type", "application/json");
            connection.setRequestProperty("charset", "utf-8");
            connection.connect();
            InputStream inStream = connection.getInputStream();
            json = streamToString(inStream); // input stream to string
        } catch (IOException ex) {
            ex.printStackTrace();
        }
        return json;
    }
    private static String streamToString(InputStream inputStream) {
        String text = new Scanner(inputStream, "UTF-8").useDelimiter("\\Z").next();
        return text;
    }

}
