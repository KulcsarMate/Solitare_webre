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
            } else if (sourceId) turnUp(card) 
            if (sourceId) delete card.dataset.sourceColumnId 
            // checkWin() 
            throw "StopIteration" 
        }
    })
}

function Pull() {
    if (deck.length === 0) {
        if (pulledDeck.length > 0) {
            deck.push(...pulledDeck)
            pulledDeck = []
            updatePuller()
            pullingDeck.innerHTML = deck.length > 0 ? `<img src="${theme}/BACK.png">` : `<img src="${theme}/arrow.png">`
        } else{
            pullingDeck.innerHTML = ""
        }
        return
    }
    const card = deck.shift() 
    pulledDeck.push(card) 
    Reveal(card) 
    updatePuller() 
    pullingDeck.innerHTML = deck.length > 0 ? `<img src="${theme}/BACK.png">` : ""
}

function moveToFoundation(card, target) {
    const originalLi = card.parentNode 
    const sourceId = card.dataset.sourceColumnId 
    target.innerHTML = ""
    target.appendChild(card) 
    if (originalLi && originalLi !== target && (originalLi.parentNode?.classList.contains("table-column") || originalLi.parentNode === puller) && originalLi.children.length === 0) {
        originalLi.remove() 
    }
    card.classList.remove("selected") 
    card.style.position = "static" 

    if (sourceId === puller.id) {
        if (pulledDeck.length > 0 && pulledDeck[pulledDeck.length - 1] === card) pulledDeck.pop() 
        else pulledDeck = pulledDeck.filter(c => c !== card) 
        updatePuller() 
    } else if (sourceId && document.getElementById(sourceId)?.classList.contains("table-column")) {
        revealLast(card)
    }
    if (sourceId) delete card.dataset.sourceColumnId
}

function OppositeColor(compared, referance) {
    return (compared === "red" && referance === "black") || (compared === "black" && referance === "red")
}

function TryFoundation(card, suit, target) {
    if (!card || !target || card.id.split("-")[1] !== suit || !target.id.startsWith(suit + "-A-slot")) return 
    const value = card.id.split("-")[0] 
    const pile = target.querySelectorAll("img") 
    const lastCard = pile.length > 0 ? pile[pile.length - 1] : null 

    if ((!lastCard && value === "A") || (lastCard && order.indexOf(value) === order.indexOf(lastCard.id.split("-")[0]) + 1)) {
        moveToFoundation(card, target) 
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
        li.addEventListener("dblclick", function() {
                if (!previousCard.classList.contains("facedown")) {
                    const [, suit] = previousCard.id.split("-") 
                    const target = document.getElementById(`${suit}-A-slot`) 
                    if (target) {
                        TryFoundation(previousCard, suit, target) 
                    }
                }
            })
        revealLast(previousCard)
        puller.appendChild(li);
    }
}

function Smaller(compared, referance){
    return order.indexOf(compared) + 1 === order.indexOf(referance)
}

function Spread() {
    playingField.innerHTML = "" 
    for (let i = 0;  i < 7;  i++) {
        const ul = document.createElement("ul") 
        ul.className = "table-column" 
        ul.id = `table-col-${i}` 
        for (let j = 0;  j <= i;  j++) {
            if (deck.length === 0) { console.error("Not enough cards."); break  }
            const li = document.createElement("li") 
            const card = deck.shift() 
            li.appendChild(card) 
            ul.appendChild(li) 
            li.addEventListener("click", function(){ Try(li)}) 
            li.addEventListener("dblclick", function() {
                if (!card.classList.contains("facedown")) {
                    const [, suit] = card.id.split("-") 
                    const target = document.getElementById(`${suit}-A-slot`) 
                    if (target) {
                        card.dataset.sourceColumnId = ul.id
                        TryFoundation(card, suit, target) 
                    }
                }
            })
            Reveal(card, j === i)
        }
        ul.addEventListener("dragover", function(e){ e.preventDefault()}) 
        ul.addEventListener("drop", function(e) {
            e.preventDefault() 
            this.classList.remove("valid-drop-target") 
            try {
                const ids = JSON.parse(e.dataTransfer.getData("text/plain")) 
                const firstCard = document.getElementById(ids[0]) 
                if (!firstCard) return 

                const [val, , color] = firstCard.id.split("-") 
                const sourceId = firstCard.dataset.sourceColumnId 
                const sourceElement = document.getElementById(sourceId) 
                const lastCard = this.querySelector("li:last-child img") 

                if ((!lastCard && val === "K") || (lastCard && OppositeColor(color, lastCard.id.split("-")[2]) && Smaller(val, lastCard.id.split("-")[0]))) {
                    const draggedLis = ids.map(id => document.getElementById(id)?.closest("li")).filter(Boolean) 
                    draggedLis.forEach(li => this.appendChild(li)) 

                    if (sourceElement === puller && ids.length === 1) {
                        if (pulledDeck.length > 0 && pulledDeck[pulledDeck.length - 1].id === ids[0]) pulledDeck.pop() 
                        else pulledDeck = pulledDeck.filter(c => c.id !== ids[0]) 
                        updatePuller() 
                    } else if (sourceElement?.classList.contains("table-column")) {
                        const lastLi = sourceElement.querySelector("li:last-child") 
                        if (lastLi) Reveal(lastLi.querySelector("img"), true)
                    }
                    if (sourceId) delete firstCard.dataset.sourceColumnId 
                    checkWin() 
                }
            } catch (err) { console.error("Drop error", err)  }
        }) 
        playingField.appendChild(ul) 
    }
}

