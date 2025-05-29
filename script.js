const deck = []
let pullIndex = 0
let pulledDeck = []
let theme = "dark"
const order = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]
const playingField = document.getElementById("playing_field")
const pullingDeck = document.getElementById("deck")
const puller = document.getElementById("puller")

function Start() {
    document.getElementById("start").style.display = "none" 
    document.getElementById("game").style.display = "block" 
    pullingDeck.innerHTML = `<img src="${theme}/BACK.png">` 
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
    const card = item.querySelector("img");
    if (!card || !card.classList.contains("facedown")) return

    const [value, suit, color] = card.id.split("-");
    const li = card.parentElement;
    card.dataset.sourceColumnId = li.parentElement.parentElement === playingField ? li.id : (li === puller ? puller.id : null)

    const targetFoundation = document.getElementById(`${suit}-A-slot`) 
    if (targetFoundation) {
        const lastCard = targetFoundation.querySelector("img:last-child") 
        if ((value === "A" && !lastCard) || (lastCard && order.indexOf(value) === order.indexOf(lastCard.id.split("-")[0]) + 1)) {
            TryFoundation(card, suit, targetFoundation) 
            // checkWin() 
            return 
        }
    }

    playingField.querySelectorAll("ul").forEach(column =>{
        if (column === li) return 
        const lastCard = column.querySelector("li:last-child img") 
        const sourceId = card.dataset.sourceColumnId 

        if ((!lastCard && value === "K") || (lastCard && OppositeColor(color, lastCard.id.split("-")[2]) && Smaller(value, lastCard.id.split("-")[0]))) {
            column.appendChild(item) 
            if (sourceId === puller.id) {
                if (pulledDeck.length > 0 && pulledDeck[pulledDeck.length - 1] === card) pulledDeck.pop() 
                else pulledDeck = pulledDeck.filter(c => c !== card) 
                updatePuller() 
            } else if (sourceId) turnUp(cardElement) 
            if (sourceId) delete card.dataset.sourceColumnId 
            // checkWin() 
            throw "StopIteration" 
        }
    })
}

