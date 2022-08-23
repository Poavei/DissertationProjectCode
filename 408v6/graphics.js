let lineIndex = 0;
let nodeNumber = 2;
let node1 = 'null';
let node2 = 'null';
let x1 = 0, y1 = 0;
let canvasTree = 'null';
let nodeCoords;

let newLines = {};

///delete all html on canvas and replace it with just what is necessary for the input node to be there and nothing else.
function prepCanvas() {
    if (tree == 'null') {
        let startNode = new Node(0);
        startNode.changeType('start');
        canvasTree = new Tree(startNode);
        nodeIndex = 1;
        lineIndex = 0;
        document.getElementById('automataCanvasDiv').innerHTML = '<svg id="automataSVG"><defs><marker id="arrowHead" markerWidth="10"' +
            ' markerHeight="7" refX="10" refY="3.5" orient="auto"><polygon points = "0 0, 10, 3.5, 0 7" /></marker></defs></svg><div' +
            ' class="startNodeDiv" id="strt0"' + '><div class="startNodeToConnector" onclick="startConnect()"></div><img src="nodesImages/startNode.png"' +
            ' id="startNodeImage"><p>0</p><select id="startSelect" onchange="changeStart()"><option selected="selected" value=0>Normal</option>' +
            '<option value=1>Accept</option></select></div>';
        newLines = {};
    } else {
        canvasTree = tree;
        tree = 'null';
    }
    document.getElementById('editButton').style.display = 'none';
    document.getElementById('automataGraphicButtons').style.display = 'initial';
    document.getElementById('automatonOperations').style.display = 'initial';

    ///reset the lines data structure
    newLines['strt0'] = [];
}

///iterate through structure and make sure all references to line are deleted as well as the html element
function deleteLine(evt) {
    let lId = evt.currentTarget.id;
    document.getElementById(lId).remove();
    let s;
    let e;
    for (const item in newLines) {
        for (let i = 0; i < newLines[item].length; i++) {
            if (newLines[item][i].id == lId) {
                if (newLines[item][i].hasOwnProperty('to')) {
                    e = newLines[item][i].to.slice(-1);
                    newLines[item].splice(i, 1);
                } else {
                    s = newLines[item][i].from.slice(-1);
                    newLines[item].splice(i, 1);
                }
            }
        }
    };
    ///delete the transition on the backend too
    canvasTree.getNode(s).deleteNext(e);
}

///delete html element, node from backend, and all transitions to/from this node in the line data structure and backend
function deleteNode(evt) {

    let nId = evt.currentTarget.id;
    document.getElementById(nId).remove();

    let nI = nId.slice(4);

    let tLines = newLines[nId];
    for (let j = 0; j < tLines.length; j++) {
        let line = tLines[j];
        if (line.hasOwnProperty('from')) {
            canvasTree.getNode(nI).deleteNext(line.from.slice(4));
            for (let i = 0; i < newLines[line.from].length; i++) {
                if (newLines[line.from][i].id == line.id) {
                    newLines[line.from].splice(i, 1);
                }
            }
        } else {
            canvasTree.getNode(nI).deleteNext(line.to.slice(4));
            for (let i = 0; i < newLines[line.to].length; i++) {
                if (newLines[line.to][i].id == line.id) {
                    newLines[line.to].splice(i, 1);
                }
            }
        }
        document.getElementById(line.id).remove();
    }
    newLines[nId] = [];
}

///add the html for a new state 
function addNode() {
    let acd = document.getElementById('automataCanvasDiv');
    acd.innerHTML += '<div class="nodeDiv" id="node' + nodeIndex + '"><div class="nodeToConnector" onclick="toConnect(this)"></div><div class=' +
        '"nodeFromConnector" onclick="fromConnect(this)"></div><div class="grabable"><img src="nodesImages/normalNode.png" class="normalNodeImage" id="normalNodeImage' + nodeIndex + '"><p>' + nodeIndex +
        '</p></div><select id="normalSelect' + nodeIndex + '" onchange="changeNormal(' + nodeIndex + ')"><option selected="selected" value=0>' +
        'Normal</option><option value=1>Accept</option></select></div>';
    newLines['node' + nodeIndex] = [];
    ///once html changed need to reapply trigger for dragging objs
    addGrabbable();
    ///change the images if needed for canvas as these reset when html changed
    for (let i = 0; i < document.getElementsByClassName('nodeDiv').length; i++) {
        if (canvasTree.getNode(document.getElementsByClassName('nodeDiv')[i].id.slice(-1)).type == 'endNode') {
            document.getElementById('normalSelect' + (document.getElementsByClassName('nodeDiv')[i].id.slice(-1))).value = 1;
        }
    }
    let nuNode = new Node(nodeIndex++);
    ///add new node to backend
    canvasTree.addNode(nuNode);
    ///as html edited reapply trigger for double click again
    addDblClick();
}

