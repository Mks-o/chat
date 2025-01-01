import { icons, message_style, url } from "./Constants";
import { english, file_end_load, file_prefix } from './controls';

export function mapLinks(collection, title) {
    return <div className="d-block alert border border-dark"> {title}
        {collection.map((x, i) => {
            return <a className="fs-6 ps-3" key={i} target="_blank" rel={"noreferrer"} href={x}>{x.split('/')[5]}</a>
        })}
    </div>
}

export function mapsomething(collection, title) {
    return <div className="d-block alert border border-dark"> {title}
        {collection.map((x, i) => {
            return <p className="fs-6 ps-3 text-light" key={i}>{x}</p>
        })}
    </div>
}

export const date = (date) => date.toLocaleTimeString('en-GB').split('PM')[0].split('AM')[0];

export const checkString = (value, regex) => {
    return value != null && value !== '' && regex.test(value);
}


export function replaceToElement(string, element, replace) {
    if (string === null) return "";
    let res = string.split(element);
    return <span>{res.split(element).join(replace)}</span>;
}

export const checkStyle = (x, name) => {
    if (x.match(/..:../))
        return message_style;
    if (x.match("Server")) {
        return 'bg-info border border-secondary rounded ps-1 pe-1'
    }

    if (x.match(name) && name !== "") {
        return 'bg-warning border border-secondary rounded ps-1 pe-1'
    }
    return 'w-100 ps-1'
}

export const checkMessage = (checked_message, name, setResiveMessage) => {
    let res = checked_message;
    if (!res) return "";
    let seporators = icons.map(x => x.simvol);
    let split = res.split(" ");
    if (split === null || split.length <= 0) {
        console.log("null or empty");
        return res;
    }
    split = split.map((x, i) => {
        let sep = seporators?.find(s => s !== null && x.replaceAll(" ", "") === (s.replaceAll(" ", "")))
        if (sep && sep !== "") {
            return <img key={i} alt='img' src={icons.find(d => d.simvol === sep).src} onClick={() => setResiveMessage ? remove(checked_message, i, setResiveMessage) : null} />
        }
        else if (x.includes('http')) {
            return renderHtml(x, i);
        }
        else if (x !== " " && x !== "") {
            return <span key={i} className={checkStyle(x, name)} onClick={() => setResiveMessage ? remove(checked_message, i, setResiveMessage) : null}>{x.replaceAll("'", "")}</span>
        }
        else return "";
    });
    let container = document.getElementById('container');
    let container2 = document.getElementById('entered-text-area');
    if (container) {
        container.childNodes.forEach(c => {
            c.nodeType === Node.TEXT_NODE && c.remove()
        });
    }
    if (container2) {
        container2.childNodes.forEach(c => {
            c.nodeType === Node.TEXT_NODE && c.remove()
        });
    }
    let r = <div id='container' className='container text-wrap'>{split}</div>;
    return r;
}

let renderHtml = (html, key) => {
    let href = html.split('|')[0];
    let imgFilter = ['.gif', '.ico', '.jpeg', '.png', '.jpg'];
    let soundFilter = ['.wav', '.mp3', '.ogg'];
    let videoFilter = ['.mp4', '.mov'];

    let contentType = html.split('|')[1]?.replaceAll("'", "");
    if (href) {
        if (html.includes("youtube.com/watch?v=")) {
            href = html.replace('watch?v=', 'embed/');
            return <div key={key}>
                <a href={href} target='_blank' rel='noreferrer'>link</a>
                <iframe className="w-100 h-100 border border-dark rounded" src={href} title={contentType}></iframe>
            </div>
        }
        if (imgFilter.find(elem => href.includes(elem)) || imgFilter.find(elem => contentType.includes(elem))) {
            return <div key={key}>
                <a className="ps-2" key={key} href={href} download={contentType} target='_blank' rel='noreferrer'>{contentType ? "download" : "link"}</a>
                <img className="sendedimg border border-dark rounded" src={href} alt={contentType} />
            </div>

        }
        if (soundFilter.find(elem => contentType.includes(elem)) || soundFilter.find(elem => contentType.includes(elem))) {
            return <div key={key}>
                <a className="ps-2" key={key} href={href} download={contentType} target='_blank' rel='noreferrer'>{contentType ? "download" : "link"}</a>
                <audio id="audioPlayer" controls='controls' type={contentType} className="audioPlayer border border-dark rounded w-100" src={href} alt={contentType} />
            </div>

        }
        if (videoFilter.find(elem => contentType?.includes(elem)) || videoFilter.find(elem => contentType.includes(elem))) {
            return <div key={key}>
                <a className="ps-2" key={key} href={href} download={contentType} target='_blank' rel='noreferrer'>{contentType ? "download" : "link"}</a>
                <video controls='controls' className=" border border-dark rounded w-100" src={href} alt={contentType} />
            </div>

        }
    }
    return <div key={key + 3} >
        <a className="ps-2" key={key} href={href} download={contentType} target='_blank' rel='noreferrer'>{contentType ? "download" : "link"}</a>
    </div>
}

