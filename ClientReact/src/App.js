import './App.css';
import React, { useEffect } from 'react';
import { app_context } from './constants/context';
import NameComponent from './components/NameComponent';
import HistoryComponent from './components/HistoryComponent';
import MainContent from './components/MainContent';
import { mimeCodec, setIcons, url } from './constants/Constants';
import { createWebSocket, date, downloadFile, dragElement, recreatewebSocket, textColor } from './constants/functions';
import Alert from './components/Alert';
import Register from './components/Register';
import { useDispatch, useSelector } from 'react-redux';
import { setAlert } from './redux/slices/alertSlice';
import { setProgress } from './redux/slices/progressSlice';
import { changeMessageStatus, setMessageHistory, setRecieveMessage } from './redux/slices/messageSlice';
import { setShowVideo } from './redux/slices/settingsSlice';
import { disconect_prefix, file_end_load, file_exists, file_prefix, icons_prefix, limit_msg, stream_end, stream_start, video_end_prefix, video_prefix } from './constants/controls';
import { btn_d_6, btn_s_6, m_card, m_card_h, mov_btn, prog_s, video_s } from './constants/bootStrapStyles';
import { playTxt, stopTxt } from './constants/elementsText';
import { setName } from './redux/slices/nameSlice';

let webSocket = createWebSocket(url);

var mediaSource = new MediaSource();
var sourceBuffer = null;
let source_buffer_update_id = 0;

var reader = new FileReader();
let videoCunks = [];
let isVideoCreated = false;

