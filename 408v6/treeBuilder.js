let tree = 'null';
let nodeIndex = 1;

function buildTree(input) {
    let charArr = input.split('');
    if (!acceptable(charArr)) {
        alert("Inappropriate parentheses.");
        return false;
    }
    ///filter out empty spaces
    charArr = charArr.filter(char => char != ' ');
    ///create new node as starting node
    let start = new Node(0);
    start.changeType('start');
    ///create new tree
    tree = new Tree(start);
    ///call flesh function
    let ends = flesh(charArr, [start]);
    ///find and set end nodes
    setEndNodes(start);
    if(tree.nodes.length == 1){
        ///check if there's only input and it returns onto itself, if so it is end node
        if(tree.start.next.length > 0){
            tree.start.changeType('endNode');
        } 
    }
    ///get all chars of alphabet and create new node for dead node
    let usedChars = tree.getAllChars();
    let n = new Node(nodeIndex++);
    for (let i = 0; i < tree.nodes.length; i++) {
        ///iterate through each node in tree
        let node = tree.nodes[i];
        ///copy alphabet
        let tempChars = [...usedChars];
        for (let j = 0; j < node.next.length; j++) {
            ///if the node using a char in alphabet remove it from temp alphabet
            if (tempChars.includes(node.next[j].Via)) {
                tempChars.splice(tempChars.indexOf(node.next[j].Via), 1);
            }
        }
        ///add transitions to end node for any chars still left in temp alphabet
        for (let i = 0; i < tempChars.length; i++) {
            node.addNext(n, tempChars[i]);
        }
    }
    tree.addNode(n);
    ///add transitions to dead node unto itself for all chars in alphabet
    for (let i = 0; i < usedChars.length; i++) {
        n.addNext(n, usedChars[i]);
    }
    return true;
}
function testStringOnTree(input, cTree) {
    let charArr = input.split('');
    ///set current node as start node of tree
    let curr = cTree.start;
    for (let i = 0; i < charArr.length; i++) {
        ///iterate through each char of input, checking all possible next nodes of 
        ///current node, if there is a transition that matches then use it and set 
        ///the next node as current node, otherwise return false
        let progressed = false;
        for (let j = 0; j < curr.next.length; j++) {
            if ((curr.next[j].Via == charArr[i])) {
                curr = curr.next[j].To;
                progressed = true;
                break;
            }
            if (curr.next[j].Via == '') {
                curr = curr.next[j].To;
                progressed = true;
                i--;
                break;
            }
        }
        ///if not found a node to progress to then return false
        if (!progressed) {
            alert("String rejected, finishing on node: " + curr.name);
            return;
        }
    }
    ///if input finished without problems then check current node and see
    ///if its an accepting state or not and alert user appropriately
    if (curr.type == 'endNode') {
        alert("String accepted, finishing on node: " + curr.name);
        return true;
    } else {
        alert("String rejected, finishing on node: " + curr.name);
        return false;
    }
}


function setEndNodes(startNode) {
    let visited = [];
    let queue = [startNode];
    while (queue.length > 0) {
        let curr = queue.shift();
        ///if there is no node next then make current node end node as no uneccesarry nodes created through algorithm can assume it is accept node when there is nothing more
        if (curr.next.length == 0) {
            curr.changeType('endNode');
            continue;
        } else if (visited.includes(curr.name)) {
            ///if stumbled upon already visited node and there is a loop back to it then it is an end node
            if (checkLoop(curr)) {
                curr.changeType('endNode');
            }
            continue;
        }
        visited.push(curr.name);
        for (let i = 0; i < curr.next.length; i++) {
            if (!(queue.includes(curr.next[i].To))) {
                if(curr.next[i].To == undefined){
                    continue;   
                }
                queue.push(curr.next[i].To);
            }
        }
    }
}

///check if there is loop from node to itself
function checkLoop(start) {
    let queue = [start];
    let curr;
    while (queue.length > 0) {
        if (curr == start) {
            break;
        }
        curr = queue.shift();
        if (curr.next.length != 1) {
            return false;
        }
        for (let i = 0; i < curr.next.length; i++) {
            queue.push(curr.next[i].To);
        }
    }
    return true;
}