function Pull() {
    if (deck.length === 0 && pulledDeck.length > 0) {
        // Reset deck from pulledDeck, excluding cards no longer in puller
        deck.push(...pulledDeck)
        pulledDeck = []
        puller.innerHTML = ""
        return
    }

    pullingDeck.innerHTML = ""

    if (deck.length > 0) {
        const pic = document.createElement("img")
        pic.setAttribute("src", `${theme}/BACK.png`)
        pullingDeck.appendChild(pic)
    }


    if (deck.length === 0) return // No more cards

    const card = deck.shift() // Take the top card
    pulledDeck.push(card)

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
    if (originalLi && originalLi !== pile && (originalLi.parentNode.parentNode === playingField ||originalLi.parentNode === puller) && originalLi.children.length === 0) {
        originalLi.remove()
    }
    card.classList.remove("selected")
    card.style.position = "static"

    if (sourceId === puller.id) {
        if (pulledDeck.length > 0 && pulledDeck[pulledDeck.length - 1] === card) pulledDeck.pop()
        else pulledDeck = pulledDeck.filter(c => c !== card)
        updatePuller()
    } else if (sourceId && document.getElementById(sourceId).parentNode === playingField) {
        turnUp(card)
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

    const isFromPuller = li.parentElement === puller

    const cardsInColumn = column.querySelectorAll("li")
    if (cardsInColumn.length === 0 && value === "K") {
        column.appendChild(li)
        if (isFromPuller) {
            updatePuller()
        }
        return
    }

    const lastLi = cardsInColumn[cardsInColumn.length - 1]
    const lastCard = lastLi.querySelector("img")
    const [lastValue, lastSuit, lastColor] = lastCard.id.split("-")

    if (OppositeColor(color, lastColor) && Smaller(value, lastValue)) {
        column.appendChild(li)
        if (isFromPuller) {
            updatePuller()
        }
    }
}

function updatePuller() {
    puller.innerHTML = ""
    if (pulledDeck.length > 0) {
        const previousCard = pulledDeck[pulledDeck.length - 1]
        const li = document.createElement("li")
        li.appendChild(previousCard)
        li.addEventListener("click", function() {
            Try(this)
        })
        revealLast(previousCard)
        puller.appendChild(li);
    }
}

function Smaller(compared, referance){
    return order.indexOf(compared) + 1 === order.indexOf(referance)
}

function Spread(){
    playingField.innerHTML = ""
    for (let index = 0; index < 7; index++) {
        const ul = document.createElement("ul")
        ul.setAttribute("id", `col-${index}`)
        for (let i = 0; i < index+1; i++) {
            let li =document.createElement("li")
            let pic = deck.shift()
            li.appendChild(pic)

            if (i == index) {
                Reveal(pic, true)
            }
            else{
                pic.setAttribute("src", `${theme}/BACK.png`)
                pic.classList.add("facedown")
            }
            li.addEventListener("click", function(){
                Try(this)
            })

            ul.appendChild(li)
        }
        ul.addEventListener("dragover", function(e) {
            e.preventDefault()
        })
        ul.addEventListener("drop", function(e) {
            e.preventDefault()
            this.classList.remove("valid-drop")
            try{
                const ids = JSON.parse(e.dataTransfer.getData("text/plain"));
                const draggedLis = ids.map(id => {
                    const img = document.getElementById(id);
                    return img.closest("li");
                });
                const firstCard = draggedLis[0].querySelector("img");
                const [val, suit, color] = firstCard.id.split("-");

                const targetLis = this.querySelectorAll("li")
                
                if (targetLis.length === 0 && val !== "K") {
                    return;
                }
                if (targetLis.length > 0) {
                    const lastCard = this.querySelector("li:last-child img");
                    const [lastVal, lastSuit, lastColor] = lastCard.id.split("-");
                    if (!OppositeColor(color, lastColor) || !Smaller(val, lastVal)) {
                        return;
                    }
                }
                const sourceElement = draggedLis[0].parentElement;
                const isFromPuller = sourceElement === puller;
                
                draggedLis.forEach(li => {
                    this.appendChild(li);
                })
                
                if (isFromPuller) {
                    updatePuller();
                } else {
                    const lastCard = this.querySelector("li:last-child img");
                    if (lastCard && lastCard.classList.contains("facedown")) {
                        Reveal(lastCard);
                    }
                    // checkWin()
                }
            } catch (err) {console.error("Drop error", err)}
        })
        playingField.appendChild(ul)
    }
}

function Reveal(img, fromSpread = false){
    if (!img || !img.id) return
    if (!img.classList.contains("facedown") && !fromSpread) return;
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
        
        const allColumns = document.querySelectorAll("#playingField ul")
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

function revealLast(movedCard) {
    const sourceColumnId = movedCard.dataset.sourceColumnId 
    if (!sourceColumnId) return 
    const sourceColumn = document.getElementById(sourceColumnId) 
    if (sourceColumn?.parentElement === playingField) {
        const lastLi = sourceColumn.querySelector("li:last-child") 
        if (lastLi) Reveal(lastLi.querySelector("img"))
    }
    delete movedCard.dataset.sourceColumnId 
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
    deck.length = 0
    pulledDeck.length = 0
    updatePuller()

    const suits = [
        { code: "C", color: "black" }, // Clubs - Treff
        { code: "D", color: "red" },   // Diamonds - Káró
        { code: "P", color: "black" }, // Spades - Pick (S lenne a jó jelzés, de csak P jelzővel találtam jó asseteket, és lusta vagyok átírni, szóval...)
        { code: "H", color: "red" }    // Hearts - Kör
    ].forEach(suit => {
            for (let i = 0; i < 13; i++) {
                const img = document.createElement("img")
                img.setAttribute("id", `${order[i]}-${suit.code}-${suit.color}`)
                img.setAttribute("draggable", true)
                deck.push(img)
            }
        })

    if (deck.length !== 52) {
        console.error("Deck is not properly filled:", deck.length, "cards found.")
    }

    Shuffle()
}

function changeTheme() {
    theme = theme === "dark" ? "light" : "dark" 
    document.body.className = `${theme}-theme`
    document.querySelectorAll("img").forEach(img => {
        if (img.classList.contains("facedown") || img.parentElement === pullingDeck) {
            img.setAttribute("src", `${theme}/BACK.png`) 
        } else if (img.id) {
            const [val, suit] = img.id.split("-") 
            img.setAttribute("src", `${theme}/${val}-${suit}.png`) 
        }
    }) 
}