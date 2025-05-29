const deck = []
let pull_index = 0
let pulled_deck = []
let theme = "dark"
const playing_field = document.getElementById("playing_field")
const pulling_deck = document.getElementById("deck")
const puller = document.getElementById("puller")

function Start() {
    document.getElementById("start").style.display = "none" 
    document.getElementById("game").style.display = "block" 
    pulling_deck.innerHTML = `<img src="${theme}/BACK.png">` 
    Fill() 
    Spread() 

    ["P", "C", "D", "H"].forEach(suit => {
        const pile = document.getElementById(`${suit}-A-slot`) 
        if (!pile) return console.error(`Az alap tároló a ${suit} típushoz nem található.`) 
        pile.addEventListener("dragover", e => e.preventDefault())
        pile.addEventListener("drop", function(e) {
            e.preventDefault() 
            this.classList.remove("valid-drop-target") 
            try {
                const ids = JSON.parse(e.dataTransfer.getData("text/plain")) 
                const card = document.getElementById(Array.isArray(ids) ? ids[0] : ids) 
                if (card && card.id) {
                    TryFoundation(card, card.id.split("-")[1], this) 
                }
            } catch (err) { console.error("Invalid drag data.", err)  }
        }) 
    }) 
}

function Try(item) {
    const card = item.querySelector("img") || item;
    const [value, suit, color] = card.id.split("-");
    const li = card.parentElement;
    const columns = playing_field.querySelectorAll("ul");

    for (const column of columns) {
        const lis = column.querySelectorAll("li");
        if (lis.length === 0) continue;

        const lastCard = lis[lis.length - 1].querySelector("img");
        const [lastValue, lastSuit, lastColor] = lastCard.id.split("-");

        if (Smaller(value, lastValue) && OppositeColor(color, lastColor)) {
            const sourceColumn = li.parentElement;
            column.appendChild(li);
            
            // Handle source column updates
            if (sourceColumn !== puller) {
                const remaining = sourceColumn.querySelectorAll("li");
                if (remaining.length > 0) {
                    const lastInColumn = remaining[remaining.length - 1].querySelector("img");
                    if (lastInColumn && lastInColumn.classList.contains("facedown")) {
                        Reveal(lastInColumn);
                    }
                }
            } else {
                updatePullerAfterMove();
            }
            return;
        }
    }
}


function Pull() {
    if (deck.length === 0 && pulled_deck.length > 0) {
        // Reset deck from pulled_deck, excluding cards no longer in puller
        deck.push(...pulled_deck)
        pulled_deck = []
        puller.innerHTML = ""
        return
    }

    pulling_deck.innerHTML = ""

    if (deck.length > 0) {
        const pic = document.createElement("img")
        pic.setAttribute("src", `${theme}/BACK.png`)
        pulling_deck.appendChild(pic)
    }


    if (deck.length === 0) return // No more cards

    const card = deck.shift() // Take the top card
    pulled_deck.push(card)

    Reveal(card)

    puller.innerHTML = "" // Clear old card
    const li = document.createElement("li")
    li.appendChild(card)
    li.addEventListener("click", function () {
        Try(this)
    })
    puller.appendChild(li)
}

function TryFoundationDrop(suit) {
    const selected = document.querySelector(".selected")
    if (!selected) return

    const [value, cardSuit, color] = selected.id.split("-")
    if (cardSuit !== suit) return

    const targetPile = document.getElementById(`${suit}-A-slot`)
    const pileImages = targetPile.querySelectorAll("img")

    const order = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]

    if (pileImages.length === 0 && value === "A") {
        moveToFoundation(selected, targetPile)
    } else if (pileImages.length > 0) {
        const lastCardId = pileImages[pileImages.length - 1].id
        const [lastValue] = lastCardId.split("-")
        if (order.indexOf(value) === order.indexOf(lastValue) + 1) {
            moveToFoundation(selected, targetPile)
        }
    }
}

function moveToFoundation(card, pile) {
    const originalLi = card.parentNode
    const sourceId = card.dataset.sourceColumn
    pile.appendChild(card)
    if (originalLi && originalLi !== pile && (originalLi.parentNode.parentNode === playing_field ||originalLi.parentNode === puller) && originalLi.children.length === 0) {
        originalLi.remove()
    }
    card.classList.remove("selected")
    card.style.position = "static"

    if (sourceId === puller.id) {
        if (pulled_deck.length > 0 && pulled_deck[pulled_deck.length - 1] === card) pulled_deck.pop()
        else pulled_deck = pulled_deck.filter(c => c !== card)
        updatePullerAfterMove()
    } else if (sourceId && document.getElementById(sourceId).parentNode === playing_field) {
        Reveal(originalLi.parentNode.children[originalLi.parentNode.children.length-2])
    }
}

