const textGetMoney = "Собрать выручку!";
const textGetGoods = "Закупить товар";

const pages = {
	home: 'home',
	floor: 'floor'
}

const pagesLinks = {
    'home' : pages.home,
    'floo' : pages.floor
}

window.onload = function() {
	setCurrentPage();
	setTimeout(run, 1000);
}

var currentPage = pages.home;

function setCurrentPage() {
	var pageLink = window.location.pathname.slice(1,5);
	currentPage = pagesLinks[pageLink];
	console.log('current page: ' + currentPage);
}

function run() {
	switch (currentPage) {
		case pages.home:
			if (getMoney()) { return; }
			if (getGoods()) { return; }
			break;
		case pages.floor:
			console.log("FLOOR");
			break;
	}
}

function go(link) {
	if (link) { 
		link.click(); 
		return true;
	} else {
		return false;
	}
}

function getMoney() {
	function itemContainsText(item) { return item.textContent.includes(textGetMoney); }
	const link = Array.from(document.links).filter(itemContainsText)[0];
	return go(link)
}

function getGoods() {
	function itemContainsText(item) { return item.textContent.includes(textGetGoods); }
	const link = Array.from(document.links).filter(itemContainsText)[0];
	return go(link)
}
