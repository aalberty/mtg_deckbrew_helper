let decklists = [];

const parseDecklist = (raw) => {
    let rawLines = raw.split("\n");
    let decklist = [];
    rawLines.forEach((line)=>{
        let count = "";
        let name = "";
        let splitLine = line.split(' ');

        if (splitLine.length >= 2) {
            count = splitLine[0];
            name = (splitLine.slice(1)).join(' ');
            decklist.push({'count': count, 'name': name});
        }
    });
    return decklist;
}

const validateDecklist = (list) => {
    let response = {'isValid': false, 'message': ""};
    let cardCount = 0;
    list.forEach((distinctCard, index)=>{
        let iCount = 0;

        try {
            iCount = parseInt(distinctCard.count);
        } catch (e) {
            let msg = `validateDecklist -- Error parsing count for card at index ${index}.`;
            console.warn(msg, list);
            response.message = msg;
            return response;
        }

        cardCount += iCount;
    });

    if (cardCount != 100) {
        response.message = `Decklist invalid - incorrect number of cards in library. ${cardCount}/100.`;
        return response;
    }

    response.isValid = true;
    response.message = "OK";
    return response;
}

const displayDecklist = (deckSelected) => {
    const decklistDisplay = document.getElementById("decklist-input");
    let index = (deckSelected.srcElement.selectedIndex) - 1; // account for placeholder element in index 0
    
    if (index >= decklists.length) {
        console.warn(`Selected option reports an index that is out-of-bounds for current decklist.\nIndex: ${index}\nDecklists.length: ${decklists.length}`);
    } else if (index == undefined) {
        console.warn("Invalid index received from onChange event.");
    } else {
        let ppDecklist = "";
        decklists[index].decklist.forEach((card)=>{
            ppDecklist += `${card.count} ${card.name}\n`;
        });
        decklistDisplay.innerText = ppDecklist;
    }
    
    return;
}

const addDeckOption = (list) => {
    let deck = {name: `Deck ${decklists.length+1}`, decklist: list};
    decklists.push(deck);
    const deckSelector = document.getElementById("decklists");
    let opt = document.createElement("option");
    opt.value = deck.name;
    opt.innerText = deck.name;
    deckSelector.appendChild(opt);
    return;
}

const submit = () => {
    const textarea = document.getElementById("decklist-input");
    const rawInput = textarea.value;
    const parsedList = parseDecklist(rawInput);
    console.log("parsed decklist:", parsedList);
    let validDeck = validateDecklist(parsedList);
    console.log("isValid response - ", validDeck);
    if (validDeck.isValid) {
        addDeckOption(parsedList);
    }
    return;
}

const clear = () => {
    const textarea = document.getElementById("decklist-input");
    textarea.value = "";
    return;
}

const analyze = () => {
    // console.log("analyzing...");
    // build inventory of cards across all provided decklists in the format
    // [ {card: "", deck_id: ""}, ... ]
    var inventory = [];
    decklists.forEach((deck, index)=>{
        deck.decklist.forEach((card) => {
            inventory.push({card: card.name, deck_id: `deck_${index+1}`});
        });
    });
    // console.log("Inventory: ", inventory);

    // find cards common across all provided decks
    let common = [];

    for (var i = 0; i < inventory.length; i++) {
        if (i == 0) {
            // console.log("Sample card from inventory during loop: ", inventory[i].card);
        }

        if (common.includes(inventory[i].card) || i == inventory.length - 1) {
            continue;
        }

        let count = 1;
        for (var j = (i + 1); j < inventory.length; j++) {
            if (inventory[j].card == inventory[i].card) {
                count++;
            }
        }
        if (count >= decklists.length) {
            common.push(inventory[i].card);
        } 
    } 

    // console.log("Common: ", common);

    // find cards that are present in at least one deck, but not all decks;
    // group by number of decks the card is found in


    var distinct = {}
    var distinct_keys = []
    for (var i = 0; i < inventory.length; i++) {
        if (common.includes(inventory[i].card)) { continue }

        if (distinct_keys.includes(inventory[i].card)) {
            distinct[inventory[i].card].count++
            distinct[inventory[i].card].decks.push(inventory[i].deck_id)
        } else {
            distinct_keys.push(inventory[i].card)
            distinct[inventory[i].card] = { count: 1, decks: [inventory[i].deck_id] }
        }
    }

    let distinct_by_count = [];
    for (var c = 0; c < decklists.length - 1; c++) {
        distinct_by_count.push([]);
    }

    for (var i = 0; i < distinct_keys.length; i++) {
        distinct_by_count[distinct[distinct_keys[i]].count - 1].push(distinct_keys[i] + '');
    }

    let results = `Analysis complete!
Cards common across all provided decklists: ${common.join('\n')}\n`;

    distinct_by_count.forEach((group, index) => {
        results += `Cards found in ${index+1} of ${decklists.length} decks: ${JSON.stringify(distinct_by_count[index], undefined, 4)}`;
    });

    console.log(results);
}