///change start state image depending on whether it is accept or normal state
function changeStart() {
    switch (document.getElementById('startSelect').value) {
        case '1':
            document.getElementById('startNodeImage').src = "nodesImages/startAcceptNode.png";
            if (canvasTree != 'null') {
                canvasTree.start.changeType('endNode');
            }
            break;
        default:
            document.getElementById('startNodeImage').src = "nodesImages/startNode.png";
            if (canvasTree != 'null') {
                canvasTree.start.changeType('normal');
            }
            break;
    }
}

///change state image depending on whether it is accept or normal state
function changeNormal(n) {
    switch (document.getElementById('normalSelect' + n).value) {
        case '1':
            document.getElementById('normalNodeImage' + n).src = "nodesImages/acceptNode.png";
            if (canvasTree != 'null') {
                canvasTree.getNode(n).changeType('endNode');
            }
            break;
        default:
            document.getElementById('normalNodeImage' + n).src = "nodesImages/normalNode.png";
            if (canvasTree != 'null') {
                canvasTree.getNode(n).changeType('normal');
            }
            break;
    }
}

///function for onclick to drag elements
function dragElmnt(el) {

    let p1 = 0, p2 = 0, p3 = 0, p4 = 0;
    el.onmousedown = dragMouseDown;
    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        p3 = e.clientX;
        p4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }
    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();

        p1 = (p3 - e.clientX);
        p2 = (p4 - e.clientY);
        p3 = e.clientX;
        p4 = e.clientY;
        ///sets parameters so cant go off canvas
        if (((el.parentElement.offsetTop - p2) < 0) || ((el.parentElement.offsetLeft - p1) < 0)) {
            return;
        }
        el.parentElement.style.top = ((el.parentElement.offsetTop - p2)) + 'px';
        el.parentElement.style.left = ((el.parentElement.offsetLeft - p1)) + 'px';
        ///need to change all the line points for those connected to node being dragged
        let currNode = newLines[el.parentElement.id];
        for (let i = 0; i < currNode.length; i++) {
            let currLine = currNode[i].id;
            if (currNode[i].hasOwnProperty('to')) {
                document.getElementById(currLine).points[0].x -= p1;
                document.getElementById(currLine).points[0].y -= p2;
                document.getElementById(currLine).points[1].x -= (p1 / 2);
                document.getElementById(currLine).points[1].y -= (p2 / 2);
            } else {
                document.getElementById(currLine).points[2].x -= p1;
                document.getElementById(currLine).points[2].y -= p2;
                document.getElementById(currLine).points[1].x -= (p1 / 2);
                document.getElementById(currLine).points[1].y -= (p2 / 2);
            }
        }
    }
    function closeDragElement() {
        document.onmouseup = 'null';
        document.onmousemove = 'null';
    }
}

