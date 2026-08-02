var streamlist = {};
var [domStreams, offlineStreamList] = [[],[]];

const UpdateSeconds = 8;

document.addEventListener("DOMContentLoaded", function(event) {
	DOMStreams();
	window.setInterval(function() {
		updateStats();
	}, UpdateSeconds * 1000);
});

function handleStreamObject(stream) {
	//var streamID = stream.listenurl.replace(new RegExp(`.+${hostname}(?::\\d+)?`, 'i'), '')
	let streamID = new URL(stream.listenurl).pathname; 
	//Haven't looked into mount points enough to really know if a simple pathname is valid enough
	//regexjank is doing the same kind of shit tho

	streamlist[streamID] = {
		online: true
	};
	if (streamlist[streamID].loaded === undefined) streamlist[streamID].loaded = document.getElementById('stream' + streamID) !== null;


	let dom = document.getElementById('stream' + streamID);
	if (dom === null) {
		if (document.getElementById('newstream') === null)
			createFooter();
		if (!streamlist[streamID].loaded && !document.getElementById('newstreamlist').innerHTML.includes(stream.server_name))
			document.getElementById('newstreamlist').innerHTML = document.getElementById('newstreamlist').innerHTML + stream.server_name + '';
	} else {
		document.getElementById('title' + streamID).innerText = stream.server_name;
		document.getElementById('playing' + streamID).innerText = (stream.artist !== undefined ? stream.artist + " - " + stream.title : stream.title); //unspecified version compatiblity?
		document.getElementById('lstnCurrent' + streamID).innerText = stream.listeners;
		document.getElementById('lstnAllT' + streamID).innerText = stream.listener_peak;
		document.getElementById('genre' + streamID).innerText = stream.genre;

		offlineStreamList.splice(offlineStreamList.indexOf(streamID),1);
	}
}

function updateStats() {
	fetch('status-json.xsl')
		.then(function(response) {
			return response.json();
		})
		.then(function(json) {
				if (json.icestats.source !== undefined) {
					offlineStreamList = domStreams.slice(0);
					switch (json.icestats.source.constructor.name) {
						case "Object":
							handleStreamObject(json.icestats.source);
							break;
						case "Array":
							for(let stream of json.icestats.source){
								handleStreamObject(stream);
							}
							break;
					}
				}
			takeStreamOffline(offlineStreamList);
			}
		);
	}

function takeStreamOffline(offlineStreams){
	for(let stream of offlineStreams){
		if (!document.getElementById('title' + stream).innerText.includes(' - OFFLINE'))
		document.getElementById('title' + stream).innerText = document.getElementById('title' + stream).innerText + " - OFFLINE";
	}
}

function createFooter() {
	let foot = document.getElementById("footer");
	let newstreamDIV = document.createElement("div");
	newstreamDIV.id = "newstream";
	newstreamDIV.className = "roundbox";
	let newstreamh3 = document.createElement("h3");
	newstreamh3.innerHTML = "New Streams Avaliable - Refresh to display";
	let newstreamlist = document.createElement("span");
	newstreamlist.id = "newstreamlist";
	newstreamDIV.innerHTML = newstreamh3.outerHTML + newstreamlist.outerHTML;
	foot.outerHTML = newstreamDIV.outerHTML + foot.outerHTML;
	}

function DOMStreams(){
	for(let node of document.getElementsByClassName('mounthead')){
		domStreams.push(node.parentElement.id.slice(6));
	}
}