window.onload = function() {
	readStorage(function() {
		setTimeout(run, 1000);
	});
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
const textHotel = "1. Гостиница";
const textShowFloors = "Показать этажи";
const textHideFloors = "свернуть этажи";
const textShowPeople = "Раскрыть список";

const pages = {
	home: 'home',
	floor: 'floor',
	lift: 'lift',
	getMoney: 'floors/0/5',
	putGoods: 'floors/0/3',
	getGoods: 'floors/0/2',
	lobby: 'lobby',
	hotel: 'hotel',
	citizen: 'citizen'
}

const pagesLinks = {
    'home' : pages.home,
	'floo' : pages.floor,
	'lift' : pages.lift,
	'/floors/0/5' : pages.getMoney,
	'/floors/0/3' : pages.putGoods,
	'/floors/0/2' : pages.getGoods
}

const pageTitles = {
	'Главная' : pages.home,
	'Вестибюль' : pages.lobby,
	'Гостиница' : pages.hotel,
	'Житель' : pages.citizen,
	'Лифт' : pages.lift
}

const steps = {
	init: 'init',			// first start
	getHumans: 'getHumans',	// get humans
	getFloors: 'getFloors',	// get floors
	checkJobs: 'checkJobs',	// check jobs

	goHome: 'goHome',
	pause: 'pause',
	start: 'start',			// start after pause

	getMoney: 'getMoney',
	putGoods: 'putGoods',
	getGoods: 'getGoods',
	liftUp: 'liftUp'
}

// returns 0 when link is undefined
function goLink(link) {
	if (link) { 
		link.style.backgroundColor = 'red';
		link.click(); 
	} else {
		return 0;
	}
}

function goUrl(url) { window.location = url; }
function setNextStep(step) { chrome.storage.local.set({'nextStep': step}); }
function saveHumans() { chrome.storage.local.set({'humans': humans}); }
function saveFloors() { chrome.storage.local.set({'floors': floors}); }

// RUN
var currentPage = pages.home;
var nextStep = steps.init;
var humans = [];
var floors = [];

function readStorage(completion) {
	setCurrentPage();

	chrome.storage.local.get('nextStep', function(result) {
		nextStep = result.nextStep;
		console.log("STORAGE " + nextStep);
		completion();
    });	
}

function readHumansAndFloors(completion) {
	chrome.storage.local.get('humans', function(result) {
		humans = result.humans;
		chrome.storage.local.get('floors', function(result) {
			floors = result.floors;
			completion();
		});	
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

function getPageTitle() {
	return document.getElementsByClassName("ttl")[0].textContent.trim();
}

function isPage(page) {
	var pageTitle = getPageTitle();
	return pageTitles[pageTitle] == page;
}

function getFirstLink(text) {
	function itemContainsText(item) { return item.textContent.includes(text); }
	return Array.from(document.links).filter(itemContainsText)[0];
}

// returns 0 on fault
function clickFirstLink(text) {
	function itemContainsText(item) { return item.textContent.includes(text); }
	const link = Array.from(document.links).filter(itemContainsText)[0];
	return goLink(link)
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
		case steps.init:
			console.log("STEP INIT");
			setNextStep(steps.getHumans);
			goHome();
			break;
		case steps.getHumans:
			console.log("STEP GET HUMANS");
			getHumans();
			break;
		case steps.getFloors:
			console.log("STEP GET FLOORS");
			getFloors();
			break;
		case steps.checkJobs:
			console.log("STEP CHECK JOBS");
			checkJobs();
			break;
		case steps.pause:
			console.log('PAUSE 30 sec'); 
			setNextStep(steps.start);
			setTimeout(goHome, 30000);
			break;
		case steps.start:
			console.log("STEP START");
			//readHumansAndFloors(function() {
			//	console.log(humans);
			//	console.log(floors);
			//})
			//break;
			if (!checkIcons()) {
				setNextStep(steps.pause);
				goHome();
			}
			break;
		case steps.getMoney:
			console.log("STEP MONEY");
			if (getMoney() == 0) { 
				setNextStep(steps.start);
				goHome();
			}
			break;
		case steps.putGoods:
			console.log("STEP PUT GOODS");
			if (putGoods() == 0) { 
				setNextStep(steps.start);
				goHome();
			}
			break;
		case steps.getGoods:
			console.log("STEP GET GOODS");
			if (getGoods() == 0) { 
				if (buyItem() == 0) {
					setNextStep(steps.start);
					goHome();
				}
			}
			break;
		case steps.liftUp:
			console.log("STEP LIFT UP");
			if (liftUp() == 0) {
				if (getTips() == 0) {
					setNextStep(steps.start);
					goHome();
				}
			}
			break;
		case steps.goHome:
		default:
			console.log("STEP DEFAULT");
			setNextStep(steps.start);
			goHome();
	}
}

function getHumans() {
	function getHuman(item) {
		var humanLink = item.querySelector("div.rsdst a.white");
		if (humanLink == null) { return; }
		var i = humans.length
		humans[i] = {};
		humans[i]['link'] = humanLink.href;
		humans[i]['name'] = humanLink.textContent;
		humans[i]['id'] = humanLink.href.slice(26,36);

		var humanLink = item.querySelector("div.rsdst b.abstr span");
		if (humanLink == null) { return; }
		humans[i]['level'] = parseInt(humanLink.textContent);
		humans[i]['type'] = humanLink.className;

		var humanLink = item.querySelector("div.rsdst span.small span");
		if (humanLink == null) { return; }
		humans[i]['firm'] = humanLink.textContent;
		
		var humanLink = item.querySelector("div.rsdst span.amount");
		if (humanLink == null) { 
			humans[i]['plus'] = false;
		} else {
			humans[i]['plus'] = true;
		}
		console.log("HUMAN "+i);
	}

	// go to hotel
	if (!isPage(pages.hotel)) { 
		var link = getFirstLink(textHotel);
		if (link) { goLink(link); return; }
	}
	
	// unfold list
	var link = getFirstLink(textShowPeople);
	if (link) { goLink(link); return; }

	// get humans
	document.querySelectorAll("li").forEach((item) => getHuman(item));
	saveHumans();
	setNextStep(steps.getFloors);
	goHome();
}

function getFloors() {
	// unfold list
	var link = getFirstLink(textShowFloors);
	if (link) { goLink(link); return; }
	
	// get floors
	document.querySelectorAll("div.tower div div a.flhdr").forEach(function(item) {
		var floorName = item.textContent;
		var floorNumber = parseInt(floorName);

		var i = floors.length
		floors[i] = {};
		floors[i]['link'] = item.href;
		floors[i]['number'] = floorNumber;
		floors[i]['firm'] = floorName.slice(floorName.indexOf('.')+2).trim();
	})
	saveFloors();
	setNextStep(steps.checkJobs);
	clickFirstLink(textHideFloors);
}

function checkJobs() {
	// finish me
	setNextStep(steps.start);
	goHome();
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
function getTips() { 
	var vip = document.querySelector("div.lift span.ctrl span.vip");
	if (vip) { setNextStep(steps.goHome); }
	return clickFirstLink(textGetTips); 
}
