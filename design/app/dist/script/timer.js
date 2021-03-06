/**
 *
 *  Developed by Justin Pascual - 2021
 *  Contact: https://fb.me/heychrono
 *  Github: https://github.com/heychrono
 * 
 */
let seconds = 0;
let timeSolved = 0;
let milliseconds = 1;
let isRunning = null;
let isRunTriggered = false;
let isAlreadySecond = null;
let millisecondsDuration = 20;
let storageName = "chronobiks-2021-v1";

const dateObject = new Date();
const currentMonth = dateObject.toLocaleString("default", {
    month: "short"
});
const currentDay = dateObject.getUTCDate();
const currentYear = dateObject.getFullYear();
const currentDateToday = `${currentDay} ${currentMonth} ${currentYear}`;

const timeSolvedElement = document.querySelector("#timeSolved");
const millisecondsElement = document.querySelector("#milliseconds");
const secondsElement = document.querySelector("#seconds");
const timerElement = document.querySelector("#timer");
const runButtonElement = document.querySelector("#runTimer");
const navbar = document.querySelector('.navbar');
const goTriggered = document.querySelector('.go');
const newestTime = document.querySelector('.timer__newest');
let messageGuideElement = document.querySelector('#message-guide');

if (localStorage.getItem(storageName) == null) {
    localStorage.setItem(storageName, false)
}

const changeElementValue = (content, variableName) => {
    return (variableName.textContent = content);
};

const changeElementColor = (textColor, variableName) => {
    return (variableName.style.color = textColor);
};

const addZeroFirstCharacterString = value => {
    return String(value).padStart(2, "0");
};