///print each nodes info in order from start
function followNext(startNode, visited) {
    if (visited.includes(startNode.name)) {
        return;
    }
    let nextOnes = startNode.next;
    console.log("Node: " + startNode.name);
    if (startNode.type == 'endNode') {
        console.log("END NODE ");
    }
    visited.push(startNode.name);
    for (let i = 0; i < nextOnes.length; i++) {
        console.log("To: " + nextOnes[i].To.name + " Via: " + nextOnes[i].Via);
    }
    for (let i = 0; i < nextOnes.length; i++) {
        followNext(nextOnes[i].To, visited);
    }
}

function flesh(charArr, currNodes) {
    ///Hold all chunks of regular expression as Token objs and place into tokens array
    let tokens = [];
    ///Holds all characters that have been parsed through so far either from the start
    ///or since last reset
    let currTokenArr = [];
    for (let i = 0; i < charArr.length; i++) {
        //check to see if current character is */+ if so create token obj from prev chars
        //parsed, change its type to match curr char and add it to tokens array and then
        ///reset currTokenArr
        if ((charArr[i] == '*') || (charArr[i] == '+')) {
            let nuToken = new Token(currTokenArr);
            nuToken.changeType(charArr[i]);
            tokens.push(nuToken);
            currTokenArr = [];
            continue;
        }
        else if (charArr[i] == '(') { 
            ///if current char is '(' and there are chars in currTokenArr then string must
            ///have token the form 'ab()' and so create normal Token obj (as default type is
            ///just a regualr string) and add it to tokens array and reset currTokenArr
            if (currTokenArr.length > 0) {
                let toke = new Token(currTokenArr);
                tokens.push(toke);
                currTokenArr = [];
            }
            ///initialise parenthesis count and loop forward in input, adding one for each new
            ///'(' character you parse and taking one away when you parse a ')'.  This is because
            ///if you have nested brackets '(())' you need to make sure you cut string at 
            ///appropriate ')'
            let pCount = 0;
            for (let j = (i + 1); j < charArr.length; j++) {
                if ((charArr[j] == ')') && (pCount == 0)) {
                    ///once right closing bracket found then create token obj with type 'bracketed'
                    ///and add it to the tokens array
                    let nuToken = new Token(currTokenArr);
                    nuToken.changeType('bracketed');
                    tokens.push(nuToken);
                    currTokenArr = [];
                    i = (j);
                    break;
                } else if ((charArr[j] == ')') && (pCount > 0)) {
                    pCount--;
                } else if (charArr[j] == '(') {
                    pCount++;
                }
                currTokenArr.push(charArr[j]);
            }
        } else if (charArr[i] == '|') {
            ///if the current char is '|' the we need to create a new array for the options given
            ///to the OR operator
            let options = [];
            if (currTokenArr.length > 0) {
                ///if there are characters before the first '|' then add them to the options as the
                ///input will be in the form 'ab|' and so 'ab' is the first 'option', need to reset 
                ///currTokenArr afterwards
                let nuToken = new Token(currTokenArr);
                options.push(nuToken);
                currTokenArr = [];
            } else {
                ///if there are no characters in the currTokenArr array then this means that an
                ///operator has been applied to first option for example if the input was 'ab*|...'
                ///in this case then the last item in the tokens array needs to be taken from there
                ///and added to the options array
                options.push(tokens[tokens.length - 1]);
                tokens.splice((tokens.length -1), 1);
            }
            ///from here loop until you are met either with a closing bracket or the end of the input
            ///and add every possible chunk into the option array, assuming its been seperated by a '|'
            for (let j = (i + 1); j < charArr.length; j++) {
                if (charArr[j] == ')') {
                    ///when we exit this nested loop need to set index of outer loop to where we left
                    ///off here so that it does not iterate over this again
                    i = j;
                    break;
                } 
                ///if we come across a an opening bracket then need to run through same protocols
                ///as earlier to make sure we get whole bracketed chunk and make that one option
                else if (charArr[j] == '(') {
                    let pCount = 1;
                    for (let k = (j + 1); k < (charArr.length - 1); k++) {
                        if (charArr[k] == '(') {
                            pCount++;
                        } else if (charArr[k] == ')') {
                            pCount--;
                        }
                        if (pCount == 0) {
                            let slice = charArr.slice((j + 1), k);
                            let toke = new Token(slice);
                            tokens.push(toke);
                            toke.changeType('bracketed');
                            options.push(toke);
                            j = k;
                            break;
                        }
                    }
                } else if (charArr[j] == '|') {
                    let toke = new Token(currTokenArr);
                    options.push(toke);
                    currTokenArr = [];
                } else if ((charArr[j] == '*') || (charArr[j] == '+')) {
                    let toke = new Token(currTokenArr);
                    toke.changeType(charArr[j]);
                    options.push(toke);
                    currTokenArr = [];
                } else {
                    currTokenArr.push(charArr[j]);
                }
                if (j == (charArr.length - 1)) {
                    ///when we exit this nested loop need to set index of outer loop to where we left
                    ///off here so that it does not iterate over this again
                    i = j;
                }
            }
            ///once we have exited the nested loop then we need to check and see if there has been a 
            ///string of chars left, if so this will be the last option
            if (currTokenArr.length > 0) {
                options.push(new Token(currTokenArr));
                currTokenArr = [];
            }
            ///create new token with all options, set it to an or type and put it into the tokens arr
            let orToken = new Token(options);
            orToken.changeType('or');
            tokens.push(orToken);
        }
        else {
            currTokenArr.push(charArr[i]);
        }
    }
    ///once all the char input has been looped through check if theres anything left over in the
    ///currTokenArr, if so add it as a regular token obj to the tokens arr
    if (currTokenArr.length > 0) {
        let toke = new Token(currTokenArr);
        tokens.push(toke);
    }
    ///ends is an array of the last nodes used, which we need to pass on when handling tokens, this
    ///is so that the tree can connect to the appropriate nodes when handling the tokens
    let ends = [currNodes];
    //token handling
    for (let i = 0; i < tokens.length; i++) {
        let currToken = tokens[i];
        switch (currToken.type) {
            case 'or':
                ends.push(handleOr(currToken, ends[ends.length - 1]));
                break;
            case '*':
                ends.push(handleStar(currToken.chars, ends[ends.length - 1]));
                break;
            case '+':
                ends.push(handlePlus(currToken.chars, ends[ends.length - 1]));
                break;
            case 'bracketed':
                ends = ends.concat(handleBrackets(currToken.chars, ends[ends.length - 1]));
                break;
            default:
                ends.push(handleChain(currToken.chars, ends[ends.length - 1]));
                break;
        }
    }
    return ends;
}