///function for if the grey square on the start node gets clicked
function startConnect() {
    let n = document.getElementsByClassName('startNodeToConnector')[0];
    ///check if inital node exists
    if ((node1 == 'null')) {
        node1 = n;
        ///if not change current grey square to red and set initial coords
        n.style.backgroundColor = 'red';
        x1 = parseInt(getComputedStyle(n.parentElement).getPropertyValue('width')) - 0.5;
        y1 = (6 + (parseInt(getComputedStyle(n.parentElement).getPropertyValue('margin-top')) + parseInt(getComputedStyle(n).getPropertyValue('top')))) - 0.5;
    } else {
        ///set initial grey square back to grey
        node1.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
        ///get char for transition
        let char = prompt("Please enter a character for the transition.", '');
        while (char != null && char.length > 1) {
            char = prompt("Please enter only one character.", '');
        }
        if (char == null || char == '') {
            node1 = 'null';
            return;
        }
        ///add svg marker for char if appropriate one not already there
        addTextMarker(char);
        let x3, y3;
        let svg = document.getElementById('automataSVG');
        ///if looping onto itself get different set of coords
        if (node1.parentElement.id == 'strt0') {
            x2 = (x1 - 17.5);
            y2 = (y1 - 20.5);
            y3 = ((y2 - y1) / 2) + y1 - 15;
            x3 = ((x2 - x1) / 2) + x1 + 8.5;
        } else {
            x2 = parseInt(getComputedStyle(n.parentElement).getPropertyValue('width')) - 0.5;
            y2 = (6 + (parseInt(getComputedStyle(n.parentElement).getPropertyValue('margin-top')) + parseInt(getComputedStyle(n).getPropertyValue('top')))) - 0.5;
            x3 = ((x2 - x1) / 2) + x1;
            y3 = ((y2 - y1) / 2) + y1;
        }

        let found = false;
        ///check if already line from the end node to the start node of this transition and save line ID if there is
        let oneSame = false;
        for(let i = 0; i < newLines[n.parentElement.id].length;i++){
            if(newLines[n.parentElement.id][i].to == node1.parentElement.id){
                oneSame = newLines[n.parentElement.id][i].id;
                break;
            }
        }
        for (let i = 0; i < newLines[node1.parentElement.id].length; i++) {
            ///if already existing line from start to end node of this transition then replace exisiting one and new text marker to it
            if (newLines[node1.parentElement.id][i].to == n.parentElement.id) {
                let tempLine = document.getElementById(newLines[node1.parentElement.id][i].id);
                x1 = tempLine.points[0].x;
                x2 = tempLine.points[2].x;
                x3 = tempLine.points[1].x;
                y1 = tempLine.points[0].y;
                y2 = tempLine.points[2].y;
                y3 = tempLine.points[1].y;
                tempLine.remove();
                newLines[node1.parentElement.id][i].chars += char;
                addTextMarker(newLines[node1.parentElement.id][i].chars);
                svg.innerHTML += (`<polyline class="nodeLine" id="${newLines[node1.parentElement.id][i].id}" points="${x1}, ${y1} ${x3},${y3} ${x2},${y2}" fill="none" stroke="black" stroke-width="1.35"; marker-mid="url(#marker${newLines[node1.parentElement.id][i].chars})" marker-end="url(#arrowHead)"/>`);
                found = true;
                break;
            }
        }
        ///if not already existing transition from this transitions start node to its end node then create new one and add it to data structure
        if (!found) {
            ///if existing transition from end node to start node of this transition then change y coords of both appropriately
            if(oneSame != false){
                y3 -= 15;
                document.getElementById(oneSame).points[1].y += 15;
            }
            newLines[node1.parentElement.id].push({
                id: 'line' + (lineIndex),
                to: n.parentElement.id,
                chars: char
            });
            newLines['strt0'].push({
                id: 'line' + lineIndex,
                from: node1.parentElement.id,
            });
            addTextMarker(char);
            svg.innerHTML += (`<polyline class="nodeLine" id="line${lineIndex++}" points="${x1}, ${y1} ${x3},${y3} ${x2},${y2}" fill="none" stroke="black" stroke-width="1.35"; marker-mid="url(#marker${char})" marker-end="url(#arrowHead)"/>`);
        }
        ///add transition to data structure
        canvasTree.getNode(node1.parentElement.id.slice(4)).addNext(canvasTree.getNode(n.parentElement.id.slice(4)), char);
        ///reset intial node
        node1 = 'null';
        ///add dbl click trigger to all node and line HTML elements
        addDblClick();
    }
}

