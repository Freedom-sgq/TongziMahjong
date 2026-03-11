import { BPSingletonBase } from '../struct/BPSingletonBase';
import CryptoJS = require('./3rd/crypto-js.js')

/**
 * @author Tinker
 * @date 
 * @description
 */
export class BPCrypto extends BPSingletonBase {
    /**
     * 
     */
    public init(): void {

    }

    /**
     * md5
     */
    public md5(str: string): string {
        return CryptoJS.MD5(str).toString();
    }

    /**
     * 性能略差于md5, 但碰撞少
     */
    public sha1(str: string): string {
        return CryptoJS.SHA1(str).toString();
    }

    /**
     * 性能较差，碰撞少
     */
    public sha256(str: string): string {
        return CryptoJS.SHA256(str).toString();
    }

    /**
     * base 64加密
     */
    public base64Encode(str: string): string {
        let wordArray = CryptoJS.enc.Utf8.parse(str);
        return CryptoJS.enc.Base64.stringify(wordArray);
    }

    /**
     * base 64解密
     */
    public base64Decode(str: string): string {
        return CryptoJS.enc.Base64.parse(str).toString(CryptoJS.enc.Utf8)
    }

    /**
     * AES 加密
     * @param str 加密信息
     * @param key aes加密的key 密钥, AES-128 需16个字符, '0123456789abcdef'; AES-256 需要32个字符 
     * @param iv  aes加密的iv 密钥偏移量, 16个字符 'abcdef0123456789'
     */
    public aesEncode(str: string, key: string, iv: string): string {
        return CryptoJS.AES.encrypt(str, CryptoJS.enc.Utf8.parse(key), {
            iv: CryptoJS.enc.Utf8.parse(iv),
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        }).toString();
    }

    /**
     * AES 解密
     * @param str 解密字符串
     * @param key aes加密的key 
     * @param iv  aes加密的iv
     */
    public aesDecode(str: string, key: string, iv: string): string {
        const decrypted = CryptoJS.AES.decrypt(str, CryptoJS.enc.Utf8.parse(key), {
            iv: CryptoJS.enc.Utf8.parse(iv),
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });

        return decrypted.toString(CryptoJS.enc.Utf8);
    }

    /**
     * 
     */
    public destroy(): void {

    }
}