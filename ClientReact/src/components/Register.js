import React, { useContext } from 'react';
import { app_context } from '../constants/context';
import { checkString, recreatewebSocket } from '../constants/functions';
import { setAlert } from '../redux/slices/alertSlice';
import { setName } from '../redux/slices/nameSlice';
import { useDispatch, useSelector } from 'react-redux';
import { reg_form, reg_lbl, reg_lbl_3, reg_lbl_4, reg_lbl_4_w, reg_lbl_8, reg_lbl_m, reg_lbl_s } from '../constants/bootStrapStyles';
import { createAccountITxt, loginBTxt, loginITxt, loginPlacehTxt, mailITxt, mailPlacehTxt, nameITxt, namePlacehTxt, passwordITxt, passwordPlacehTxt, sernameITxt, sernamePlacehTxt } from '../constants/elementsText';


const Register = () => {
    const { webSocket } = useContext(app_context);
    const showText = useSelector(state => state.settings.showText);
    const dispatch = useDispatch();
    const userName = React.createRef();
    const secondName = React.createRef();
    const mail = React.createRef();
    const login = React.createRef();
    const password = React.createRef();
    //webSocket.onopen();
    let createAccount = (e) => {
        e.preventDefault();
        var simplecharRegex = /^[a-zA-Z0-9]*$/;
        if (!checkString(login.current.value, simplecharRegex)) {
            setAlert('Enter correct nick name!');
            return;
        }
        try {
            if (webSocket.readyState !== 1) {
                setAlert('Socket close, can not enter the chat');
                recreatewebSocket(webSocket);
                dispatch(setName(""));
                return;
            }
            let user = {
                name: userName.current.value,
                secondName: secondName.current.value,
                mail: mail.current.value,
                login: login.current.value,
                password: password.current.value
            }
            console.log("::register|" + JSON.stringify(user));
            webSocket.send("::register|" + JSON.stringify(user));
            dispatch(setName(login.current.value));
        } catch (error) {
            setAlert('Socket close, can not enter the chat');
            dispatch(setName(""));
            return;
        }
    }
    return (
        <form className={reg_form} onSubmit={(e) => createAccount(e)}>
            <div className='input-group-mb-2'>
                <label className={reg_lbl} htmlFor='userName'>{nameITxt[0]} </label>
                <input required={true} className='rounded col-7' id='userName' placeholder={showText?namePlacehTxt[0]:""} ref={userName}></input>
            </div>
            <div className='input-group-mb-2'>
                <label className={reg_lbl_s} htmlFor='secondname'>{sernameITxt[0]} </label>
                <input required={true} className='rounded col-6' name='secondname' placeholder={showText?sernamePlacehTxt[0]:""} ref={secondName}></input>
            </div>
            <div className='input-group-mb-2'>
                <label className={reg_lbl_m} htmlFor='mail'>{mailITxt[0]} </label>
                <input required={true} type='email' className='rounded col-10' name='mail' placeholder={showText?mailPlacehTxt[0]:""} ref={mail}></input>
            </div>
            <div className='input-group-mb-2'>
                <label className={reg_lbl_3} htmlFor='login'>{loginITxt[0]} </label>
                <input required={true} className='col-9 rounded' name='login' placeholder={showText?loginPlacehTxt[0]:""} ref={login}></input>
            </div>
            <div className='input-group-mb-2'>
                <label className={reg_lbl_4} htmlFor='password'>{passwordITxt[0]}</label>
                <input required={true} type='password' className='rounded col-8' name='password' placeholder={showText?passwordPlacehTxt[0]:""} ref={password}></input>
            </div>
            <button className={reg_lbl_8} type='submit'>{createAccountITxt[0]}</button>
            {/* //type='submit' */}
            <button className={reg_lbl_4_w} onClick={() => dispatch(setName(""))}>{loginBTxt[0]}</button>
        </form>
    );
}

export default Register;
