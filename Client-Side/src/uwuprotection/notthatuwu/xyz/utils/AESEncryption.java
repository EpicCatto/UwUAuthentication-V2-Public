package uwuprotection.notthatuwu.xyz.utils;


import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import javax.xml.bind.DatatypeConverter;
import java.nio.charset.StandardCharsets;

public class AESEncryption {


    public static String encrypt(String plainText, String keyBase64, String ivBase64) throws Exception
    {
        byte[] plainTextArray = plainText.getBytes(StandardCharsets.UTF_8);
        byte[] keyArray = DatatypeConverter.parseBase64Binary(keyBase64);
        byte[] iv = DatatypeConverter.parseBase64Binary(ivBase64);

        SecretKeySpec secretKey = new SecretKeySpec(keyArray, "AES");
        Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5PADDING");
        cipher.init(Cipher.ENCRYPT_MODE, secretKey, new IvParameterSpec(iv));
        return DatatypeConverter.printBase64Binary(cipher.doFinal(plainTextArray));
    }

    public static String decrypt(String messageBase64, String keyBase64, String ivBase64) throws Exception {

        byte[] messageArray = DatatypeConverter.parseBase64Binary(messageBase64);
        byte[] keyArray = DatatypeConverter.parseBase64Binary(keyBase64);
        byte[] iv = DatatypeConverter.parseBase64Binary(ivBase64);

        SecretKey secretKey = new SecretKeySpec(keyArray, "AES");
        Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5PADDING");
        cipher.init(Cipher.DECRYPT_MODE, secretKey, new IvParameterSpec(iv));
        return new String(cipher.doFinal(messageArray));
    }

}