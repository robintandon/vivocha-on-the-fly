
function addPattern(value) {

  var patterns = document.getElementById("patterns");
  var div = document.createElement("div");
  var input = document.createElement("input");
  input.setAttribute("class", "urlmatch");
  var button = document.createElement("button");
  button.setAttribute("class", "removebutton");

  button.innerText = "-";
  div.appendChild(input);
  div.appendChild(button);

  input.value = value;

  patterns.appendChild(div);

  button.addEventListener('click', removePatternHandler, button);
  
}

function addPatternHandler(e) {
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, function (tabs) {
    if (tabs.length > 0)
      addPattern(tabs[0].url);
    else
      addPattern('.*')
    saveOptions();
  });
}

function removePattern(obj) {
  obj.parentNode.parentNode.removeChild(obj.parentNode);
}

function removePatternHandler(e) {
  removePattern(e.srcElement);
  saveOptions();
}

function next(node, tag) {

  while(node && node.nodeName != tag)
    node = node.nextSibling;

  return node;
  
}

function clear() {

  var patterns = document.getElementById("patterns");

  while (patterns.firstChild)
    patterns.removeChild(patterns.firstChild);

}

function tellTabToInsertScript() {
  chrome.extension.sendMessage({ message: "vivocha-insert"});
}


function saveOptions() {
  var pattern = next(document.getElementById("patterns").firstChild, 'DIV');
  var account = document.getElementById("account").value;

  var patterns = [];

  while (pattern) {

    var regex = next(pattern.firstChild, "INPUT").value;

    patterns.push(regex);

    pattern = next(pattern.nextSibling, "DIV");
    
  }

  mapping = {};
  mapping[account] = patterns;

 }

function persisteOptionsHandler() {

  saveOptions();

  localStorage['VivochaOnTheFly'] = JSON.stringify(mapping);

  tellTabToInsertScript();

  window.close();

}

var mapping = {};
function loadOptions() {
  clear();
  for (var i in mapping) {
    document.getElementById("account").value = i;
    var patterns = mapping[i];
    for (var j in patterns) {
      addPattern(patterns[j]);
    }
  }
}

function undo() {
  mapping = JSON.parse(localStorage['VivochaOnTheFly'] || {});
  loadOptions();
}


document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('addbutton').addEventListener('click', addPatternHandler);
  document.getElementById('savebutton').addEventListener('click', persisteOptionsHandler);
  document.getElementById('undobutton').addEventListener('click', undo);
  undo();
});
