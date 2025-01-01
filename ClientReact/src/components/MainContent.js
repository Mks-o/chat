import React, { useContext } from 'react';

import { app_context } from '../constants/context';
import { checkMessage, date, send_file, textColor } from '../constants/functions';
import { icons } from '../constants/Constants';
import { setAlert } from '../redux/slices/alertSlice';
import { useDispatch, useSelector } from 'react-redux';
import { setProgress } from '../redux/slices/progressSlice';
import { setMessage, setMessageHistory, setRecieveMessage } from '../redux/slices/messageSlice';
import { createIcon, setshowIcons } from '../redux/slices/iconsSlice';
import { setShowVideo } from '../redux/slices/settingsSlice';
import { m_card_h_m, m_icon_b, m_send_b, m_text, m_video_b } from '../constants/bootStrapStyles';
import { icon_icon, send_file_icon, send_icon, video_icon } from '../constants/form_Icons';
import { addImgTxt, saveImgTxt, sendFileTxt, sendMessTxt, simvolPlaseholderTxt, srcPlaseholderTxt, videoTxt, welcomeTxt } from '../constants/elementsText';
import { iconsTxt } from './../constants/elementsText';

const MainContent = () => {
  const name = useSelector(state => state.name.name);
  const color = useSelector(state => state.color);
  const message = useSelector(state => state.message);
  const icon = useSelector(state => state.icon);
  const showVideo = useSelector(state => state.settings.showVideo);

  const showText = useSelector(state => state.settings.showText);
  const showAllIcons = useSelector(state => state.settings.showAllIcons);

  const dispatch = useDispatch();
  const { webSocket } = useContext(app_context)
  
  let current_message = "";
  current_message = message.recieveMessage;
  
  webSocket.onerror = (event) => {
    dispatch(setMessageHistory((date(new Date()) + " Server: error! connection was closed " + event.data)));
    dispatch(setRecieveMessage(''));
    dispatch(setshowIcons(false));
    dispatch(setMessage(false));
  }
  
  const sendMessage = async () => {
    if (current_message && current_message !== " ") {
      dispatch(setMessageHistory((date(new Date()) + " " + name + ": " + current_message)));
      webSocket.onopen(current_message);
    }
    dispatch(setshowIcons(false));
    dispatch(setRecieveMessage(""));
  }
  const addNewImage = () => {
    let icon_object = {
      simvol: icon.image.simvol,
      src: icon.image.src
    }
    if (icons.find(x => x.simvol === icon_object.simvol)) {
      icon_object.simvol = new Date().getMilliseconds() + icon_object.simvol;
    }
    if (icons.find(x => x.src === icon_object.src||x.simvol === icon_object.simvol)) {
      setAlert("Can't add icon. This icon already loaded!")
      return;
    }
    if (icon_object.src && icon_object.simvol && icon_object.simvol !== "" && icon_object.src !== "") {
      dispatch(setMessageHistory((date(new Date()) + " " + name + ": send icon " + icon_object.simvol)));
      webSocket.onopen("::new_icon::" + JSON.stringify(icon_object));
    }
    dispatch(createIcon({ show: false, src: "", simvol: "" }));
    dispatch(setshowIcons(false));
  }
  return <div className={m_card_h_m}>
    <p>{showText?welcomeTxt[0]:""}<label className={'ms-1 badge  ' + textColor(color.colorSecond)} style={{ backgroundColor: color.colorSecond }}>{name}</label></p>
    <div
      contentEditable={true}
      placeholder="Enter your text here"
      onClick={e => {
        e.preventDefault();
      }}
      onPaste={event => {
        event.preventDefault()
        const contents = event.clipboardData.getData('text')
        let mess = current_message;
        current_message = mess.substring(0, mess.length - 1) + ' ' + contents;
        dispatch(setRecieveMessage(current_message));
      }}
      onKeyDown={(event) => {
        if (event.key.length === 1) {
          current_message += event.key;
        }
        if (event.key === 'Backspace') {
          //current_message = current_message.substring(0, current_message.length - 1);
        }
        if (event.key === 'Delete') { }
        //console.log('delete')
      }}
      id="entered-text-area"
      suppressContentEditableWarning={true}
      className={m_text + textColor(color.colorSecond)}
      style={{ minHeight: "55px", backgroundColor: color.colorSecond }}>{checkMessage(current_message, undefined, (x) => dispatch(setRecieveMessage(x)))}
    </div>

    <button className={m_send_b} onClick={() => sendMessage()}>{showAllIcons ?send_icon:""}{showText?sendMessTxt[0]:""}
    </button>
    <button className={m_icon_b + textColor(color.colorThird)}
      style={{ backgroundColor: color.colorThird }}
      onClick={() => {
        dispatch(setRecieveMessage(current_message))
        dispatch(setshowIcons(!icon.show))
      }}>{showAllIcons ?icon_icon:""}{showText?iconsTxt[0]:""}</button>
      <button className={m_video_b}
      onClick={() => {
        dispatch(setShowVideo(!showVideo))
      }}>{showAllIcons ?video_icon:""}{showText?videoTxt[0]:""}</button>
    <div className="btn">
    <label className="btn btn-info border" htmlFor="file" role="button">{showAllIcons ?send_file_icon:""}{showText?sendFileTxt[0]:""}</label>
    <input id='file' type='file'
      className='d-none'//{m_send_f_b}
      style={{ backgroundColor: color.color }}
      onChange={async (event) => {
        await send_file(event, webSocket,(x)=>dispatch( setProgress(x)), name, (x) => dispatch(setMessageHistory(x)));
      }} />
      </div>
    {icon.show &&
      <div className='col-12 row'>
        <div className='col-6 text-start p-0 m-0'>
          {icons.map((x, i) => <img key={i} alt={i} src={x.src} onClick={() => {
            current_message += x.simvol;
            dispatch(setRecieveMessage(current_message));
          }} />)}
        </div>
        <div className='col-6 text-end'>
          <button className={'btn border border-light w-100 ' + textColor(color.colorSecond)}
            style={{ backgroundColor: color.colorSecond }}
            onClick={(e) => {
              if (icon.image.show) addNewImage();
              else {
                dispatch(createIcon({ show: !icon.image.show, src: icon.image.src, simbol: icon.image.simvol }))
              }
            }}>{icon.image.show === true ? saveImgTxt[0] : addImgTxt[0]}</button>
          {icon.image.show &&
            <div className='text-end'>
              <input type='text'
                onChange={(e) => dispatch(createIcon({ show: icon.image.show, src: icon.image.src, simvol: " &^%" + e.currentTarget.value + "&^% " }))}
                className={'w-100 border-light rounded '  + textColor(color.colorSecond)}
                style={{ backgroundColor: color.colorSecond }}
                placeholder={simvolPlaseholderTxt[0]}></input>
              
              <input onChange={(e) =>
                dispatch(createIcon({ show: icon.image.show, src: e.currentTarget.value, simvol: icon.image.simvol }))}
                style={{ backgroundColor: color.colorSecond }}
                className={'w-100 border-light rounded ' + textColor(color.colorSecond)} type='url' placeholder={srcPlaseholderTxt[0]}></input>
            </div>
          }
        </div>
      </div>
    }
  </div>
}

export default MainContent;