function OppositeColor(compared, referance) {
    return (compared === "red" && referance === "black") || (compared === "black" && referance === "red")
}

function TryFoundation(card, suit, pile) {
    if (!card) {
        console.error(`Invalid card: ${card}`);
        return;
    }

    const [value, cardSuit, color] = card.id.split("-")
    if (cardSuit !== suit) return

    const pileImages = pile.querySelectorAll("img")
    const order = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]

    if (pileImages.length === 0 && value === "A") {
        moveToFoundation(card, pile)
    } else if (pileImages.length > 0) {
        const lastCardId = pileImages[pileImages.length - 1].id
        const [lastValue] = lastCardId.split("-")
        if (order.indexOf(value) === order.indexOf(lastValue) - 1) {
            moveToFoundation(card, pile)
        }
    }
}

function TryMove(card, column) {
    const [value, suit, color] = card.id.split("-")
    const li = card.parentNode

    // Check if the card is coming from the puller
    const isFromPuller = li.parentElement === puller

    const cardsInColumn = column.querySelectorAll("li")
    if (cardsInColumn.length === 0 && value === "K") {
        column.appendChild(li)
        // Handle puller update if card came from puller
        if (isFromPuller) {
            updatePullerAfterMove()
        }
        return
    }

    const lastLi = cardsInColumn[cardsInColumn.length - 1]
    const lastCard = lastLi.querySelector("img")
    const [lastValue, lastSuit, lastColor] = lastCard.id.split("-")

    if (OppositeColor(color, lastColor) && Smaller(value, lastValue)) {
        column.appendChild(li)
        // Handle puller update if card came from puller
        if (isFromPuller) {
            updatePullerAfterMove()
        }
    }
}

function updatePullerAfterMove() {
    if (pulled_deck.length > 0) {
        pulled_deck.pop()
    }
    puller.innerHTML = ""
    if (pulled_deck.length > 0) {
        const previousCard = pulled_deck[pulled_deck.length - 1]
        const li = document.createElement("li")
        li.appendChild(previousCard)
        li.addEventListener("click", function() {
            Try(this)
        })
        turnUp(previousCard)
        puller.appendChild(li);
    }
}

function Smaller(compared, referance){
    const order = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]
    return order.indexOf(compared) + 1 === order.indexOf(referance)
}

function Spread(){
    for (let index = 0; index < 6; index++) {
        const ul = document.createElement("ul")
        for (let i = 0; i < index+1; i++) {
            let li =document.createElement("li")
            let pic = deck.shift()

            if (i == index) {
                Reveal(pic)
            }
            else{
                pic.setAttribute("src", `${theme}/BACK.png`)
                pic.classList.add("facedown")
            }
            li.addEventListener("click", function(){
                Try(this)
            })

            li.appendChild(pic)
            ul.appendChild(li)
        }
        ul.addEventListener("dragover", function(e) {
            e.preventDefault()
        })
ul.addEventListener("drop", function(e) {
    e.preventDefault();
    this.classList.remove("valid-drop");

    const ids = JSON.parse(e.dataTransfer.getData("text/plain"));
    const draggedLis = ids.map(id => {
        const img = document.getElementById(id);
        return img.closest("li");
    });

    const firstCard = draggedLis[0].querySelector("img");
    const [val, suit, color] = firstCard.id.split("-");

    const targetLis = this.querySelectorAll("li");

    // Validate the move
    if (targetLis.length === 0 && val !== "K") {
        return;
    }
    if (targetLis.length > 0) {
        const lastCard = targetLis[targetLis.length - 1].querySelector("img");
        const [lastVal, lastSuit, lastColor] = lastCard.id.split("-");
        if (!OppositeColor(color, lastColor) || !Smaller(val, lastVal)) {
            return;
        }
    }

    // Store source information
    const sourceElement = draggedLis[0].parentElement;
    const isFromPuller = sourceElement === puller;

    // Move the cards
    draggedLis.forEach(li => {
        this.appendChild(li);
    });

    // Handle source updates
    if (isFromPuller) {
        updatePullerAfterMove();
    } else {
        // For column moves, reveal the next card
        const remainingCards = sourceElement.querySelectorAll("li");
        if (remainingCards.length > 0) {
            const lastCard = remainingCards[remainingCards.length - 1].querySelector("img");
            if (lastCard && lastCard.classList.contains("facedown")) {
                Reveal(lastCard);
            }
        }
    }
});
playing_field.appendChild(ul)
}
}