const addDeck = (event) => {
    // console.log("Event details: ", event);
    if (event.type == "change" || (event.type == "keyup" && event.key == "Enter")) {
        const userInput = document.getElementById("new-deck-input");
        let proposedName = (userInput.value).split("");
        if (proposedName.length > 1) {
            if (proposedName[proposedName.length - 1] == "\n") {
                proposedName.pop();
                const parentTd = userInput.parentElement;
                userInput.remove();
                let namedDeck = document.createElement("span");
                namedDeck.innerText = proposedName.join("");
                // update the callback to get the deck name via source element attrb,
                // and then console log the decklist associated with it
                namedDeck.addEventListener("click", () => { console.log(proposedName.join("")) });
                parentTd.appendChild(namedDeck);
                const textarea = document.getElementById("decklist-input");
                let decklist = parseDecklist(textarea.value);
                decklists.push({"name": namedDeck.innerText, "decklist": decklist});
            }
        } else {
            alert("Deck names should be more than one character long.");
            // clear the input and let them try again
            userInput.value = "";
        }

    }
}

const askForDeckName = () => {
    const decklistTable = document.getElementById("decklists");
    let newDeck = document.createElement("tr");
    let contents = document.createElement("td");
    let userInput = document.createElement("textarea");
    userInput.id = "new-deck-input";
    userInput.addEventListener("change", addDeck);
    userInput.addEventListener("keyup", addDeck);
    contents.appendChild(userInput);
    newDeck.appendChild(contents);
    decklistTable.appendChild(newDeck);
    return;
}

// const deckSelector = document.getElementById("decklists");
// deckSelector.addEventListener("change", displayDecklist);

// const submitButton = document.getElementById("submit-decklist");
// submitButton.addEventListener("click", submit);

// const clearButton = document.getElementById("clear-decklist");
// clearButton.addEventListener("click", clear);

// const analyzeButton = document.getElementById("run-analysis");
// analyzeButton.addEventListener("click", analyze);

const newDeckButton = document.getElementById("create-new");
newDeckButton.addEventListener("click", askForDeckName);

const showDecks = document.getElementById("show-decklists");
showDecks.addEventListener("click", ()=>{console.log(decklists)})



const placeholder = function () {
    // the individuals scripts from when I made my cedh decklist
    var inventory = []
    for (var i = 0; i < decks.length; i++) {
        for (var j = 0; j < decklists[decks[i]].length; j++) {
            inventory.push({
                card: decklists[decks[i]][j],
                deck_id: 'deck' + (i + 1).toString()
            })
        }
    }

    var common = []
    for (var i = 0; i < inventory.length; i++) {
        if (common.includes(inventory[i].card) || i == inventory.length - 1) {
            continue;
        }
        var count = 1
        for (var j = (i + 1); j < inventory.length; j++) {
            if (inventory[j].card == inventory[i].card) {
                count++;
            }
        }
        if (count >= 5) {
            common.push(inventory[i].card)
        }
    }

    var distinct = {}
    var distinct_keys = []
    for (var i = 0; i < inventory.length; i++) {
        if (common.includes(inventory[i].card)) { continue }

        if (distinct_keys.includes(inventory[i].card)) {
            distinct[inventory[i].card].count++
            distinct[inventory[i].card].decks.push(inventory[i].deck_id)
        } else {
            distinct_keys.push(inventory[i].card)
            distinct[inventory[i].card] = { count: 1, decks: [inventory[i].deck_id] }
        }
    }

    distinct_by_count = [[], [], [], []]
    for (var i = 0; i < distinct_keys.length; i++) {
        distinct_by_count[distinct[distinct_keys[i]].count - 1].push(distinct_keys[i] + '')
    }


}