function handleOr(orToken, currNodes) {
    let endNodes = [];
    ///for the or token type we need to iterate through each option and add the returning nodes
    ///into the endNodes array
    for (let i = 0; i < currNodes.length; i++) {
        let currNode = currNodes[i];
        for (let j = 0; j < orToken.chars.length; j++) {
            let currChars = orToken.chars[j];
            switch (currChars.type) {
                case '*':
                    endNodes.push(handleStar(currChars.chars, [currNode]));
                    break;
                case '+':
                    endNodes.push(handlePlus(currChars.chars, [currNode]));
                    break;
                case 'bracketed':
                    endNodes = endNodes.concat(handleBrackets(currChars.chars, [currNode]));
                    break;
                default:
                    endNodes.push(handleChain(currChars.chars, [currNode]));
                    break;
            }
        }
    }
    ///real ends is here so we return an array of nodes instead of an array of arrays of nodes
    let realEnds = [];
    for (let i = 0; i < endNodes.length; i++) {
        let currArr = endNodes[i];
        realEnds.push(currArr[currArr.length - 1]);
    }
    return realEnds;
}

function handleBrackets(chars, currNodes) {
    ///as there is chars nested inside the brackets, we need to call the flesh function again
    ///this is as in the case of '(abc*)' the brackets will be removed and 'abc*' will be parsed
    let ret = flesh(chars, currNodes);
    return ret;
}

function handleChain(chars, currNodes) {
    ///when the token is just a simple string i.e. 'abc' then we just need to add and link
    ///nodes so that there is a path using all the characters, then return the final node
    let newNode = new Node(nodeIndex++);
    for (let i = 0; i < currNodes.length; i++) {
        currNodes[i].addNext(newNode, chars[0]);
    }
    for (let i = 1; i < chars.length; i++) {
        let tempNode = new Node(nodeIndex++);
        tree.nodes.push(newNode);
        newNode.addNext(tempNode, chars[i]);
        newNode = tempNode;
    }
    tree.nodes.push(newNode);
    return [newNode];
}