function Reveal(img){
    if (!img || !img.id) return
    if (!img.classList.contains("facedown")) return;
    img.setAttribute("draggable", true)
    img.classList.remove("facedown")
    
    img.addEventListener("dragstart", function(e) {
        const draggedLi = this.parentElement
        const column = draggedLi.parentElement
        const allLis = Array.from(column.querySelectorAll("li"))
        const index = allLis.indexOf(draggedLi)
        const draggedStack = allLis.slice(index)
        const ids = draggedStack.map(li => li.querySelector("img").id)
        e.dataTransfer.setData("text/plain", JSON.stringify(ids))
        
        const topCard = draggedStack[0].querySelector("img")
        const [val, suit, color] = topCard.id.split("-")
        
        const allColumns = document.querySelectorAll("#playing_field ul")
        allColumns.forEach(col => {
            const lis = col.querySelectorAll("li")
            if (lis.length === 0 && val === "K") {
                col.classList.add("valid-drop")
            } else if (lis.length > 0) {
                const lastCard = lis[lis.length - 1].querySelector("img")
                const [lastVal, lastSuit, lastColor] = lastCard.id.split("-")
                if (OppositeColor(color, lastColor) && Smaller(val, lastVal)) {
                    col.classList.add("valid-drop")
                }
            }
        })
    })
    img.addEventListener("dragend", function () {
        document.querySelectorAll(".valid-drop").forEach(col => {
            col.classList.remove("valid-drop")
        })
    })
    
    const [val, suit, color] = img.id.split("-");
    img.setAttribute("src", `${theme}/${val}-${suit}.png`);
    img.classList.remove("facedown");
}

function turnUp(card, isFaceUp = true){
    if (!card || !card.id) return 
    const [value, suit] = imgElement.id.split("-") 
    card.setAttribute("src", isFaceUp ? `${theme}/${value}-${suit}.png` : `${theme}/BACK.png`) 
    card.classList.toggle("facedown", !isFaceUp) 
    card.setAttribute("draggable", isFaceUp) 
}

function Shuffle() {
    if (deck.length !== 52) {
        console.warn("Deck not full during shuffle, refilling + reshuffle.")
        Fill()
    }

    for (let i = deck.length - 1; i > 0; i--) {
        const j = Random(0, i)
        const temp = deck[i]
        deck[i] = deck[j]
        deck[j] = temp
    }
}


function Random(min, max){
    return Math.floor((Math.random() * (max-min+1)+min))
}

function Fill() {
    deck.length = 0;

    const suits = [
        { code: "C", color: "black" }, // Clubs - Treff
        { code: "D", color: "red" },   // Diamonds - Káró
        { code: "P", color: "black" }, // Spades - Pick (S lenne a jó jelzés, de csak P jelzővel találtam jó asseteket, és lusta vagyok átírni, szóval...)
        { code: "H", color: "red" }    // Hearts - Kör
    ]

    for (const suit of suits) {
        for (let i = 0; i < 13; i++) {
            const img = document.createElement("img")
            const val = IndexCheck(i)
            img.setAttribute("id", `${val}-${suit.code}-${suit.color}`)
            img.setAttribute("draggable", true)
            deck.push(img)
        }
    }

    if (deck.length !== 52) {
        console.error("Deck is not properly filled:", deck.length, "cards found.")
    }

    Shuffle()
}


function IndexCheck(i){
    if (i == 10) {
        return "J"
    }
    else if (i == 11) {
        return "Q"
    }
    else if (i == 12) {
        return "K"
    }
    else if (i == 0) {
        return "A"
    }
    else{
        return i+1
    }
}

function Change_Theme() {

    const game = document.querySelector("body")
    game.classList.toggle("theme-dark")
    game.classList.toggle("theme-light")
    if (theme == "dark") {
        theme = "light"
    }
    else{
        theme = "dark"
    }
}
