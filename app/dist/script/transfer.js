function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

const domain = window.location.hostname;
const newDomain = 'chronobiks.tech';
const oldDomain = 'chronobiks.netlify.app';
const timeListData = encodeURI(btoa(localStorage.getItem('chronobiks-2021-v1')));
const getTimeListData = getParameterByName('transfer-data');
let url = window.location.href;
if(domain == oldDomain) {
    if(localStorage.getItem('chronobiks-2021-v1') == 'false') {
        location.href = 'https://' + newDomain + '/?new-user=true'; 
    } else {
        location.href = 'https://' + newDomain + '/?transfer-data=' + timeListData + '&status=success'; 
    }
}

if(domain == newDomain) {
    if(localStorage.getItem('chronobiks-2021-v1') == 'false') {
        localStorage.setItem('chronobiks-2021-v1', atob(getTimeListData));        
    } else if(url.includes('status=success')) {
        location.href = '/?transfer_success=true'
    }
}