function handlePlus(chars, currNodes) {
    ///for a plus token we need to make a path of transitions for all characters in the string
    ///as well as a repeated path up until the last char which is then linked to the last 
    ///node of the initial iteration, for example 'abc+' we need to create 1-a-2-b-3-c-4-a-5-b-6
    ///                                                                                |___c___|
    ///as this requires one initial round of 'abc' followed by as many as one wants, we return 
    ///the quivalent of node 4 as the end node where other nodes link to
    let newNodes = [new Node(nodeIndex++)];
    tree.addNode(newNodes[0]);
    for (let i = 0; i < currNodes.length; i++) {
        currNodes[i].addNext(newNodes[0], chars[0]);
    }
    if (chars.length == 1) {
        newNodes[0].addNext(newNodes[0], chars[0]);
        let ret = newNodes[0];
        return [ret];
    }
    for (let i = 1; i < (chars.length); i++) {
        newNodes.push(new Node(nodeIndex++));
        tree.addNode(newNodes[i]);
        newNodes[(i - 1)].addNext(newNodes[i], chars[i]);
    }
    for (let i = 0; i < (chars.length - 1); i++) {
        newNodes.push(new Node(nodeIndex++));
        tree.addNode(newNodes[newNodes.length -1]);
        newNodes[(i + chars.length - 1)].addNext(newNodes[(i + chars.length)], chars[i]);
    }
    newNodes[newNodes.length - 1].addNext(newNodes[(chars.length - 1)], chars[chars.length - 1]);
    let ret = newNodes[chars.length - 1];
    return [ret];
}

function handleStar(chars, currNodes) {
    ///for this we need to create a node for each char except the last one, which we then link up
    ///to the first one e.g. 'abc*'   1-a-2-b-3
    ///                               |___c___|
    ///We then return the initial node as the end node for other nodes to link on to
    if (chars.length == 1) {
        for (let i = 0; i < currNodes.length; i++) {
            currNodes[i].addNext(currNodes[i], chars[0]);
        }
        return currNodes;
    }
    let newNode = new Node(nodeIndex++);
    tree.addNode(newNode);
    for (let i = 0; i < currNodes.length; i++) {
        currNodes[i].addNext(newNode, chars[0]);
    }
    for (let i = 1; i < (chars.length - 1); i++) {
        let tempNode = new Node(nodeIndex++);
        tree.nodes.push(newNode);
        newNode.addNext(tempNode, chars[i]);
        newNode = tempNode;
    }
    tree.nodes.push(newNode);
    for (let i = 0; i < currNodes.length; i++) {
        newNode.addNext(currNodes[i], chars[chars.length - 1]);
    }
    let arr = [newNode].concat(currNodes);
    return arr;
}

///check if number of opening and closing parentheses match before parsing
function acceptable(charArr) {
    let psNum = 0;
    let peNum = 0;
    for (let i = 0; i < charArr.length; i++) {
        if (charArr[i] == '(') {
            psNum++;
        } else if (charArr[i] == ')') {
            peNum++;
            if (peNum > psNum) {
                return false;
            }
        }
    }
    if (psNum == peNum) {
        return true;
    } else {
        return false;
    }
}

function treeIntoRegExp(aTree) {
    if (aTree == 'null') {
        alert("No tree to be turned into RegExp.");
        return;
    }
    let start = aTree.start;
    if (start == 'null') {
        alert("Tree has no start node.");
        return;
    }

    let chain = '';
    if (pathToEnd(start, []) == false) {
        return 'No accept nodes, no language accepted.';
    }

    chain = reverseFlesh(start, chain, []);
    return chain;
}

function pathToEnd(n, v) {
    ///if this node is end node return true
    if (n.type == 'endNode') {
        return true;
    }
    ///if nothing next and this is not end node return false
    if (n.next.length == 0) {
        return false;
    }
    ///if already visited this node then return false
    if (v.includes(n.name)) {
        return false;
    }
    ///add curr node name to visted arr and for each next node recursively call this function (if next node is not this one)
    v.push(n.name);
    for (let i = 0; i < n.next.length; i++) {
        if(n.next[i].To == n){
            continue;
        }
        if (pathToEnd(n.next[i].To, v)) {
            return true;
        }
    }
    ///if none of the next nodes has path to end return false
    return false;
}

