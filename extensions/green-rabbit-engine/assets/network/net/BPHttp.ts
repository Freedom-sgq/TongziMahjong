import * as cc from 'cc';
import {BPSingletonBase} from "../../struct/BPSingletonBase";
import {BPLog} from "../../util/BPLog";

export class BPHttp extends BPSingletonBase {
    public get(url: string, paramObj: {[key: string]: any}, succCb?: Function, errCb?: Function): void {
        const paramStr = this._joinParams(paramObj);
        url = url + paramStr;
        BPLog.net(`http url: ${url}`);

        this._doReq(url, "GET", paramStr, succCb, errCb);
    }

    public post(url: string, paramObj: {[key: string]: any}, succCb?: Function, errCb?: Function): void {
        const paramStr = JSON.stringify(paramObj);
        this._doReq(url, "POST", paramStr, succCb, errCb);
    }

    private _doReq(url: string, proto: "GET" | "POST", paramStr: string, succCb: Function, errCb?: Function): void {
        const maxCount = 3;
        let curCount = 0;
        const timeout = 3000;
        const Req = () => {
            ++curCount;
            if (curCount > maxCount) {
                errCb && errCb(true);
                return;
            }

            let xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4 && (xhr.status >= 200 && xhr.status < 400)) {
                    let rsp = xhr.responseText;
                    try {
                        rsp = JSON.parse(rsp);
                    } catch (e) {
                        cc.error(e);
                        errCb && errCb(rsp);
                        return;
                    }

                    succCb && succCb(rsp);
                }
            };

            xhr.onerror = function() {
                errCb && errCb("req error!");
            };

            xhr.open(proto, url, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.timeout = timeout;
            xhr.ontimeout = Req;
            xhr.send(proto === "POST" ? paramStr || null : null);
        };

        Req();
    }

    private _joinParams(paramObj: {[key: string]: any}): string {
        if (!paramObj) return "";

        const keys = Object.keys(paramObj);
        const len = keys.length;
        keys.sort();
        let str = "";
        for (let i = 0; i < len; i++) {
            const k = keys[i];
            let v = paramObj[k];
            if (v && typeof v === "object") {
                v = JSON.stringify(v);
            }

            str += `&${k}=${v}`;
        }

        str = str.slice(1);
        str && (str = "?" + str);

        return str;
    }
}