const htmlEntities = inputValue => {
    return String(inputValue)
        .replace(/&/g, "&amp;")
        .replace(/</g, "")
        .replace(/>/g, "")
        .replace(/"/g, "");
};

const startTimer = lever => {
    return !lever ?
        resetTimerElement() :
        (isRunning = setInterval(updateTimerElement, millisecondsDuration));
};

let timerTrigger = () => {
    isRunTriggered = !isRunTriggered;
    startTimer(isRunTriggered);
};

let getLocalStorageData = storageName => {
    return localStorage.getItem(storageName);
};

const defaultTimeListData = [{
    id: 1,
    time: '00.00',
    date: currentDateToday
}];

let localStorageParse = JSON.parse(getLocalStorageData(storageName));
let oldTimeListData = localStorageParse || '';
let timeListDataStorage = [...oldTimeListData];

// order id of the time list when browser is closed.
let timeListID = 0;
for (let i = 0; i < oldTimeListData.length; i++) {
    timeListID += 1;
    oldTimeListData[i].id = timeListID;
}

let timePerformance = performance => {
    let timeListArray = [];

    if (getLocalStorageData(storageName) == 'false') return '00.00';

    timeListDataStorage.forEach(list => {
        if (!isNaN(list.time)) timeListArray.push(list.time);
    });

    if (performance == "best") {
        return Math.min(...timeListArray);
    }
    return Math.max(...timeListArray);
};

let timePerformanceDate = performance => {
    let performanceDate;

    if (timePerformance() == '00.00') return 'Today';

    if (performance == 'best') {
        timeListDataStorage.forEach(list => {
            if (timePerformance('best') == list.time) performanceDate = list.date;
        });
    } else {
        timeListDataStorage.forEach(list => {
            if (timePerformance('worst') == list.time) performanceDate = list.date;
        });
    }

    return performanceDate;
}

let addTimeToList = () => {
    let solvedTimeList = {};
    let timeListDataStorageCount = timeListDataStorage.length;

    let timeSplit = timeSolved.toString().split(".");

    if (timeSplit[1].length == 1) {
        timeSolved = `${timeSplit[0]}.0${timeSplit[1]}`;
    }

    solvedTimeList["id"] = timeListDataStorageCount += 1;
    solvedTimeList["time"] = parseFloat(htmlEntities(timeSolved));
    solvedTimeList["date"] = htmlEntities(currentDateToday);

    timeListDataStorage.push(solvedTimeList);
    localStorage.setItem(storageName, JSON.stringify(timeListDataStorage));
};

const resetTimerElement = () => {
    lever = false;
    timeSolved = `${seconds}.${milliseconds}`;
    addTimeToList();
    seconds = 0;
    milliseconds = 0;
    clearInterval(isRunning);
    changeElementValue("00", secondsElement);
    changeElementValue("00", millisecondsElement);
};

const updateTimerElement = () => {
    milliseconds++;
    isAlreadySecond = milliseconds == 60;

    if (isAlreadySecond) {
        seconds += 1;
        milliseconds = 00;
        changeElementValue(addZeroFirstCharacterString(seconds), secondsElement);
    }

    changeElementValue(
        addZeroFirstCharacterString(milliseconds),
        millisecondsElement
    );
};

let newestTimeVariable = () => {
    if (getLocalStorageData(storageName) === 'false') return;
    return timeListDataStorage.slice().reverse()[0].time;
}

let newestDateVariable = () => {
    if (getLocalStorageData(storageName) === 'false') return;
    return timeListDataStorage.slice().reverse()[0].date;
}


const updateAll = () => {
    timerTrigger();
    /* reactive update list */
    appList.$data.timeListFromStorage = timeListDataStorage;
    appList.$data.reverseTodayProperty = [...timeListDataStorage.slice().reverse()];
    appList.$data.bestSolvedTimeReactive = timePerformance("best");
    appList.$data.worstSolvedTimeReactive = timePerformance("worst");
    appList.$data.bestSolvedDateReactive = timePerformanceDate("best");
    appList.$data.worstSolvedDateReactive = timePerformanceDate("worst");
    /* reactive update newest */
    appNewest.$data.timeListFromStorage = timeListDataStorage;
    appNewest.$data.newestTime = newestTimeVariable();
    appNewest.$data.newestDate = newestDateVariable();
};

let lastKeyUpAt = 0;
let isTriggered = false;
let modalElement = document.querySelector('#modal');

const pressVerify = (holdDuration = 1000) => {
    var keyDownAt = new Date();

    if (isTriggered == true) {
        isTriggered = false;
        newestTime.classList.remove('timer__newest--timerRunning');
        navbar.classList.remove('navbar--timerRunning');
        messageGuideElement.textContent = 'Hold space or touch and hold anywhere to run the timer';
        updateAll();
    } else {
        setTimeout(() => {
            if (+keyDownAt > +lastKeyUpAt) {
                messageGuideElement.textContent = 'Release space or touch to run the timer';
                newestTime.classList.add('timer__newest--timerRunning');
                navbar.classList.add('navbar--timerRunning')
                goTriggered.classList.remove('go--hide');
                isTriggered = true;
            } else {
                isTriggered = false;
            }
        }, holdDuration);
    }
};

const spaceKeyDown = event => {
    if (event.repeat) return;
    if (sidebar.classList.contains('sidebar--open')) return;
    if (!modalElement.classList.contains('modal--hide')) return;
    if (event.code == "Space") return pressVerify();
};

const spaceKeyUp = event => {
    if (event.code == "Space") {
        goTriggered.classList.add('go--hide');
        lastKeyUpAt = new Date();
        if (isTriggered == true) {
            messageGuideElement.textContent = 'Hit space or touch to stop the timer';
            return updateAll();
        }
    }
};

const mouseClickDown = event => {
    if (event.target.closest("#open-button")) return;
    if (sidebar.classList.contains('sidebar--open')) return;
    if (!modalElement.classList.contains('modal--hide')) return;
    pressVerify();
};

const mouseClickRelease = () => {
    goTriggered.classList.add('go--hide');
    lastKeyUpAt = new Date();
    if (isTriggered == true) {
        messageGuideElement.textContent = 'Hit space or touch to stop the timer';
        return updateAll();
    }
};

const touchDown = event => {
    if (event.repeat) return;
    if (event.target.closest("#open-button") || event.target.closest(".timer__newest")) return;
    if (sidebar.classList.contains('sidebar--open')) return;
    if (!modalElement.classList.contains('modal--hide')) return;
    if (event.touches.length > 1) return lastKeyUpAt = new Date();
    pressVerify();
};

const touchRelease = () => {
    goTriggered.classList.add('go--hide');
    lastKeyUpAt = new Date();
    if (isTriggered == true) {
        messageGuideElement.textContent = 'Hit space or touch to stop the timer';
        return updateAll();
    }
};

// Triggers
document.addEventListener("keydown", spaceKeyDown);
document.addEventListener("keyup", spaceKeyUp);
document.addEventListener("mousedown", mouseClickDown);
document.addEventListener("mouseup", mouseClickRelease);
document.addEventListener("touchstart", touchDown);
document.addEventListener("touchend", touchRelease);

let ifTimeListEmpty = (timeList) => {
    return (timeList.length <= 0) ? defaultTimeListData : timeList;
}

const appList = new Vue({
    el: "#app-list",
    data: {
        todayListCount: 5,
        pastListCount: 5,
        currentDateToday: currentDateToday,
        reverseTodayProperty: ifTimeListEmpty([...timeListDataStorage.slice().reverse()]),
        bestSolvedDateReactive: timePerformanceDate("best"),
        worstSolvedDateReactive: timePerformanceDate("worst"),
        bestSolvedTimeReactive: timePerformance("best"),
        worstSolvedTimeReactive: timePerformance("worst"),
        timeListFromStorage: localStorageParse || defaultTimeListData
    },
    methods: {
        getTimeListCountToday: function () {
            let timeListTodayArray = [];

            timeListDataStorage.forEach(list => {
                if (list.date == this.currentDateToday) {
                    timeListTodayArray.push(list.date);
                }
            });

            return timeListTodayArray.length;
        },
        resetTimeList: function () {
            
        }
    }
});

const appNewest = new Vue({
    el: "#app-newest",
    data: {
        timeListFromStorage: getLocalStorageData(storageName),
        currentDateToday: currentDateToday,
        newestTime: newestTimeVariable(),
        newestDate: newestDateVariable()
    }
})

let generateRandomIndex = (max) => {
    return Math.floor((Math.random() * max) + 0);
}

const generateResetCode = () => {
    const codeCharacters = ['rick', 'morty', 'scooby', 'senku', 'chrono', 'powfu', 'myopi', 'baki', 'kravets'];
    const characterCount = codeCharacters.length;
    return `${codeCharacters[generateRandomIndex(characterCount)]}-${codeCharacters[generateRandomIndex(characterCount)]}-${codeCharacters[generateRandomIndex(characterCount)]}-${codeCharacters[generateRandomIndex(characterCount)]}`;
}

const appReset = new Vue({
    el: '#app-reset',
    data: {
        resetCode: '',
        resetCodeGenerated: generateResetCode()
    },
    methods: {
        resetMyList: function() {
            const resetData = [{
                id: 1,
                time: "Reset, 00:00",
                date: currentDateToday
            }];

            resetTimerElement();
            timeListDataStorage = resetData;
            appList.$data.timeListFromStorage = resetData;
            localStorage.setItem(storageName, JSON.stringify(resetData));
            location.reload();
        }
    }
})