function runLoop(iNode, cNode, v, c) {
    ///if initial node is current node return built up c string
    if (iNode.name == cNode.name) {
        return c;
    }
    ///if returned to node and its initial then return false as its not a loop to same node
    if (v.includes(cNode.name)) {
        return false;
    }
    let nNodes = cNode.next;
    ///if no nodes next then its not a loop
    if (nNodes.length == 0) {
        return false;
    } else {
        ///push current node name into visited and then for all next nodes recursive check if there is loop
        v.push(cNode.name);
        for(let i = 0; i < nNodes.length; i++){
            let res = runLoop(iNode, nNodes[i].To, v , c);
            ///if there is a loop then add returned c to this c and return it
            if(res !== false){
                c += (/*nNodes[i].Via +*/ runLoop(iNode, nNodes[i].To, v , c));
                return c;
            }
        }
        ///if none of the next nodes have loop path return false
        return false;
    }
}

function reverseFlesh(cNode, c, v) {
    let nNodes = cNode.next;
    let isEnd = ((cNode.type == 'endNode') ? true : false);
    if (nNodes.length == 1) {
        ///check to see if the node is an end node
        if (isEnd) {
            ///check to see if there is a loop back to this node, if there is r will equal the string for the transitions
            ///to reach the same node
            let r = runLoop(cNode, nNodes[0].To, [], nNodes[0].Via);
            if (r == false) {
                ///if there is no loop but there is an end node further down the line then continue recursive function
                if (pathToEnd(nNodes[0].To, [])) {
                    let tempC = c;
                    let mutual = tempC.slice(0, -1);
                    tempC = tempC.slice(-1);
                    c += reverseFlesh(nNodes[0].To, nNodes[0].Via, []);
                    c = c.slice(mutual.length);
                    c = `(${mutual}(${tempC}|${c}))`;
                } else {
                    ///if there is no loop and no path to another end node from this node then just return the
                    ///regular expression that has been built as the rest of the nodes do not matter
                    return c;
                }
            } else {
                ///take the current string copy the last characters up to the length of the r
                let s = c.slice((-1 * r.length));
                ///if s is the same as r then that means that the string has to be repeated once before
                ///going on the loop so it goes with '+' operator, if not it means that '*' is to be used
                if (s == r) {
                    c = c.slice(0, (-1 * r.length));
                    c += `(${r}+)`;
                } else {
                    c += `(${r}*)`;
                }
                return c;
            }
        } else {
            ///this check needs to go here incase there was a loop as then cNode will already have been
            ///visited but since there is no loop then if it has already been visited then return 
            ///else check if theres a path to another end node and if yes continue on
            if (v.includes(cNode.name)) {
                return c;
            } else {
                v.push(cNode.name);
                if (pathToEnd(nNodes[0].To, [])) {
                    c += nNodes[0].Via;
                    c = reverseFlesh(nNodes[0].To, c, v);
                }
            }
        }
    }
    ///if there is no next nodes then return the regular expression built, no need to check if this is
    ///an end node as this is checked before recursive function is used on this node
    else if (nNodes.length == 0) {
        return c;
    } else {
        ///as there are multiple transitions here, we have an OR to build
        v.push(cNode.name);
        ///ecs holds the returned strings from recursively calling this function upon the next nodes
        let eCs = [];
        ///m is the index where there are mutual chars at, set at very high number so it will always be
        ///brought down later until it meets appropriate index
        let m = 99999;
        ///tempC is temporary holder of characters that return to the current node
        let tempC = '';
        for (let i = 0; i < nNodes.length; i++) {
            ///checks if any of the options returns upon the current node, then continue loop if they do
            if(cNode == nNodes[i].To){
                tempC += nNodes[i].Via;
                continue;
            }
            ///check if there is a path to an end node on this option, if not continue loop
            if (pathToEnd(nNodes[i].To, [])) {
                ///if next has been visited need to check for loop, if there is a loop then
                ///add it to the regular exp string
                if(v.includes(nNodes[i].To.name)){
                    let res = runLoop(cNode, nNodes[i].To, [], '');
                    if(res != false){
                        res += nNodes[i].Via;
                        c += `((${res}*)|${nNodes[i].Via})`;
                    }
                    continue;
                }
                ///as there is no loop then recursively call function on next node and add result to ecs
                let t = reverseFlesh(nNodes[i].To, nNodes[i].Via, v);
                eCs.push(t);
                ///if t's length is smaller than m make m equal to t's length
                if (t.length < m) {
                    m = t.length;
                }
            } else {
                continue;
            }
        }
        ///if tempC's length > 0 then there are chars which loop onto the node and hence we make an extra
        ///bracketed statement that holds all the chars as options as an or with a '*' as they can go round
        ///as many times as they please and be at the same node
        if(tempC.length != 0){
            tempC = tempC.split('');
            let tcs = '(';
            for(let i = 0 ; i < tempC.length; i++){
                tcs += (tempC[i] + '|');
            }
            tcs = tcs.slice(0, -1);
            tcs += ')';
            c += `(${tcs}*)`;
        }
        ///if none of the options led to an end node and hence were discounted leaving ecs empty then 
        ///return c
        if(eCs.length == 0){
            return c;
        }
        ///remove any duplicate options
        for (let i = 0; i < (eCs.length - 1); i++) {
            for (let j = 1; j < eCs.length; j++) {
                if (eCs[i] == eCs[j]) {
                    eCs.splice(j, 1);
                }
            }
        }
        ///if only one valid options exists return c + that option
        if (eCs.length == 1) {
            return c  + eCs[0];
        }
        ///we multiply m by -1 here as we are going to use it to check for duplicate transitions in the options
        ///this is incase we have 'abc|adc' then we can write this as 'a(bc|dc)'
        m *= -1;
        ///eI is the options index
        let eI = 0;
        ///cIndex is the cut index
        let cIndex;
        for (let i = -1; i >= (m); i--) {
            ///if the option at the option at the option index contains '|' then increment ei, unless we're at 
            ///the end of the options array, then break the loop
            if (eCs[eI].includes('|')) {
                if (eI == (eCs.length - 1)) {
                    break;
                } else {
                    eI++;
                }
            }
            let cut = true;
            let cChar = eCs[eI][eCs[eI].length + i];
            ///check for each option, if it includes '|' skip it, otherwise check if curr char matches
            ///if not then make cIndex one higher than that and break the loop
            for (let j = eI + 1; j < eCs.length; j++) {
                if (eCs[j].includes('|')) {
                    continue;
                }
                if (eCs[j][eCs[j].length + i] != cChar) {
                    cIndex = i + 1;
                    cut = false;
                    break;
                }
            }
            if (cut == false) {
                ///if i equals m then make it one bigger as m is the length of the smallest option and 
                ///so cannot cut further
                if (i == m) {
                    cIndex = i + 1;
                }
                break;
            }
        }

        let preStr = '';
        let pcIndex = 0;
        m *= -1;
        eI = 0;
        ///here we are doing much the same as the above except here seeing where the the strings change
        ///from the start, i.e. if we had '(abc|adc|aec)' then above is to make it '(ab|ad|ae)c' and
        ///here is to then make it 'a(b|d|e)c'
        for (let i = 0; i < m; i++) {
            if (eCs[eI].includes('|')) {
                if (eI == (eCs.length - 1)) {
                    break;
                } else {
                    eI++;
                }
            }
            let cut = false;
            let cChar = eCs[eI][i];
            for (let j = eI + 1; j < eCs.length; j++) {
                if (eCs[j].includes('|')) {
                    continue;
                }
                if (eCs[j][i] != cChar) {
                    pcIndex = i;
                    cut = true;
                    break;
                }
            }
            if (cut) {
                if (i == m) {
                    pcIndex = i;
                }
                break;
            }
        }
        ///from each option remove what was determined to be cut from start
        for (let i = 0; i < eCs.length; i++) {
            if (pcIndex != 0) {
                preStr = eCs[i].slice(0, pcIndex);
                eCs[i] = eCs[i].slice(pcIndex);
            }
        }

        let cStr = '';
        ///add what was cut from every start of every option to end of c
        if (preStr != '') {
            c += preStr;
        }
        ///add each option to c
        c += '(';
        for (let i = 0; i < eCs.length; i++) {
            if (cIndex != 0) {
                cStr = eCs[i].slice(cIndex);
                eCs[i] = eCs[i].slice(0, cIndex);
            }
            c += `${eCs[i]}|`;
        }
        c = c.slice(0, -1) + ')';
        ///add what was cut from end of every option to c
        if (cIndex != null) {
            c += cStr;
        }

    }
    return c;
}