///this function is used for if the right grey square of reg node element is clicked
function toConnect(n) {
    ///check if there is initial node
    if ((node1 == 'null')) {
        ///if this is initial ndoe grey square to red so user can see where he first clicked
        n.style.backgroundColor = 'red';
        node1 = n;
        ///set initial x and y coordinates
        x1 = (parseInt(n.parentElement.style.left.slice(0, -2)) + (parseInt(getComputedStyle(n.parentElement).getPropertyValue('width')))) - 0.5;
        y1 = (6 + (parseInt(n.parentElement.style.top.slice(0, -2)) + parseInt(getComputedStyle(n).getPropertyValue('top'))));
    } else {
        ///change initial grey square back to grey
        node1.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
        ///get  char for transition
        let char = prompt("Please enter a character for the transition.", '');
        while (char != null && char.length > 1) {
            char = prompt("Please enter only one character.", '');
        }
        ///if no char entered clear initial node and end setting of transition
        if (char == null || char == '') {
            node1 = 'null';
            return;
        }
        ///add text marker for char if not one there
        addTextMarker(char);
        let x3, y3;
        let svg = document.getElementById('automataSVG');
        ///if both grey squares on same node then need different coordinates
        if (n.parentElement.id == node1.parentElement.id) {
            x1 = parseInt(n.parentElement.style.left.slice(0, -2)) - 0.5;
            x2 = x1 + (parseInt(getComputedStyle(n.parentElement).getPropertyValue('width'))) - 0.5;
            y2 = y1;
            y3 = y1 - 30;
            x3 = ((x2 - x1) / 2) + x1;
        } else {
            x2 = (parseInt(n.parentElement.style.left.slice(0, -2)) + (parseInt(getComputedStyle(n.parentElement).getPropertyValue('width')))) - 0.5;
            y2 = (6 + (parseInt(n.parentElement.style.top.slice(0, -2)) + parseInt(getComputedStyle(n).getPropertyValue('top'))));
            x3 = ((x2 - x1) / 2) + x1;
            y3 = ((y2 - y1) / 2) + y1;
        }
        ///check if there is already line from end node to start node of this transition, if there is same ID of line to change coords later
        let oneSame = false;
        for(let i = 0; i < newLines[n.parentElement.id].length;i++){
            if(newLines[n.parentElement.id][i].to == node1.parentElement.id){
                oneSame = newLines[n.parentElement.id][i].id;
                break;
            }
        }
        let found = false;
        for (let i = 0; i < newLines[node1.parentElement.id].length; i++) {
            ///if already line from start to end node of this transition then replace it and add new marker for all chars in transition
            if (newLines[node1.parentElement.id][i].to == n.parentElement.id) {
                let tempLine = document.getElementById(newLines[node1.parentElement.id][i].id);
                x1 = tempLine.points[0].x;
                x2 = tempLine.points[2].x;
                x3 = tempLine.points[1].x;
                y1 = tempLine.points[0].y;
                y2 = tempLine.points[2].y;
                y3 = tempLine.points[1].y;
                tempLine.remove();
                newLines[node1.parentElement.id][i].chars += char;
                addTextMarker(newLines[node1.parentElement.id][i].chars);
                svg.innerHTML += (`<polyline class="nodeLine" id="${newLines[node1.parentElement.id][i].id}" points="${x1}, ${y1} ${x3},${y3} ${x2},${y2}" fill="none" stroke="black" stroke-width="1.35"; marker-mid="url(#marker${newLines[node1.parentElement.id][i].chars})" marker-end="url(#arrowHead)"/>`);
                found = true;
                break;
            }
        }
        ///if not found existing line from start to end node of this transitiion then create new one and add to data structure
        if (!found) {
            ///if there is node from end to start node of transition then change coords appropriately for both lines
            if(oneSame != false){
                y3 -= 15;
                document.getElementById(oneSame).points[1].y += 15;
            }
            newLines[node1.parentElement.id].push({
                id: 'line' + (lineIndex),
                to: n.parentElement.id,
                chars: char
            });
            newLines[n.parentElement.id].push({
                id: 'line' + lineIndex,
                from: node1.parentElement.id,
            });
            addTextMarker(char);
            svg.innerHTML += (`<polyline class="nodeLine" id="line${lineIndex++}" points="${x1}, ${y1} ${x3},${y3} ${x2},${y2}" fill="none" stroke="black" stroke-width="1.35"; marker-mid="url(#marker${char})" marker-end="url(#arrowHead)"/>`);
        }
        ///add transition to the backend data strucure
        canvasTree.getNode(node1.parentElement.id.slice(4)).addNext(canvasTree.getNode(n.parentElement.id.slice(4)), char);
        node1 = 'null';
        ///add double click to all line and node elements
        addDblClick();
    }
}

