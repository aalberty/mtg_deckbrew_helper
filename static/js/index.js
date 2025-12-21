let decklists = [];
const output = document.getElementById("output");
var outputContent = "";

const logOutput = (msg) => {
    var alwaysClear = document.getElementById("always-clear-output");
    if (alwaysClear.checked) {
        outputContent = msg;
    } else {
        outputContent = msg + "\n\n---------------\n\n" + outputContent; 
    }
    output.innerText = outputContent;
    return;
}

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
/*
// Remove?
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

// Remove?
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

// Remove?
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

// Remove?
const clear = () => {
    const textarea = document.getElementById("decklist-input");
    textarea.value = "";
    return;
}
*/

const getTargetDecks = () => {
    let allDecks = document.getElementById("decklists");
    let targetDecks = [];

    for (var i = 0; i < allDecks.children.length; i++) {
        //tr
        if (allDecks.children[i].children.length > 0) {
            //td
            if (allDecks.children[i].children[0] && allDecks.children[i].children[0].children.length >= 2) {
                //[0] is checkbox, [1] is span w/ deckname as innerText
                if (allDecks.children[i].children[0].children[0].checked) {
                    var name = allDecks.children[i].children[0].children[1].innerText;
                    decklists.forEach((deck) => {
                        if (deck.name == name) {
                            targetDecks.push(deck);
                            return;
                        }
                    });
                }
            }
        }
    }

    return targetDecks;
}

const analyze = () => {
    let targetDecks = getTargetDecks();

    if (targetDecks.length < 2) {
        // console.warn("Must select more than one deck in order to get useful analysis.");
        logOutput("WARNING: Must select more than one deck in order to get useful analysis.");

        return;
    }

    var inventory = [];

    let startMsg = ""; 
    let targetDeckNames = [];
    targetDecks.forEach((deck) => {
        targetDeckNames.push(deck.name);
    });

    startMsg = "Analyzing decks: ";
    startMsg += targetDeckNames.join(",");



    targetDecks.forEach((deck, index)=>{
        deck.decklist.forEach((card) => {
            inventory.push({card: card.name, deck_id: `deck_${index+1}`});
        });
    });

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
        if (count >= targetDecks.length) {
            common.push(inventory[i].card);
        } 
    } 

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
    for (var c = 0; c < targetDecks.length - 1; c++) {
        distinct_by_count.push([]);
    }

    for (var i = 0; i < distinct_keys.length; i++) {
        distinct_by_count[distinct[distinct_keys[i]].count - 1].push(distinct_keys[i] + '');
    }

    let results = `${startMsg}\n\nAnalysis complete!\n
Cards common across all provided decklists: \n${JSON.stringify(common, undefined, 4)}\n\n`;

    distinct_by_count.forEach((group, index) => {
        results += `Cards found in ${index+1} of ${targetDecks.length} decks: \n${JSON.stringify(distinct_by_count[index], undefined, 4)}`;
    });

    // console.log(results);
    logOutput(results);
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
                let checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                parentTd.appendChild(checkbox);
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

// TODO: `rewire` to the modal experience
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
    userInput.focus();
    return;
}

const clearOutput = () => {
    output.innerText = "";
    outputContent = "";
    return;
}

const closeModal = () => {
    const modalBackdrop = document.getElementById("modal-backdrop");
    const newDeckModal = document.getElementById("new-deck-modal");
    newDeckModal.classList.remove("is-visible");
    modalBackdrop.classList.remove("is-visible");
}

const openModal = () => {
    const modalBackdrop = document.getElementById("modal-backdrop");
    const newDeckModal = document.getElementById("new-deck-modal");
    modalBackdrop.classList.add("is-visible");
    newDeckModal.classList.add("is-visible");
}

const modalTemplate = document.getElementById("modal-template");
const modalBackdrop = document.getElementById("modal-backdrop");
const modal = modalTemplate.content.cloneNode(true);
modalBackdrop.appendChild(modal);

const analyzeButton = document.getElementById("run-analysis");
analyzeButton.addEventListener("click", analyze);

// TODO: rewire; attach `openModal` here
const newDeckButton = document.getElementById("create-new");
newDeckButton.addEventListener("click", askForDeckName);

const showDecks = document.getElementById("show-decklists");
showDecks.addEventListener("click", ()=>{logOutput(JSON.stringify(decklists, undefined, 4))});

const clearButton = document.getElementById("clear-output");
clearButton.addEventListener("click", clearOutput);

const closeModalButton = document.getElementById("close-modal");
closeModalButton.addEventListener("click", closeModal);

/*
// close modal with esc key
document.addEventListener("keydown", (e) => {
    if (modalBackdrop.classList.contains("is-visible"))
        // console.log(e);
        if (e.key == "Escape") {
            closeModal();
        }
    else
        console.log("modal hidden currently.");
});
*/
// TODO: unwire; removing the button
const testModalButton = document.getElementById("test-modal");
testModalButton.addEventListener("click", openModal);