function brzozowski(t){
    ///reverse automaton
    let r = reverseTree(t);
    ///determinise using powerset construction
    let pr = powerset_construct(r);
    ///reverse automaton
    let rpr = reverseTree(pr);
    ///rename all nodes
    for(let i = 0; i < rpr.nodes.length; i++){
        if(rpr.nodes[i].type == 'start'){
            rpr.nodes[i].name = 0;
        }
        rpr.nodes[i].name = (i + 1);
    }
    ///determinise using powerset construction
    let prpr = powerset_construct(rpr);
    ///rename all nodes
    for(let i = 0; i < prpr.nodes.length; i++){
        if(prpr.nodes[i].type == 'start'){
            prpr.nodes[i].name = 0;
        }
        prpr.nodes[i].name = (i + 1);
    }
    ///return final automaton
    return prpr;
}


function powerset_construct(t) {
    ///chars corresponds to the alphabet of automaton
    let chars = t.getAllChars();
    let r = t;

    ///get all inital states into array by iterating over
    ///all nodes and if there is a node with no outward
    ///transitions and is not an accept state then delete it
    let starts = [];
    for (let i = 0; i < r.nodes.length; i++) {
        if (r.nodes[i].type == 'start') {
            starts.push(r.nodes[i]);
        }
        if (r.nodes[i].type != 'endNode' && r.nodes[i].next.length == 0) {
            r.deleteNode(r.nodes[i]);
        }
    }
    ///make name correspond to subset of all nodes
    let nName = '';
    for (let i = 0; i < starts.length; i++) {
        nName += starts[i].name + ',';
    }
    ///remove last comma
    nName = nName.slice(0, -1);
    ///create start node to start recursion and dead state
    ///to be passed across all recursive iterations
    let nStart = new Node(nName);
    let dead = new Node('dead');
    nStart.type = 'start';
    ///set the returned set of nodes to be the nodes of the new tree
    let ret = recursive_powerset(nStart, [], chars, dead, r);
    let nTree = new Tree(nStart);
    nTree.nodes = ret;
    ///make dead state always return to itself then add it to tree
    for(let i = 0; i < chars.length; i++){
        dead.addNext(dead, chars[i]);
    }
    dead.name = (ret.length + 1);
    nTree.addNode(dead);
    ///rename all nodes
    for(let i = 0; i < nTree.nodes.length; i++){
        if(nTree.nodes[i].type == 'start'){
            nTree.nodes[i].name = 0;
        }
        nTree.nodes[i].name = (i + 1);
    }
    
    return nTree;
}

