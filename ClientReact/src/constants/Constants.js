
export const host = 'ws://127.0.0.1:3015'
export const resources = [
    'https://stackoverflow.com/questions/65770908/how-to-change-choose-file-text-using-bootstrap-5',
    'https://www.w3schools.com/html/tryit.asp?filename=tryhtml_images_background8',
    'https://www.w3schools.com/tags/att_input_type_color.asp#:~:text=The%20%3Cinput%20type%3D%22color,tag%20for%20best%20accessibility%20practices!',
    'https://stackoverflow.com/questions/14976867/how-can-i-bind-serversocket-to-specific-ip',
    'https://www.w3schools.com/howto/howto_js_draggable.asp',
    'https://www.iconfinder.com/search/icons?family=freemium-crafted-icon',
    'https://stackoverflow.com/questions/24112096/how-to-make-printwriter-overwrite-old-file',
    'https://stackoverflow.com/questions/13797262/how-to-reconnect-to-websocket-after-close-connection',
    'https://stackoverflow.com/questions/53294938/simple-example-on-how-to-use-websockets-between-client-and-server',
    'https://stackoverflow.com/questions/28889826/how-to-set-focus-on-an-input-field-after-rendering',
    'https://www.iconfinder.com/icons/993808/doll_matreshka_mother_russia_icon',
    'https:stackoverflow.com/questions/13797262/how-to-reconnect-to-websocket-after-close-connection',
    'https://stackoverflow.com/questions/43163592/standalone-websocket-server-without-jee-application-server',
    'https://stackoverflow.com/questions/20726174/placeholder-for-contenteditable-div',
    'https://stackoverflow.com/questions/21501413/read-binary-data-from-an-image-and-save-it-with-javascript',
    'https://stackoverflow.com/questions/56695231/how-do-you-remove-text-without-affecting-child-elements', '//https://stackoverflow.com/questions/32556664/getting-byte-array-through-input-type-file', 'https://www.iconfinder.com/Icojam'
];
export const controls_messages = [
    'To send messages use button "send message."',
    'To delete some part of message just click on it.',
    'You can send icons by click "icons" button and select icon.',
    'Upload you icons if you want:',
    'Click "add new", insert sibvol like "%&^%" or simply name and paste image link, then click "Save" and done!',
    'If you want send file click to "Choose file" and select file, then upload will start and you will see progress in top of main window',
    'You can drag main window by click and drag button "O" or resize image by drag right bottom corner','Resources --> Links to resources i use to create this application',
    'Logout --> click to logout chat, or you can simply refresh this page'];
export const url = new URL(host, window.location.href);

export const message_style = '-sm rounded border border-light';

export const matreshka = { simvol: ' -@#&- ', src: 'https://cdn3.iconfinder.com/data/icons/free-icons-3/512/red_matreshka_big.png' }

export let icons = [matreshka];
export const mimeCodec = 'video/mp4; codecs="avc1.4d002a"'
//'video/webm;codecs=vp8'
//video/ogg
//video/quicktime
//'video/webm'
//video/webm; codecs=vp8
//'video/mp4';
//video/webm; codecs="vp8, vorbis"
//video/mp4; codecs="avc1.42E01E, mp4a.40.2"
//video/mp4; codecs="avc1.64002A, mp4a.40.2"
//video/mp4; codecs="avc1.64000d,mp4a.40.2"
export const setIcons = (new_icons) => {
    icons = new_icons;
    return icons;
}