///this function is for reg node elements where the left grey square is pressed
function fromConnect(n) {
    ///check if there has been no node previously selected
    if ((node1 == 'null')) {
        ///set squares colour to red to show user they have selected it
        n.style.backgroundColor = 'red';
        node1 = n;
        ///set initial x1 and x2 parameters
        x1 = parseInt(n.parentElement.style.left.slice(0, -2)) + 0.5;
        y1 = (6 + (parseInt(n.parentElement.style.top.slice(0, -2)) + parseInt(getComputedStyle(n).getPropertyValue('top'))));
    } else {
        ///set initial grey square back to grey
        node1.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
        ///get char for transition
        let char = prompt("Please enter a character for the transition.", '');
        ///make sure something is entered and it is not empty string
        while (char != null && char.length > 1) {
            char = prompt("Please enter only one character.", '');
        }
        ///if no char has been entered then cancel creating transition and reset inital node
        if (char == null || char == '') {
            node1 = 'null';
            return;
        }
        ///add marker if not already there
        addTextMarker(char);
        ///get cnavas element
        let svg = document.getElementById('automataSVG');

        let x3, y3;
        ///if both squares on same node create different coordinates
        if (n.parentElement.id == node1.parentElement.id) {
            x1 = parseInt(n.parentElement.style.left.slice(0, -2)) - 0.5;
            x2 = x1 + (parseInt(getComputedStyle(n.parentElement).getPropertyValue('width'))) - 0.5;
            y2 = y1;
            y3 = y1 - 30;
            x3 = ((x2 - x1) / 2) + x1;
        } else {
            x2 = parseInt(n.parentElement.style.left.slice(0, -2)) + 0.5;
            y2 = (6 + (parseInt(n.parentElement.style.top.slice(0, -2)) + parseInt(getComputedStyle(n).getPropertyValue('top'))));
            x3 = ((x2 - x1) / 2) + x1;
            y3 = ((y2 - y1) / 2) + y1;
        }
        let found = false;
        let oneSame = false;
        ///check if there is node from end node to start node of this transition
        for(let i = 0; i < newLines[n.parentElement.id].length;i++){
            if(newLines[n.parentElement.id][i].to == node1.parentElement.id){
                oneSame = newLines[n.parentElement.id][i].id;
                break;
            }
        }
        for (let i = 0; i < newLines[node1.parentElement.id].length; i++) {
            if (newLines[node1.parentElement.id][i].to == n.parentElement.id) {
                ///if line already exists from this node to next then replace that line and add char to its transition
                let tempLine = document.getElementById(newLines[node1.parentElement.id][i].id);
                x1 = tempLine.points[0].x;
                x2 = tempLine.points[2].x;
                x3 = tempLine.points[1].x;
                y1 = tempLine.points[0].y;
                y2 = tempLine.points[2].y;
                y3 = tempLine.points[1].y;
                tempLine.remove();
                newLines[node1.parentElement.id][i].chars += char;
                addTextMarker(newLines[node1.parentElement.id][i].chars);
                svg.innerHTML += (`<polyline class="nodeLine" id="${newLines[node1.parentElement.id][i].id}" points="${x1}, ${y1} ${x3},${y3} ${x2},${y2}" fill="none" stroke="black" stroke-width="1.35"; marker-mid="url(#marker${newLines[node1.parentElement.id][i].chars})" marker-end="url(#arrowHead)"/>`);
                found = true;
                break;
            }
        }
        if (!found) {
            ///if not found then create new line and add to data structure
            if(oneSame != false){
                ///if there is line from end node to start node of transition then change mid y coordinates
                ///appropriately
                y3 -= 15;
                document.getElementById(oneSame).y += 15;
            }
            newLines[node1.parentElement.id].push({
                id: 'line' + (lineIndex),
                to: n.parentElement.id,
                chars: char
            });
            newLines[n.parentElement.id].push({
                id: 'line' + lineIndex,
                from: node1.parentElement.id,
            });
            addTextMarker(char);
            svg.innerHTML += (`<polyline class="nodeLine" id="line${lineIndex++}" points="${x1}, ${y1} ${x3},${y3} ${x2},${y2}" fill="none" stroke="black" stroke-width="1.35"; marker-mid="url(#marker${char})" marker-end="url(#arrowHead)"/>`);
        }
        ///add transition to data structure
        canvasTree.getNode(node1.parentElement.id.slice(4)).addNext(canvasTree.getNode(n.parentElement.id.slice(4)), char);
        ///reset initial node
        node1 = 'null';
        ///add double click to all elements
        addDblClick();
    }
}

