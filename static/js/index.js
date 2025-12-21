let decklists = [];
/**
 * [
 *  {
 *      "name": <deck_title>,
 *      "decklist": []
 *  },
 * ]
 */

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

const saveDeck = (name, decklist) => {
    decklists.push({
        "name": name,
        "decklist": decklist
    });
    return;
}


const getModalElements = () => {
    let modalElements = {};
    modalElements['title'] = document.getElementById("deck-name-input");
    modalElements['decklist'] = document.getElementById("modal-decklist-input");
    return modalElements;
}

const getSavedDeckTitles = () => {
    let deckTitles = [];
    
    decklists.forEach((deck)=>{
        deckTitles.push(deck['name']);
    });

    return deckTitles;
}

const getDecklistsInDOM = () => {
    let deckNames = [];
    const allDecks = document.getElementById("decklists");
    for (var i = 0; i < allDecks.children.length; i++) {
        //tr
        if (allDecks.children[i].children.length > 0) {
            //td
            if (allDecks.children[i].children[0] && allDecks.children[i].children[0].children.length >= 2) {
                //[0] is checkbox, [1] is span w/ deckname as innerText
                var name = allDecks.children[i].children[0].children[1].innerText;
                deckNames.push(name);
            }
        }
    }

    return deckNames;
}


const addDeckToView = (name) => {
    let newRow = document.createElement("tr");
    let newData = document.createElement("td");
    let newDeck = document.createElement("span");
    newDeck.innerText = name;
    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    newData.appendChild(checkbox);
    newData.appendChild(newDeck);
    newRow.appendChild(newData);

    const decklistTable = document.getElementById("decklists");
    decklistTable.append(newRow);
    return;
}

const getDecklistForName = (name) => {
    decklists.forEach((deck) => {
        if (deck.name == name) {
            return deck.decklist;
        }
    });

    return false;
}


const updateDecklistTable = () => {
    /**
     * to be called after updating the `decklists` runtime variable;
     * checks for changes to the state of `decklists`, and updates the UI
     * to reflect any changes found
     */

    // get View repr of decklists
    let decklistView = getDecklistsInDOM();
    let decklistState = getSavedDeckTitles();

    decklistState.forEach((deck)=>{
        if (!decklistView.includes(deck)) {
            addDeckToView(deck, decklists)
        }
    });
}



const submitDeck = () => {
    let result = {
        "status": "",
        "code": "",
        "message": ""
    };

    // validate deck title non-empty, and not duplicate
    let modalElements = getModalElements();
    console.log("Checking that we're getting valid modal elements: ", modalElements);
    const deckTitles = getSavedDeckTitles();
    // CARE: `.value` liable to change based on HTML updates (e.g. not using input anymore)
    let newDeckTitle = modalElements["title"].value;
    if (newDeckTitle == "") {
        result.status = "fail";
        result.code = "empty_name";
        result.message = "Empty name is not supported for decklists. Please provide a name for the decklist.";
        console.log(result);
        return;
    }


    let newDecklist = parseDecklist(modalElements["decklist"].value);
    let validCheck = validateDecklist(newDecklist);
    
    if (validCheck.isValid != true) {
        result.status = "fail";
        result.code = "invalid_decklist";
        result.message = validCheck.message;
        console.log(result);
        return;
    }

    if (deckTitles.includes(newDeckTitle)) {
        result.status = "fail";
        result.code = "name_conflict";
        result.message = `${newDeckTitle} conflicts with another deck in saved decklists. Please use unique deck names.`;
        console.log(result);
        return;
    }

    // add the new deck to the runtime list
    saveDeck(newDeckTitle, newDecklist);
    closeModal();
    updateDecklistTable();
    result.status = "success";

    console.log(result);
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

const newDeckButton = document.getElementById("create-new");
newDeckButton.addEventListener("click", openModal);

const showDecks = document.getElementById("show-decklists");
showDecks.addEventListener("click", ()=>{logOutput(JSON.stringify(decklists, undefined, 4))});

const clearButton = document.getElementById("clear-output");
clearButton.addEventListener("click", clearOutput);

const saveModalButton = document.getElementById("save-new-deck");
saveModalButton.addEventListener("click", submitDeck);

const closeModalButton = document.getElementById("close-modal");
closeModalButton.addEventListener("click", closeModal);

/**
 * TODO: `rewire`; save button on the modal should:
 * 
 * - check required fields are filled (deck name, decklist)
 * - check the name isn't a duplicate
 * - basic validation of the decklist (100 cards)
 * - add decklist to runtime datastructure
 * - 
 */


// TODO: `escape (esc) to close support`; retain until you decide if you want this to be part of the UX or not.
// nice to have, but worried that habitually hitting esc will cause data loss.
// If you're going to leave this in, make sure to implement an "are you sure" if
// fields have been changed on the modal. (Double esc insta-closes)
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

