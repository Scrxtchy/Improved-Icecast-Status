var streamlist = {};
var [domStreams, offlineStreamList] = [[],[]];


document.addEventListener("DOMContentLoaded", function(event) {
	DOMStreams();
	window.setInterval(function() {
		updateStats();
	}, 8000);
});


function parseStreamName(stream) {
	return stream.replace(window.location.origin, '');
}

function handleStreamObject(stream) {
	var streamID = parseStreamName(stream.listenurl);

	streamlist[streamID] = {
		online: true
	};
	if (streamlist[streamID].loaded === undefined) streamlist[streamID].loaded = document.getElementById('stream' + streamID) !== null;


	var dom = document.getElementById('stream' + streamID);
	if (dom === null) {
		if (document.getElementById('newstream') === null)
			createFooter();
		if (!streamlist[streamID].loaded && !document.getElementById('newstreamlist').innerHTML.includes(stream.server_name))
			document.getElementById('newstreamlist').innerHTML = document.getElementById('newstreamlist').innerHTML + stream.server_name + '';
	} else {
		document.getElementById('title' + streamID).innerText = stream.server_name;
		document.getElementById('playing' + streamID).innerText = stream.artist + " - " + stream.title;
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
							for(var stream of json.icestats.source){
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
	for(var stream in offlineStreams){
		if (!document.getElementById('title' + streamlist[stream]).innerText.includes(' - OFFLINE'))
		document.getElementById('title' + streamlist[stream]).innerText = document.getElementById('title' + streamlist[stream]).innerText + " - OFFLINE";
	}
}

function createFooter() {
	var foot = document.getElementById("footer");
	var newstreamDIV = document.createElement("div");
	newstreamDIV.id = "newstream";
	newstreamDIV.className = "roundbox";
	var newstreamh3 = document.createElement("h3");
	newstreamh3.innerHTML = "New Streams Avaliable - Refresh to display";
	var newstreamlist = document.createElement("span");
	newstreamlist.id = "newstreamlist";
	newstreamDIV.innerHTML = newstreamh3.outerHTML + newstreamlist.outerHTML;
	foot.outerHTML = newstreamDIV.outerHTML + foot.outerHTML;
	}

function DOMStreams(){
	for(var node of document.getElementsByClassName('mounthead')){
		domStreams.push(node.parentElement.id.slice(6));
	}
}