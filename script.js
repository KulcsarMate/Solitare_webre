const deck = []
const cur_last = []
const cur_finish = []
let theme = "dark"
const playing_field = document.getElementById("playing_field")
const pulling_deck = document.getElementById("deck")
const puller = document.getElementById("puller")

function Start(){
    const start_screen = document.getElementById("start")
    const game_screen = document.getElementById("game")
    start_screen.style.display = "none"
    game_screen.style.display = "block"

    let pic = document.createElement("img")
    pic.setAttribute("src", `${theme}/BACK.png`)
    pulling_deck.appendChild(pic)

    Fill()
    console.log(deck.map(card => card?.id))
    Spread()

    document.getElementById("P-A-slot").addEventListener("click", () => TryFoundation("P"))
    document.getElementById("C-A-slot").addEventListener("click", () => TryFoundation("C"))
    document.getElementById("D-A-slot").addEventListener("click", () => TryFoundation("D"))
    document.getElementById("H-A-slot").addEventListener("click", () => TryFoundation("H"))
    ["P", "C", "D", "H"].forEach(suit => {
    const pile = document.getElementById(`${suit}-A-slot`)
    if (!pile) {
        console.warn(`Missing the suit ${suit}`)
        return
    }

    pile.addEventListener("click", () => TryFoundation(suit))

    pile.addEventListener("dragover", e => e.preventDefault())

    pile.addEventListener("drop", function(e) {
    e.preventDefault()
    const cardIds = e.dataTransfer.getData("text/plain")
    let ids;
    try {
        ids = JSON.parse(cardIds)
    } catch (err) {
        console.error("Invalid drag data:", cardIds)
        return
    }

    const cardId = Array.isArray(ids) ? ids[0] : ids
    const card = document.getElementById(cardId)
    if (!card || !card.id) {
        console.warn("Dragged card not found:", cardId)
        return
    }

    TryFoundation(card, suit, this)
})

    })
}

function Try(item){
    const cur_object = item.id.split("-")
    const cur_li = item.parentNode
    const collumns = playing_field.querySelectorAll("ul")

    if (cur_object[0] == "A") {
        Move(item)
    }

    for (let i = 0; i < collumns.length; i++) {
        const col = collumns[i]
        const lis = col.querySelectorAll("li")
        if (lis.length === 0) continue

        const last_li = lis[lis.length - 1]
        const last_card = last_li.querySelector("img")
        const last_id = last_card.id.split("-")

        if (Smaller(cur_object[0], last_id[0])) {
            col.appendChild(cur_li)
            return
        }
    }
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
    const li = card.parentNode
    pile.appendChild(card)
    li.remove()
    card.classList.remove("selected")
}

function OppositeColor(compared, referance) {
    return (compared === "red" && referance === "black") || (compared === "black" && referance === "red")
}

function TryFoundation(card, suit, pile) {
    if (!card || !card.id) {
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
        if (order.indexOf(value) === order.indexOf(lastValue) + 1) {
            moveToFoundation(card, pile)
        }
    }
}


function TryMove(card, column) {
    const [value, suit, color] = card.id.split("-")
    const li = card.parentNode

    const cardsInColumn = column.querySelectorAll("li")
    if (cardsInColumn.length === 0 && value === "K") {
        column.appendChild(li)
        return
    }

    const lastLi = cardsInColumn[cardsInColumn.length - 1]
    const lastCard = lastLi.querySelector("img")
    const [lastValue, lastSuit, lastColor] = lastCard.id.split("-")

    if (OppositeColor(color, lastColor) && Smaller(value, lastValue)) {
        column.appendChild(li)
    }
}


function Smaller(compared, referance){
    const order = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]
    return order.indexOf(compared) + 1 === order.indexOf(referance)
}

function Spread(){
    let deck_i = 0;
    for (let index = 0; index < 6; index++) {
        const ul = document.createElement("ul")
        for (let i = 0; i < index+1; i++) {
            let li =document.createElement("li")
            let pic = deck[deck_i++]

            if (!pic) {
                console.error(`Card not found at index ${deck_i - 1}`)
            }

            if (i == index) {
                Reveal(pic)
            }
            else{
                pic.setAttribute("src", `${theme}/BACK.png`)
            }
            li.addEventListener("click", function(){
                Try(this)
            })
            pic.setAttribute("draggable", true)
            pic.addEventListener("dragstart", function(e) {
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
            pic.addEventListener("dragend", function () {
                document.querySelectorAll(".valid-drop").forEach(col => {
                    col.classList.remove("valid-drop")
                })
            })

            li.appendChild(pic)
            ul.appendChild(li)
        }
        ul.addEventListener("dragover", function(e) {
            e.preventDefault()
        })
        ul.addEventListener("drop", function(e) {
            e.preventDefault()
            this.classList.remove("valid-drop")

            const ids = JSON.parse(e.dataTransfer.getData("text/plain"))
            const sourceColumn = Array.from(document.querySelectorAll("#playing_field ul"))
            .find(ul => Array.from(ul.querySelectorAll("img"))
            .some(img => ids.includes(img.id)))

            if (!sourceColumn) return

            const draggedLis = ids.map(id => {
                const img = document.getElementById(id)
                const li = img.closest("li")
                return li
            })

            draggedLis.forEach(li => {
                this.appendChild(li)
            })

           const remainingLis = sourceColumn.querySelectorAll("li")
            if (remainingLis.length > 0) {
                const topImg = remainingLis[remainingLis.length - 1].querySelector("img")
                Reveal(topImg)
            }
        })
        playing_field.appendChild(ul)
    }
}

function Reveal(img){
    if (!img || !img.id) return
    const [val, suit, color] = img.id.split("-")
    img.setAttribute("src", `${theme}/${val}-${suit}.png`)
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