function App() {
  const progress = useSelector(state => state.progress.progress)
  const color = useSelector(state => state.color);
  const alert = useSelector(state => state.alert.alert);
  const name = useSelector(state => state.name.name);
  const showVideo = useSelector(state => state.settings.showVideo);
  const dispatch = useDispatch();

  useEffect(() => {//when close page
    if (webSocket.CLOSED || webSocket.CLOSING) 
      recreatewebSocket(webSocket);
    
    const unloadCallback = (event) => {
      event.preventDefault();
      try {
        webSocket.onopen("disconect");
        webSocket.close();
      } catch (error) {
        console.log(error.message);
      }
      webSocket.close();
      return "";
    };
    window.addEventListener("beforeunload", unloadCallback);
    return () => window.removeEventListener("beforeunload", unloadCallback);

  }, []);
  console.log(webSocket);

  useEffect(() => {
    // Listen for incoming messages from the server
    webSocket.onmessage = (event) => {
      try {
        if (event && event.data) {
          if (event.data.includes(disconect_prefix)) disconect(dispatch);
          if (webSocket.fileData.filename !== "" && event.data.includes(file_exists)) {
            webSocket.fileData.fileExists = true;
          }
          if (webSocket.fileData.readFile) {
            if (event.data.includes(file_end_load)) {
              const byteArray = [...webSocket.fileData.data];
              let blob = downloadFile(webSocket.fileData.filename, [...byteArray], webSocket.fileData.content_type);
              dispatch(setMessageHistory((date(new Date()) + " " + webSocket.fileData.clientname + ": file " + webSocket.fileData.filename + " " + blob.href + '|' + blob.download)));
              webSocket.clear();
              webSocket.fileData.readFile = false;
              dispatch(setProgress(0));
            }
            else if (event.data.length !== 0) {
              let d = Uint8Array.from(atob(event.data.toString()), c => c.charCodeAt(0))
              webSocket.fileData.data.push(d);
              dispatch(setProgress((webSocket.fileData.data.length / webSocket.fileData.filelength * 100).toFixed(2)));
            }
          }
          if (event.data.startsWith(video_prefix)) {
            dispatch(setShowVideo(true));
            let x = event.data.toString().split(video_prefix)[1];
            let d = atob(x).split(',');
            var arrayBuffer = new ArrayBuffer(d.length);
            var bufferView = new Uint8Array(arrayBuffer);
            for (let i = 0; i < d.length; i++) {
              bufferView[i] = d[i];
            }
            addChunks(bufferView);
            return;
          }
          if (event.data.includes(stream_end)) {
            clearInterval(source_buffer_update_id);
            try {
              mediaSource.endOfStream();
              sourceBuffer = null;
              videoCunks = [];
            } catch (error) {

            }
            dispatch(setMessageHistory(date(new Date()) + " stream ended"));
            stop();
            return;
          }
          if (event.data.startsWith(file_prefix)) {
            webSocket.fileData.readFile = true;
            let filedata = event.data.split(file_prefix)[1];
            webSocket.fileData.filename = filedata.split("::")[0] || ""
            webSocket.fileData.content_type = filedata.split("::")[1] || ""
            webSocket.fileData.clientname = filedata.split("::")[2] || ""
            webSocket.fileData.filelength = filedata.split("::")[3] || ""
            webSocket.fileData.data = []
            if (webSocket.fileData.filename === "") webSocket.clear();
          }
          if (event.data.startsWith(icons_prefix)) {
            let icons = JSON.parse(event.data.split(icons_prefix)[1]);
            setIcons(icons);
            dispatch(changeMessageStatus());
            return;
          }
          else if (!webSocket.fileData.readFile && !event.data.includes(file_end_load) && !event.data.includes(video_prefix) && event.data.length < limit_msg) {
            dispatch(setMessageHistory(date(new Date()) + " " + event.data));
          }
          dispatch(changeMessageStatus());
        }
      } catch (error) {
        setAlert("Effect message " + error.message);
      }
    }
  });

  //#region //video block
  const addChunks = (chunk) => {
    let z = new Blob([chunk], { type: mimeCodec });
    let reader2 = new FileReader();
    reader2.onloadend = () => {
      let arr = new Uint8Array(reader2.result);
      videoCunks.push(arr);
    }
    reader2.readAsArrayBuffer(z);
    if (!isVideoCreated) {
      createSecondVideo();
      isVideoCreated = true;
    }
    //############option 1 with splash################
    // var video = document.getElementById("video");
    // let gCurrentTime = video.currentTime;
    // var thisBlob = new Blob(videoCunks, { type: mimeCodec });
    // var video_url = URL.createObjectURL(thisBlob);
    // video.src = video_url;
    // video.currentTime = gCurrentTime;
  }

  let createSecondVideo = () => {
    console.log("create");
    var video = document.getElementById("video");

    mediaSource = new MediaSource();
    sourceBuffer = null;
    videoCunks.splice(1, 1);
    video.autoplay = true;
    video.controls = true;
    video.srcObject = null;

    video.src = URL.createObjectURL(mediaSource);
    mediaSource.onsourceopen = async () => {
      sourceBuffer = mediaSource.addSourceBuffer(mimeCodec);
      source_buffer_update_id = setInterval(() => {
        try {
          if (mediaSource.readyState === 'ended' || !showVideo) {
            //console.log(mediaSource?.readyState);
            //videoCunks = [];
            clearInterval(source_buffer_update_id);
            stop();
            return;
          }
          if (sourceBuffer !== null && videoCunks.length > 0)
            sourceBuffer?.appendBuffer(videoCunks?.shift());

        } catch (error) {
          console.log(error.message);
          //dispatch(setAlert("Create video "+error.message))
          videoCunks = [];
          clearInterval(source_buffer_update_id);
          stop();
        }
      }, 500)
    }
  }

  let ShareAndSend = async () => await navigator.mediaDevices.getDisplayMedia({
    audio: true,
    video: true,
    width: 250,
    height: 250,
    selfBrowserSurface: "include",
  }).then(stream => {
    let video = document.getElementById('video')
    if (video.srcObject != null && video.srcObject !== "") return;
    video.srcObject = stream;
    video.onloadedmetadata = () => { video.play(); }
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: mimeCodec,
      width: 250,
      height: 250,
      framerate: 30
    })
    videoCunks = [];
    clearInterval(source_buffer_update_id);
    webSocket.send(stream_start);
    reader.onloadend = async () => {
      if (!showVideo) return;
      var arr = btoa(new Uint8Array(reader.result));
      //console.log(arr);
      const filesize = arr.length;//total reader result bytes length
      let size = 16 * 1024;//size of 1 chunk
      const chunksSize = Math.ceil(filesize / size);// chunks count
      console.log("total chunks size is %s file size: %s", chunksSize, filesize);
      let chunks = [];
      webSocket.send(video_prefix)
      for (let i = 0; i < filesize; i += size) {
        let start = i;
        let end = i + size > filesize ? filesize : i + size;
        let d = arr.slice(start, end)
        chunks.push(d);
      }
      chunks.push(video_end_prefix);
      chunks.map((value, index) =>
        setTimeout(() => {
          if (showVideo)
            webSocket.send(value)
        }, 0.2 * index))
    };
    mediaRecorder.ondataavailable = (event) => {
      try {
        reader.readAsArrayBuffer(event.data);
      } catch (error) {
        reader = new FileReader();
        mediaSource = new MediaSource();
        sourceBuffer = null;
        console.log(error.message)
      }
    }
    mediaRecorder.start(500);
  }).catch((error) => {
    console.log(error.message);
    dispatch(setAlert("Share " + error.message))
    stop();
  });

  const stop = () => {
    let video = document.getElementById('video')
    try {
      try {
        if (mediaSource && mediaSource.readyState === "open")
          mediaSource.endOfStream();
      } catch (error) {
        console.log(error.message);
        //dispatch(setAlert("video.srcObject " + error.message))
      }
      if (video.srcObject !== null || video.srcObject !== "") {
        let tracks = video.srcObject?.getTracks();
        if (tracks)
          tracks.forEach(track => track?.stop());
      }
      video.srcObject = null;
    } catch (error) {
      console.log(error.message);
      //dispatch(setAlert("video.srcObject " + error.message))
    }
    try {
      video.src = null;
      mediaSource = null;
      sourceBuffer = null
      videoCunks = [];

    } catch (error) {
      console.log(error.message);
      clearInterval(source_buffer_update_id);

      //dispatch(setAlert("sourceBuffer " + error.message))
    }

    isVideoCreated = false;
    dispatch(setShowVideo(false));
    webSocket.send(stream_end)
  }

  //#endregion

  let disconect = () => {
    if (webSocket.OPEN) {
      try {
        webSocket.send("disconect");
      } catch (error) {
        console.log("disconect " + error.message)
      }
    }
    webSocket.close();
    webSocket = createWebSocket(url);

    dispatch(setShowVideo(false));
    dispatch(setRecieveMessage(""));
    dispatch(setName(''));
  }

  return (
    <app_context.Provider value={{
      webSocket, disconect
    }}>
      <div className="App">
        <div className={m_card + textColor(color.color)}
          id='mainwindow'
          style={{ position: "absolute", backgroundColor: color.color }}
          onClick={() =>
            dragElement(document.getElementById("mainwindow"))}>

          {showVideo && <div className='d-flex row p-0 m-0'>
            <video className={video_s} id="video"></video>
            <div className={btn_s_6} onClick={() => ShareAndSend()}>{playTxt[0]}</div>
            <div className={btn_d_6} onClick={() => stop()}>{stopTxt[0]}</div>
          </div>}
          <div className={m_card_h}>
            <label className={mov_btn} id='mainwindowheader' tabIndex="-1">O</label>
            <div className={prog_s} style={{ width: progress + "%" }}>{progress + "%" + (webSocket.fileData.filelength > 0 ? (webSocket.fileData.data.length - webSocket.fileData.filelength) + "b" : "") + " Loading...."}</div>
            {name === "" ? <NameComponent /> :
              name === "Register" ? <Register /> :
                progress <= 0 && <MainContent />}
            {alert !== "" && <Alert />}
          </div>
          <HistoryComponent />
        </div>
      </div>
    </app_context.Provider>
  );
}

export default App;