let remove = (checked_message, index, setResiveMessage) => {
    let x = checked_message.split(" ");
    x.splice(index, 1);
    setResiveMessage(x.join(" "));
}

async function uploadFile(file, webSocket) {
    const filesize = file.size;
    const size = 58 * 1024; //bytes;
    let chunks = [];
    let file_name = file.name.replaceAll(' ', '');
    if (!english.test(file_name.split('.')[0]))
        file_name = "somefile." + file_name.split('.')[file_name.split('.').length - 1];
    webSocket.fileData.filename = file_name;

    webSocket.send(file_prefix + webSocket.fileData.filename + "::" + (file.type === "" ? "_" : file.type) + "::" + filesize);
    const chunksSize = Math.ceil(filesize / size);
    console.log("total chunks size is %s file size: %s", chunksSize, filesize);
    for (let i = 0; i < filesize; i += size) {
        let start = i;
        let end = i + size > filesize ? filesize : i + size;
        await file.slice(start, end).arrayBuffer().then(data =>
            chunks.push(new Uint8Array(data)));
    }
    chunks.push('::^end^::')
    return chunks;
}

const send = async (chunks, webSocket, setProgress) => {
    for (let i = 0; i < chunks.length; i++) {
        setTimeout(() => {
            setProgress((i / (chunks.length - 1) * 100).toFixed(2))
            if (i === chunks.length - 1) {
                webSocket.fileData.data = [];
                setProgress(0)
            }

            webSocket.send(chunks[i]);
        }, 20 * i);
    }
}

export let send_file = async (event, webSocket, setProgress, clientname, setMessageHistory) => {
    if (!event.currentTarget?.files[0]) return;
    const file_data = event.currentTarget.files[0];
    setProgress(1);
    let file_name = file_data.name.replaceAll(' ', '');
    if (!english.test(file_name.split('.')[0]))//get name with out extension and check it contains only english latters
        file_name = "somefile." + file_name.split('.')[file_name.split('.').length - 1]//get extension of file
    webSocket.fileData.filename = file_name;
    const file = await uploadFile(file_data, webSocket);
    if (webSocket.fileData.fileExists) await send([file_end_load], webSocket, setProgress);
    else await send(file, webSocket, setProgress);
    const f_data = file.slice(0, file.length - 1);
    let blob = downloadFile(file_name, f_data, file_data.type === "" ? "_" : file_data.type);
    setMessageHistory(date(new Date()) + " " + clientname + ": file " + file_name + " " + blob.href + '|' + blob.download);
    webSocket.clear();
    setProgress(0);
}

export let downloadFile = (name, data, content_type) => {
    let link = document.createElement("a");
    if (typeof link.download !== "undefined") link.download = name;
    let blob = new Blob(data, { type: { content_type } });

    link.href = URL.createObjectURL(blob);
    link.textContent = name;
    //a.dispatchEvent(new MouseEvent("click"));
    return link;
}

export const messageColor = (mes) => {
    return (mes.includes('Server: ')) ? 'alert alert-info' : 'alert alert-secondary'
}

export async function fetch_something(url, body_value, method) {
    let headers_values = {
        headers: set_headers(),
        method: method
    }
    if (body_value) headers_values.body = JSON.stringify(body_value)
    //console.log(headers_values);

    const response = await fetch((url), headers_values);
    if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
    }
    const data = await response.json();
    return data;
}

export const set_headers = (auth) => {
    let headers = {
        "Accept": "*/*",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Content-Type": "application/json",
        "Cache-Control": "no-cache"
    }
    if (auth != null) headers.Authorization = auth
    return headers;
}

//www.w3 method
export function dragElement(elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    if (document.getElementById(elmnt.id + "header")) {
        document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
    } else {
        elmnt.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

export let textColor = (color) => {
    const { l } = hexToHSL(color);
    return l > 50 ? "text-dark" : "text-light";
}

function hexToHSL(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    let r = parseInt(result[1], 16);
    let g = parseInt(result[2], 16);
    let b = parseInt(result[3], 16);

    r /= 255;
    g /= 255;
    b /= 255;
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let l = (max + min) / 2;
    l = Math.round(l * 100);

    return { l };
}

export let createWebSocket = () => {
    let fileData = {
        filename: "",
        content_type: "",
        filelength: "",
        clientname: "",
        data: [],
        fileExists: false,
        readFile: false
    }
    let webSocket = new WebSocket(url, "soap", "wamp", "chat");
    webSocket.fileData = fileData;
    webSocket.binaryType = "arraybuffer";
    // webSocket.transfer = new WebSocket(url,  "chat");
    webSocket.clear = () => {
        webSocket.fileData = {
            filename: "",
            content_type: "",
            filelength: "",
            clientname: "",
            data: [],
            fileExists: false,
            readFile: false
        }
    }
    webSocket.onopen = function (mes) {
        if (!webSocket.OPEN) {
            //webSocket.clear();
            return;
        }
        webSocket.send(mes);
    }

    return webSocket;
}

export const recreatewebSocket = (webSocket) => {
    if (!webSocket.OPEN)
        webSocket = createWebSocket();
}