///check if marker for char exists and if not create new one 
function addTextMarker(char) {
    if (!document.getElementById('marker' + char)) {
        let charString = char;
        if (char.length > 1) {
            charString = char.split('').join();
        }

        document.getElementsByTagName('defs')[0].innerHTML += '<marker id="marker' + char + '" markerWidth="25" markerHeight="25" refX="5px" refY="5px" overflow="visible"><text>' + charString + '</text></marker>';
    }
}

///display hidden html element and set its text to show the generated regular expression
function buildFromCanvas() {
    if (canvasTree == 'null') {
        alert('No automaton to build.');
        return;
    }
    document.getElementById('generatedRegularExpression').style.display = 'block';
    document.getElementById('generatedRegularExpression').innerHTML = '<strong>Generated Regular Expression:</strong> ' + treeIntoRegExp(canvasTree);
}

function drawFromTree() {

    if (tree == 'null') {
        alert("Reg exp not parsed.");
        return;
    }
    nodeCoords = [];
    ///first find the initial node and make sure it is named 0
    let currNode;
    for (let i = 0; i < tree.nodes.length; i++) {
        if (tree.nodes[i].type == 'start') {
            currNode = tree.nodes[i];
            currNode.name = 0;
            break;
        }
    }
    ///if no nodes alert error and return
    if (currNode == null) {
        currNode = tree.start;
        if (currNode == null) {
            alert('No start node.')
            return;
        }
    }
    ///reset newlines and then call recursive function
    newLines = {};
    newLines['strt0'] = [];
    recursiveDraw(currNode, [], []);
    ///add grabbable to all nodes
    addGrabbable();
}

function drawNode(node) {
    let name = node.name;
    ///add html needed for new node
    document.getElementById('automataCanvasDiv').innerHTML += '<div class="nodeDiv" id="node' + name + '"><div class="nodeToConnector" id="nodeToConnector' + name + '" onclick="toConnect(this)"></div><div class=' +
        '"nodeFromConnector" id="nodeFromConnector' + name + '" onclick="fromConnect(this)"></div><div class="grabable"><img src="nodesImages/normalNode.png" class="normalNodeImage" id="normalNodeImage' + name + '"><p>' + name +
        '</p></div><select id="normalSelect' + name + '" onchange="changeNormal(' + name + ')"><option selected="selected" value=0>' +
        'Normal</option><option value=1>Accept</option></select></div>';
    ///change image if needed for end node
    if (node.type == 'endNode') {
        document.getElementById('normalSelect' + name).value = 1;
        changeNormal(name);
    }
    ///if this is first node created place it appropriately
    if (nodeCoords.length == 0) {
        document.getElementById('node' + name).style.left = '100px';
        document.getElementById('node' + name).style.top = '10px';
        nodeCoords.push({
            top: 10,
            left: 100
        });
    } else {
        ///otherwise it places it down until no room in canvas then shifts to the right
        let lastCoords = nodeCoords[nodeCoords.length - 1];
        if (lastCoords.top > 280) {
            document.getElementById('node' + name).style.left = (lastCoords.left + 70) + 'px';
            document.getElementById('node' + name).style.top = '10px';
            nodeCoords.push({
                top: 10,
                left: (lastCoords.left + 70)
            });
        } else {
            document.getElementById('node' + name).style.left = lastCoords.left + 'px';
            document.getElementById('node' + name).style.top = (lastCoords.top + 100) + 'px';
            nodeCoords.push({
                top: (lastCoords.top + 100),
                left: (lastCoords.left)
            });
        }
    }
    newLines['node' + name] = [];
}

