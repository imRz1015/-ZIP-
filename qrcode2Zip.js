
/**
 * qrcode2Zip
 * created by TANGIMING
 * date:2019-04-26
 * 
 * 纯前端将json数据批量生成二维码，可以为二维码添加自定义文字，并且打包压缩最后下载为zip压缩文件
 * 需要借助jszip 、 file-saver 、 qrcode  三个工具
 * 
 * 注意：
 * 测试可在node环境下运行，但请勿在生产环境中使用，node对canvas的支持在linux下是不兼容的，原因在于centOS中gcc版本问题可能导致服务器崩溃
 * 测试支持IE10+ 、 chrome 、FireFox 、Safari
 * 
 * example:
 * const zip = new qrcode2Zip(data);
 * zip.down();
 */
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import qrcode from 'qrcode';
const data = [{ url: 'http://www.demo.com?id=1', text: 'testText1' },]

export default class qrcode2Zip {
    data: [];
    private zip: null,
    private flag: 0,

    constructor(data) {
        super();
        this.data = data;
        /**  
         * watch ' flag ' ,if true , start download zip
         *   if you use Vue , defineProperty is not necessary, use prop 'watch' instead
        */
        Object.defineProperty(this, 'flag', {
            set: function (currentValue) {
                if (currentValue === this.data.length) {
                    this.zip.generateAsync({ type: 'blob' }).then(
                        content => {
                            saveAs(content, 'demo.zip');
                            this.data = [];
                            this.zip = null;
                            this.flag = 0;
                        }
                    )
                }
            }
        })
    }
    public down(data = []) {
        if (!data || data.length || !(data instanceof Array)) {
            return new Error('data expected Array ')
        }
        this.zip = new JSZip();
        data.forEach(item => {
            qrcode.toDataURL(item.url, { margin: 1, width: 500, height: 500 },
                async (err, url) => {
                    let base64 = url.split(',');
                    let result = await this.loadImg(base64, item.text)
                    zip.file(`${data.text}.jpg`, result.split(',')[1], { base64: true });
                    this.flag++;
                })
        })

    },
    /**
     * 
     * use Promise dispose Image onload event , sure that this picture has been loaded
     */
    private loadImg(url, text) {
        return new Promise(resolve => {
            let canvas = document.createElement('canvas');
            canvas.width = 500;
            canvas.height = 580;
            let bg = canvas.getContext('2d');
            bg.fillStyle = '#fff';
            bg.fillRect(0, 0, 500, 580);
            let cxt = canvas.getContext('2d');
            cxt.font = '28px Microsoft Yahei';
            cxt.textBaseline = 'middle';
            cxt.textAlign = 'center';
            cxt.fillStyle = '#000';
            let img = new Image();
            img.src = url;
            img.onload = () => {
                cxt.drawImage(img, 0, 0, 500, 500);
                cxt.fillText(text, 250, 540);
                let result = canvas.toDataURL('image/jpeg');
                resolve(result);
            }
        }, reject => { })
    }
}



