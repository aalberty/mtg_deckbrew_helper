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

}

const submit = function () {
    console.log("Onclick: submit clicked...");
    const textarea = document.getElementById("decklist-input");
    const rawInput = textarea.innerText;
    const parsedList = parseDecklist(rawInput);
    alert("parsed decklist:", parsedList);
}

const submitButton = document.getElementById("submit-decklist");
submitButton.addEventListener("click", submit);




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