function drawLine(from, to, char) {

    let fName = parseInt(from.name);
    let tName = parseInt(to.name);
    let tNode;
    let fNode;

    ///gets right html elements for node
    if (tName > 0) {
        tNode = document.getElementById('nodeFromConnector' + tName);
    } else {
        tNode = document.getElementsByClassName('startNodeToConnector')[0];
    }
    if (fName > 0) {
        fNode = document.getElementById('nodeToConnector' + fName);
    } else {
        fNode = document.getElementsByClassName('startNodeToConnector')[0];
    }

    let x1, y1, x2, y2;

    ///generate coordinates for start and end of line
    if (fName > 0) {
        x1 = parseInt(fNode.parentElement.style.left.slice(0, -2)) + (parseInt(getComputedStyle(fNode.parentElement).getPropertyValue('width'))) - 1.5;
        y1 = (6 + parseInt(fNode.parentElement.style.top.slice(0, -2)) + parseInt(getComputedStyle(fNode).getPropertyValue('top'))) + 7.5;
    } else {
        x1 = parseInt(getComputedStyle(fNode.parentElement).getPropertyValue('width')) - 0.5;
        y1 = (6 + (parseInt(getComputedStyle(fNode.parentElement).getPropertyValue('margin-top')) + parseInt(getComputedStyle(fNode).getPropertyValue('top')))) - 0.5;

    } if (tName > 0) {
        x2 = parseInt(tNode.parentElement.style.left.slice(0, -2)) + 1.5;
        y2 = (6 + parseInt(tNode.parentElement.style.top.slice(0, -2)) + parseInt(getComputedStyle(tNode).getPropertyValue('top'))) + 7;
    } else {
        x2 = parseInt(getComputedStyle(tNode.parentElement).getPropertyValue('width')) - 0.5;
        y2 = (6 + (parseInt(getComputedStyle(tNode.parentElement).getPropertyValue('margin-top')) + parseInt(getComputedStyle(tNode).getPropertyValue('top')))) - 0.5;

    }

    let sName, eName;
    if (fName == 0) {
        sName = 'strt0';
    } else {
        sName = 'node' + fName;
    } if (tName == 0) {
        eName = 'strt0';
    } else {
        eName = 'node' + tName;
    }

    ///checks if there's a line from end node to start node
    let oneSame = false;
    for (let i = 0; i < newLines[eName].length; i++) {
        if (newLines[eName][i].hasOwnProperty('to')) {
            if (newLines[eName][i].to == sName) {
                oneSame = true;
                break;
            }
        }
    }
    let x3 = ((x2 - x1) / 2) + x1;
    let y3;

    let svg = document.getElementById('automataSVG');
    ///found is say whether there is already a line from 
    ///start node to the end node
    let found = false;

    ///different protocol if node line goes onto itself
    if (sName != eName) {
        y3 = ((y2 - y1) / 2) + y1;
        for (let i = 0; i < newLines[sName].length; i++) {
            if (newLines[sName][i].to == eName) {
                let tempLine = document.getElementById(newLines[sName][i].id);
                ///if alrady line then copy cooordinates and replace
                x1 = tempLine.points[0].x;
                x2 = tempLine.points[2].x;
                x3 = tempLine.points[1].x;
                y1 = tempLine.points[0].y;
                y2 = tempLine.points[2].y;
                y3 = tempLine.points[1].y;
                tempLine.remove();
                newLines[sName][i].chars += char;
                addTextMarker(newLines[sName][i].chars);
                svg.innerHTML += (`<polyline class="nodeLine" id="${newLines[sName][i].id}" points="${x1}, ${y1} ${x3},${y3} ${x2},${y2}" fill="none" stroke="black" stroke-width="1.35"; marker-mid="url(#marker${newLines[sName][i].chars})" marker-end="url(#arrowHead)"/>`);
                found = true;
                break;
            }
        }
        if (!found) {
            ///if not found add new line to data structure and html
            if(oneSame){
                y3 -= 20;
            }
            newLines[sName].push({
                id: 'line' + (lineIndex),
                to: eName,
                chars: char
            });
            newLines[eName].push({
                id: 'line' + lineIndex,
                from: sName,
            });
            addTextMarker(char);
            svg.innerHTML += (`<polyline class="nodeLine" id="line${lineIndex++}" points="${x1}, ${y1} ${x3},${y3} ${x2},${y2}" fill="none" stroke="black" stroke-width="1.35"; marker-mid="url(#marker${char})" marker-end="url(#arrowHead)"/>`);

        }
    }
    ///protocol for if start and end of line is on same node
    else {
        ////different coords for start node 
        if (sName == 'strt0') {
            x2 = (x1 - 17.5);
            y2 = (y1 - 20.5);
            y3 = ((y2 - y1) / 2) + y1 - 25;
            x3 = ((x2 - x1) / 2) + x1 + 10;
        } else {
            y3 = ((y2 - y1) / 2) + y1 - 35;
        }
        for (let i = 0; i < newLines[sName].length; i++) {
            if (newLines[sName][i].to == eName) {
                ///if found then replace line with added char
                document.getElementById(newLines[sName][i].id).remove();
                newLines[sName][i].chars += char;
                addTextMarker(newLines[sName][i].chars);
                svg.innerHTML += (`<polyline class="nodeLine" id="${newLines[sName][i].id}" points="${x1}, ${y1} ${x3},${y3} ${x2},${y2}" fill="none" stroke="black" stroke-width="1.35"; marker-mid="url(#marker${newLines[sName][i].chars})" marker-end="url(#arrowHead)"/>`);
                found = true;
                break;
            }
        }
        if (!found) {
            ///if not foudn create new line on data struct and html
            newLines[sName].push({
                id: 'line' + (lineIndex),
                to: eName,
                chars: char
            });
            newLines[eName].push({
                id: 'line' + lineIndex,
                from: sName,
            });
            addTextMarker(char);
            svg.innerHTML += (`<polyline class="nodeLine" id="line${lineIndex++}" points="${x1}, ${y1} ${x3},${y3} ${x2},${y2}" fill="none" stroke="black" stroke-width="1.35"; marker-mid="url(#marker${char})" marker-end="url(#arrowHead)"/>`);
        }
    }
    ///add double click to all elements
    addDblClick();
}