function recursive_powerset(cn, vs, uc, d, t) {
    ///push the current node in the list of visited states
    vs.push(cn);
    ///break the name into parts so original nodes can be fetched from subset
    let cName = cn.name.split(',');
    ///get all the seperate nodes in the subset, if any of them are end nodes
    ///then this whole subset node is considered an end node
    let starts = [];
    for(let i = 0; i < cName.length; i++){
        starts.push(t.getNode(cName[i]));
        if(t.getNode(cName[i]).type == 'endNode'){
            if(cn.type == 'start'){
                continue;
            }else{
                cn.changeType('endNode');
            }
        }
    }
    ///ns (next states) is an object where the characters of the alphabet
    ///will be properties and the corresponding value will be array of 
    ///possible next states using the current character transition
    let ns = {};
    for (let i = 0; i < uc.length; i++) {
        ns[uc[i]] = [];
    }
    for(let i = 0; i < starts.length; i++){
        for(let j = 0; j < starts[i].next.length; j++){
            ns[starts[i].next[j].Via].push(starts[i].next[j].To);
        }
    }
    ///if there are no nodes in subset for given char add dead state
    ///else sort the subset by name of the state
    for (let i = 0; i < uc.length; i++) {
        if(ns[uc[i]].length == 0){
            ns[uc[i]].push(d);
        } else {
            ns[uc[i]].sort((e1, e2) => {
                return ((e1.name > e2.name) ? 1 : -1);
            });
        }
    }
    ///here we iterate over subsets for each char and handle appropriately
    for (let i = 0; i < uc.length; i++) {
        ///tn is temp node used to see if there already exists a node with 
        ///corresponding subset
        let tn;
        if (ns[uc[i]].length == 1) {
            ///if there is only one node in subset then make tn equal to it's
            ///name, if its the dead state then add transition and continue loop
            tn = ns[uc[i]][0].name;
            if(tn == 'dead'){
                cn.addNext(d, uc[i]);
                continue;
            }
        } else {
            ///create name corresponding to names of all nodes in subset
            tn = ns[uc[i]].map(x => x.name).join();
        }
        tn = tn.toString();
        let n;
        let tvs = [...vs];
        for(let i = 0; i < tvs.length; i++){
            if(tvs[i].name == tn){
                ///if there is node with tn name then make n equal to it
                n = tvs[i];
                break;
            }
        }
        if (n == null){
            ///if there is no node name corresponding to tn then make new node
            n = new Node(tn);
        }
        ///add transition to node using corresponding character
        cn.addNext(n, uc[i]);
        ///if the node is not included in the list of visited nodes then 
        ///execute the recursive powerset function on it and set the 
        ///visited nodes to be equal to hat it returns
        if(!vs.includes(n)){
            vs = recursive_powerset(n, vs, uc, d, t);
        }
    }
    return vs;
}

