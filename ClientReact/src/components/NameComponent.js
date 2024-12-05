import React, { useContext, useRef } from 'react';
import { app_context } from '../constants/context';
import { checkString, recreatewebSocket, textColor } from '../constants/functions';
import { setAlert } from '../redux/slices/alertSlice';
import { useDispatch, useSelector } from 'react-redux';
import { setName } from '../redux/slices/nameSlice';
import { name_b, name_log, name_reg } from '../constants/bootStrapStyles';
import { loginBTxt, loginPlaseholderTxt, passwordPlaseholderTxt, registerBTxt } from '../constants/elementsText';

const NameComponent = () => {
    const { webSocket } = useContext(app_context);

    const color = useSelector(state => state.color);
    const showText = useSelector(state => state.settings.showText);
    const dispatch = useDispatch();

    const { disconect } = useContext(app_context);
    const password = useRef();
    const userName = useRef();

    const changeName = () => {
        var simplecharRegex = /^[a-zA-Z0-9]*$/;
        let name = userName.current.value;
        if (!checkString(name, simplecharRegex)) {
            dispatch(setAlert('Enter correct nick name!'));
            return;
        }
        try {
            if (webSocket.readyState !== 1) {
                dispatch(setAlert('Socket close, can not enter the chat'));
                disconect(dispatch);
                dispatch(setName(""));
                //recreatewebSocket(webSocket);
                return;
            }
            webSocket.send("name: " + name + ": " + password.current.value);
            dispatch(setName(name));
        } catch (error) {
            dispatch(setAlert('Socket close, can not enter the chat'));
            dispatch(setName(""));
            recreatewebSocket(webSocket)
            return;
        }
    }
    return (
        <div className='card-header'>
            <input className={name_b + textColor(color.colorSecond)}
                required={true}
                ref={userName}
                style={{ backgroundColor: color.colorSecond }}
                placeholder={(showText?loginPlaseholderTxt[0]:"")}/>
            <input className={name_b + textColor(color.colorSecond)}
                required={true}
                ref={password}
                style={{ backgroundColor: color.colorSecond }}
                placeholder={(showText?passwordPlaseholderTxt[0]:"")}/>
            <button className={name_log} onClick={() => changeName()}>{loginBTxt[0]}</button>
            <button className={name_reg} onClick={
                () => {dispatch(setName("Register"));
                webSocket.onopen("name: ::register:::  ");
                }
                }>{registerBTxt[0]}</button>
        </div>
    );
}

export default NameComponent;
