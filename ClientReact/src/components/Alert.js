import React from 'react';
import { setAlert } from '../redux/slices/alertSlice';
import { useDispatch, useSelector } from 'react-redux';
import { alert_btn, alert_m } from '../constants/bootStrapStyles';

const Alert = () => {
    const alert = useSelector(state => state.alert.alert);
    const dispatch = useDispatch();
    return (
        <div className={alert_m}>{alert}
            <button className={alert_btn} onClick={() =>dispatch( setAlert(""))}>OK</button>
        </div>
    );
}

export default Alert;
