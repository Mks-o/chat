import React, { useContext } from 'react';

import { app_context } from '../constants/context';
import { checkMessage, mapLinks, mapsomething, messageColor, textColor } from '../constants/functions';
import { resources, controls_messages as help_controls_messages } from '../constants/Constants';
import { useDispatch, useSelector } from 'react-redux';
import { setColor, setSecondColor, setThirdColor } from '../redux/slices/colorsSlice';
import { setShowAllIcons, setShowText, showControls, showHelp, showRes } from '../redux/slices/settingsSlice';
import { history_l, history_m, m_card_f, settings_b, settings_b_d, settings_b_i, settings_c, settings_h_ul } from '../constants/bootStrapStyles';
import { res_icon, settings_icon, help_icon, logout_icon } from '../constants/form_Icons';
import { controlsTxt, helpInfoTxt, helpTxt, logOutTxt, maincolorTxt, resLinksTxt, resTxt, secondcolorTxt, showIconsBTxt, showTextBTxt, thirdcolorTxt } from '../constants/elementsText';
const HistoryComponent = () => {
  const color = useSelector(state => state.color)
  const name = useSelector(state => state.name.name);
  const messageHistory = useSelector(state => state.message.messageHistory)
  const settings = useSelector(state => state.settings)
  const dispatch = useDispatch();
  const { disconect } = useContext(app_context);

  return (<div className={textColor(color.colorThird)}
    style={{ backgroundColor: color.colorThird }}>
    <ul type='none' className={history_m}>
      {messageHistory.map((message, index) =>
        <li className={history_l + messageColor(message) + " " + textColor(color.colorSecond)}
          style={{ backgroundColor: color.colorSecond }}
          key={index}>
          {checkMessage(message, name)}
        </li>)}
    </ul>
    <div className={m_card_f}>
      <button className={settings_b + textColor(color.colorSecond)}
        style={{ backgroundColor: color.colorSecond }}
        onClick={() => dispatch(showRes(!settings.showRes))}>{settings.showAllIcons ? res_icon : ""}{settings.showText ? resTxt[0] : ""}</button>
      <button className={settings_b_i} onClick={() => dispatch(showHelp(!settings.showHelp))}>{settings.showAllIcons ? help_icon : ""}{settings.showText ? helpTxt[0] : ""}</button>
      <button className={settings_b + textColor(color.colorThird)}
        style={{ backgroundColor: color.colorThird }}
        onClick={() => dispatch(showControls(!settings.showControls))}>{settings.showAllIcons ? settings_icon : ""}{settings.showText ? controlsTxt[0] : ""}</button>

      {/* <button className={settings_b + textColor(color.colorSecond)}
        style={{ backgroundColor: color.colorSecond }}
      >{settings.showAllIcons ? coffee_icon : ""}{settings.showText ? coffeeTxt[0] : ""}</button> */}
      <button className={settings_b_d} onClick={() =>disconect()}>{settings.showAllIcons ? logout_icon : ""}{settings.showText ? logOutTxt[0] : ""}</button>

      {settings.showControls && <div>
        <div className='d-flex'>
          <input type="color"
            className={settings_c}
            onChange={
              (e) => dispatch(setColor(e.currentTarget.value))
            } />
          <p className='ps-2'>{settings.showText ? maincolorTxt[0] : ""}</p>
        </div>

        <div className='d-flex'>
          <input type="color"
            className={settings_c}
            id="secondcolor"
            value={color.colorSecond}
            onChange={
              (e) => dispatch(setSecondColor(e.currentTarget.value))
            } />
          <p className='ps-2'>{settings.showText ? secondcolorTxt[0] : ""}</p>
        </div>

        <div className='d-flex'>
          <input type="color"
            className={settings_c}
            id="thirdcolor"
            value={color.colorThird}
            onChange={
              (e) => dispatch(setThirdColor(e.currentTarget.value))
            } title="Choose your color" />
          <p className='ps-2'>{settings.showText ? thirdcolorTxt[0] : ""}</p>
        </div>
        <div className='form-check'>
          <input type="checkbox"
            className="form-check-input"
            checked={settings.showText}
            id="text"
            onChange={
              () => dispatch(setShowText(!settings.showText))
            } />
          <label className='form-check-label'
            htmlFor='text'>
            {settings.showText ? showTextBTxt[0] : ""}</label>
        </div>
        <div className='form-check'>
          <input type="checkbox"
            className="form-check-input"
            checked={settings.showAllIcons}
            id="text"
            onChange={
              () => dispatch(setShowAllIcons(!settings.showAllIcons))
            } />
          <label className='form-check-label'
            htmlFor='text'>
            {settings.showText ? showIconsBTxt[0] : ""}</label>
        </div>

      </div>}
      {settings.showRes && mapLinks(resources, resLinksTxt[0])}
      {settings.showHelp &&
        <ul type='none' className={settings_h_ul}>
          {mapsomething(help_controls_messages, helpInfoTxt[0])}
        </ul>}
    </div>
  </div>
  );
}

export default HistoryComponent;