function Reveal(img, isFaceUp = true) {
    if (!img) return 
    turnUp(img, isFaceUp) 
    if (!isFaceUp) {
        img.addEventListener("dragstart", function(e){ e.preventDefault()}) // Prevent drag for facedown
        return
    }
    img.addEventListener("dragstart", function(e) {
        const draggedLi = this.parentElement 
        const column = draggedLi.parentElement 
        let ids = [], currentSourceId = null 

        if (column === puller) {
            ids = [this.id]; currentSourceId = puller.id 
        } else if (column.classList.contains("table-column")) {
            const allLis = Array.from(column.children) 
            const stack = allLis.slice(allLis.indexOf(draggedLi)) 
            if (stack.some(li => li.querySelector("img")?.classList.contains("facedown"))) {
                e.preventDefault(); return 
            }
            ids = stack.map(li => li.querySelector("img").id) 
            currentSourceId = column.id 
        } else { e.preventDefault(); return  }

        this.dataset.sourceColumnId = currentSourceId 
        e.dataTransfer.setData("text/plain", JSON.stringify(ids)) 
        e.dataTransfer.effectAllowed = "move" 

        const [topValue, , topColor] = this.id.split("-") 
        document.querySelectorAll(".table-column, .foundation-slot").forEach(el => {
            if (el === column && ids.length > 0 && !el.classList.contains("foundation-slot")) return 
            
            if (el.classList.contains("table-column")) {
                const lastImg = el.querySelector("li:last-child img") 
                if ((!lastImg && topValue === "K") || (lastImg && OppositeColor(topColor, lastImg.id.split("-")[2]) && Smaller(topValue, lastImg.id.split("-")[0]))) {
                    el.classList.add("valid-drop-target") 
                }
            } else if (el.classList.contains("foundation-slot") && ids.length === 1) {
                const foundSuit = el.id.split("-")[0] 
                const draggedSuit = this.id.split("-")[1] 
                if (foundSuit === draggedSuit) {
                    const lastImg = el.querySelector("img:last-child") 
                    if ((!lastImg && topValue === "A") || (lastImg && order.indexOf(topValue) === order.indexOf(lastImg.id.split("-")[0]) + 1)) {
                        el.classList.add("valid-drop-target") 
                    }
                }
            }
        }) 
    })
    img.addEventListener("dragend", function(){ document.querySelectorAll(".valid-drop-target").forEach(el => el.classList.remove("valid-drop-target")) })
}

function turnUp(card, isFaceUp = true){
    if (!card || !card.id) return 
    const [value, suit] = card.id.split("-") 
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
    document.body.className = `theme-${theme}`
    document.querySelectorAll("img").forEach(img => {
        if (img.classList.contains("facedown") || img.parentElement === pullingDeck) {
            img.setAttribute("src", `${theme}/BACK.png`) 
        } else if (img.id) {
            const [val, suit] = img.id.split("-") 
            img.setAttribute("src", `${theme}/${val}-${suit}.png`) 
        }
    }) 
}

function checkWin() {
    if (document.querySelectorAll(".foundation-slot").length === 4 &&
        Array.from(document.querySelectorAll(".foundation-slot")).every(p => p.querySelectorAll("img").length === 13)) {
        setTimeout(() => alert("Gratulálok, nyertél! Congratulations, you won!"), 100) 
        pullingDeck.onclick = null 
        playingField.querySelectorAll("ul.table-column li").forEach(li => li.onclick = li.ondblclick = null) 
        document.querySelectorAll("img").forEach(img => img.draggable = false) 
    }
}