function reverseTree(t) {
    let r = t;
    let ls = [];
    for (let i = 0; i < r.nodes.length; i++) {
        ///change all start nodes into end nodes and vice versa
        if (r.nodes[i].type == 'endNode') {
            r.nodes[i].changeType('start');
        } else if (r.nodes[i].type == 'start') {
            r.nodes[i].changeType('endNode');
        }
        ///take all transitions for a given node and then 
        ///create an object representing the reverse of it
        ///and store in array
        for (let j = 0; j < r.nodes[i].next.length; j++) {
            let p = {
                f: r.nodes[i].name,
                t: r.nodes[i].next[j].To.name,
                v: r.nodes[i].next[j].Via
            };
            ls.push(p);
        }
        ///delete all transitions for node
        for (let j = (r.nodes[i].next.length - 1); j >= 0; j--) {
            while(j >= r.nodes[i].next.length){
                j--;
            }
            r.nodes[i].deleteNext(r.nodes[i].next[j].To.name);
        }
    }
    ///iterate through array of transitions and add the new reversed
    ///transitions to corresponding nodes
    for (let i = 0; i < ls.length; i++) {
        r.getNode(ls[i].t).addNext(r.getNode(ls[i].f), ls[i].v);
    }
    return r;
}

class Tree {
    ///all nodes in automaton
    nodes = [];
    ///starting point for input
    start = 'null';
    constructor(start) {
        this.start = start;
        this.nodes.push(start);
    }
    ///get start state
    get start() {
        return this.start;
    }
    ///get array of nodes
    get nodes() {
        return this.nodes;
    }
    ///add node to array of all nodes
    addNode(node) {
        this.nodes.push(node);
    }
    ///delete node from array of all nodes
    deleteNode(node) {
        for(let i = 0; i < this.nodes.length; i++){
            for(let j = 0; j < this.nodes[i].next.length; j++){
                if(this.nodes[i].next[j].To.name == node.name){
                    this.nodes[i].next.splice(j, 1);
                }
            }
        }
        this.nodes.splice(this.nodes.indexOf(node), 1);
    }
    ///get a specific node by its name
    getNode(name) {
        for (let i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i].name == name) {
                return this.nodes[i];
            }
        }
        return 'null';
    }
    ///return array of all unique characters used in transitions in the automaton
    getAllChars() {
        let chars = [];
        for (let i = 0; i < this.nodes.length; i++) {
            for (let j = 0; j < this.nodes[i].next.length; j++) {
                if (!chars.includes(this.nodes[i].next[j].Via)) {
                    chars.push(this.nodes[i].next[j].Via);
                }
            }
        }
        return chars;
    }
}

class Node {
    ///array of objects representing transitions from this node to another
    next = [];
    ///holds type of node i.e. endNode, normal, start
    type = 'normal';
    ///name of node
    name;
    constructor(name) {
        this.name = name;
    }
    ///returns name
    get name() {
        return this.name;
    }
    ///returns the array of objs representing transitions to other nodes
    get next() {
        return this.next;
    }
    ///return type
    get type() {
        return this.type;
    }
    ///change type 
    changeType(newType) {
        this.type = newType;
    }
    ///add obj representing transition to next array
    addNext(node, char) {
        this.next.push({
            To: node,
            Via: char
        });
    }
    ///delete all objs in next array to specific node
    deleteNext(name) {
        this.next.forEach((item) => {
            if (item.To.name == name) {
                this.next.splice(this.next.indexOf(item), 1);
            }
        });
    }
}

class Token {
    ///type of token i.e. chain, bracketed, or, *, +
    type = 'chain';
    ///array of all characters associated with this token (in order)
    chars = [];
    constructor(chars) {
        this.chars = chars;
    }
    ///return type
    get type() {
        return this.type;
    }
    ///return chars array
    get chars() {
        return this.chars;
    }
    ///change the type of this token
    changeType(newType) {
        this.type = newType;
    }
}