function recursiveDraw(currNode, visited, used) {
    ///if start node then change if needs to be as don't add this to html
    if (currNode.name == 0) {
        if (currNode.type == 'endNode') {
            document.getElementById('startSelect').value = 1;
            changeStart();
        }
    }
    ///if alrady visited then just return info
    if (visited.includes(currNode.name)) {
        return [visited, used];
    } else {
        ///otherwise add to visited and then continue
        visited.push(currNode.name);
    }
    ///iterate through all nodes possibly next
    for (let i = 0; i < currNode.next.length; i++) {
        ///if node has not been visited then draw it
        if (!visited.includes(currNode.next[i].To.name)) {
            drawNode(currNode.next[i].To);
        }
        ///if goes onto same node then draw line and skip 
        ///rest of code
        if (currNode.name == currNode.next[i].To.name) {
            drawLine(currNode, currNode.next[i].To, currNode.next[i].Via);
            continue;
        }
        ///draw the line
        drawLine(currNode, currNode.next[i].To, currNode.next[i].Via);
        ///add all used chars into arr
        if (!used.includes(currNode.next[i].Via)) {
            used.push(currNode.next[i].Via);
        }
        ///call recursively on next node
        r = recursiveDraw(currNode.next[i].To, visited, used);
        used = r[1];
        visited = r[0];
    }
    ///return info
    return [visited, used];
}

///add dbl click delete event listener to add node and line elements in HTML
function addDblClick() {
    for (let i = 0; i < document.getElementsByClassName('nodeLine').length; i++) {
        document.getElementsByClassName('nodeLine')[i].addEventListener('dblclick', deleteLine);
    }
    for (let i = 0; i < document.getElementsByClassName('nodeDiv').length; i++) {
        document.getElementsByClassName('nodeDiv')[i].addEventListener('dblclick', deleteNode);
    }
}

///add ability to drag to all node elements in HTML
function addGrabbable() {
    for (let i = 0; i < document.getElementsByClassName('grabable').length; i++) {
        dragElmnt(document.getElementsByClassName('grabable')[i]);
    }
}