const deck = []
const cur_last = []
const cur_finish = []
const theme = "dark"
const playing_field = document.getElementById("playing_field")
const pulling_deck = document.getElementById("deck")

function Start(){
    const start_screen = document.getElementById("start")
    const game_screen = document.getElementById("game")
    start_screen.style.display = "none"
    game_screen.style.display = "block"

    let pic = document.createElement("img")
    pic.setAttribute("src", `${theme}/BACK.png`)
    pulling_deck.appendChild(pic)

    Fill()
    Shuffle()
    Spread()

    document.getElementById("P-A-slot").addEventListener("click", () => TryFoundation("P"))
    document.getElementById("C-A-slot").addEventListener("click", () => TryFoundation("C"))
    document.getElementById("D-A-slot").addEventListener("click", () => TryFoundation("D"))
    document.getElementById("H-A-slot").addEventListener("click", () => TryFoundation("H"))
    ["P", "C", "D", "H"].forEach(suit => {
        const pile = document.getElementById(`${suit}-A-slot`)
    
        pile.addEventListener("dragover", e => e.preventDefault())
        
        pile.addEventListener("drop", function(e) {
            e.preventDefault()
            const cardId = e.dataTransfer.getData("text/plain")
            const card = document.getElementById(cardId)
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

function TryFoundation(suit) {
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
    pile.appendChild(card) // You might want to clone instead of move if you want animation
    li.remove()
    card.classList.remove("selected")
}

function OppositeColor(compared, referance) {
    return (compared === "red" && referance === "black") || (compared === "black" && referance === "red")
}

function TryFoundation(card, suit, pile) {
    const [value, cardSuit, color] = card.id.split("-")
    if (cardSuit !== suit) return

    const pileImages = pile.querySelectorAll("img")
    const order = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]

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
            const ids = JSON.parse(e.dataTransfer.getData("text/plain"))
            const stack = ids.map(id => document.getElementById(id).parentElement) // <li>s

            const topCard = stack[0].querySelector("img")
            const [val, suit, color] = topCard.id.split("-")

            const cardsInTarget = this.querySelectorAll("li")
            if (cardsInTarget.length === 0 && val === "K") {
                stack.forEach(li => this.appendChild(li))
                return
            }

            const lastLi = cardsInTarget[cardsInTarget.length - 1]
            const lastCard = lastLi.querySelector("img")
            const [lastVal, lastSuit, lastColor] = lastCard.id.split("-")

            if (OppositeColor(color, lastColor) && Smaller(val, lastVal)) {
                stack.forEach(li => this.appendChild(li))
            }
        })
        playing_field.appendChild(ul)
    }
}

function Reveal(pic){
    const spl = pic.id.split("-")
    pic.setAttribute("src", `${theme}/${spl[0]}-${spl[1]}.png`)
}

function Shuffle(){
    for (let index = 0; index < deck.length; index++) {
        let r1 = Random(0, deck.length)
        let r2 = Random(0, deck.length)
        let act = deck[r1]
        deck[r1] = deck[r2]
        deck[r2] = act
    }
}

function Random(min, max){
    return Math.floor((Math.random() * (max-min+1)+min))
}

function Fill(){
    for (let index = 0; index < 4; index++) {  //0 = clubs, 1 = diamonds, 2 = spades, 3 = hearts
        const act = []
        for (let i = 0; i < 14; i++) {
            if (index == 0) {
                act[i] = document.createElement("img")
                act[i].setAttribute("id", `${IndexCheck(i)}-C-black`)
            }
            else if (index == 1) {
                act[i] = document.createElement("img")
                act[i].setAttribute("id", `${IndexCheck(i)}-D-red`)
            }
            else if (index == 2) {
                act[i] = document.createElement("img")
                act[i].setAttribute("id", `${IndexCheck(i)}-P-black`)
            }
            else{
                act[i] = document.createElement("img")
                act[i].setAttribute("id", `${IndexCheck(i)}-H-red`)
            }
        }
        if (index == 0) {
            for (let j = 0; j < act.length; j++) {
                deck[j] = act[j]
            }
        }
        else{
            for (let j = 0; j < act.length; j++) {
                deck[13 * index + j] = act[j]
            }
        }
    }
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
    else if (i == 13) {
        return "A"
    }
    else{
        return i+1
    }
}