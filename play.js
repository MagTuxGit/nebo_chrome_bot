window.onload = function() {
	readStorageAndRun();
}

// helpers
const baseUrl = 'https://nebo.mobi/';

const textGetMoney = "Собрать выручку!";
const textGetGoods = "Закупить товар";
const textBuyItem = "Закупить за ";
const textPutGoods = "Выложить товар";
const textLiftUp = "Поднять лифт на ";
const textGetTips = "Получить чаевые";
const textLiftAvailable = "Поднять на лифте";

const pages = {
	home: 'home',
	floor: 'floor',
	lift: 'lift',
	getMoney: 'floors/0/5',
	putGoods: 'floors/0/3',
	getGoods: 'floors/0/2'
}

const pagesLinks = {
    'home' : pages.home,
	'floo' : pages.floor,
	'lift' : pages.lift,
	'/floors/0/5' : pages.getMoney,
	'/floors/0/3' : pages.putGoods,
	'/floors/0/2' : pages.getGoods
}

const steps = {
	start: 'start',
	pause: 'pause',
	getMoney: 'getMoney',
	putGoods: 'putGoods',
	getGoods: 'getGoods',
	liftUp: 'liftUp'
}

function go(link) {
	if (link) { 
		link.style.backgroundColor = 'red';
		link.click(); 
		return true;
	} else {
		return false;
	}
}

function goUrl(url) { window.location = url; }
function setNextStep(step) { chrome.storage.local.set({'nextStep': step}); }

// RUN
var currentPage = pages.home;
var nextStep = steps.start

function readStorageAndRun() {
	setCurrentPage();

	chrome.storage.local.get('nextStep', function(result){
		nextStep = result.nextStep;
		console.log("STORAGE " + nextStep);
		setTimeout(run, 1000);
    });	
}

function setCurrentPage() {
	var pageLink = window.location.pathname
	currentPage = pagesLinks[pageLink];
	if (currentPage === undefined) {
		pageLink = pageLink.slice(1,5);
		currentPage = pagesLinks[pageLink];
	}
	console.log('current page: ' + currentPage);
}

function goHome() {
	window.location = 'https://nebo.mobi/home';
}

function clickFirstLink(text) {
	function itemContainsText(item) { return item.textContent.includes(text); }
	const link = Array.from(document.links).filter(itemContainsText)[0];
	return go(link)
}

function checkLink(url) {
	var els = document.querySelector('a[href*="'+url+'"]');
	return els != null
}

function checkText(text) {
	function itemContainsText(item) { return item.textContent.includes(text); }
	const link = Array.from(document.links).filter(itemContainsText)[0];
	return link != null;	
}

function run() {
	switch (nextStep) {
		case undefined:
			console.log("STEP UNDEFINED");
			setNextStep(steps.start);
			goHome();
			break;
		case steps.pause:
			console.log('PAUSE 30 sec'); 
			setNextStep(steps.start);
			setTimeout(goHome, 30000);
			break;
		case steps.start:
			console.log("STEP START");
			if (!checkIcons()) {
				setNextStep(steps.pause);
				goHome();
			}
			break;
		case steps.getMoney:
			console.log("STEP MONEY");
			if (!getMoney()) { 
				setNextStep(steps.start);
				goHome();
			}
			break;
		case steps.putGoods:
			console.log("STEP PUT GOODS");
			if (!putGoods()) { 
				setNextStep(steps.start);
				goHome();
			}
			break;
		case steps.getGoods:
			console.log("STEP GET GOODS");
			if (!getGoods()) { 
				if (!buyItem()) {
					setNextStep(steps.start);
					goHome();
				}
			}
			break;
		case steps.liftUp:
			console.log("STEP LIFT UP");
			if (!liftUp()) {
				if (!getTips()) {
					setNextStep(steps.start);
					goHome();
				}
			}
			break;
		default:
			console.log("STEP DEFAULT");
			setNextStep(steps.start);
			goHome();
	}
}

function checkIcons() {
	if (checkLink(pages.getMoney)) {
		setNextStep(steps.getMoney);
		goUrl('https://nebo.mobi/floors/0/5');
		return true;
	}
	if (checkLink(pages.putGoods)) {
		setNextStep(steps.putGoods);
		goUrl('https://nebo.mobi/floors/0/3');		
		return true;
	}
	if (checkLink(pages.getGoods)) {
		setNextStep(steps.getGoods);
		goUrl('https://nebo.mobi/floors/0/2');		
		return true;
	}
	if (checkText(textLiftAvailable)) {
		setNextStep(steps.liftUp);
		goUrl('https://nebo.mobi/lift');		
		return true;
	}

	return false;
}

function getMoney() { return clickFirstLink(textGetMoney); }
function getGoods() { return clickFirstLink(textGetGoods); }
function buyItem() { return clickFirstLink(textBuyItem); }
function putGoods() { return clickFirstLink(textPutGoods); }
function liftUp() { return clickFirstLink(textLiftUp); }
function getTips() { return clickFirstLink(textGetTips); }

function checkLift() {
	window.location = "https://nebo.mobi/lift";
}
