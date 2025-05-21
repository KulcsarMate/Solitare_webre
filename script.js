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
}

function Try(item){
    const cur_object = item.id.split("-")
    if (cur_object[0] == "A") {
        
    }
    const collumns = playing_field.querySelectorAll("ul")
    let i = 0
    let found = false
    while (i < collumns.length && !found) {
        const collumn = collumns[i].querySelectorAll("li")
        const last_in_c = collumn[collumn.length-1].id.split("-")
        if (Smaller()) {
            
        }
    }
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
            pic.addEventListener("click", function(){
                Try(this)
            })
            li.appendChild(pic)
            ul.appendChild(li)
        }
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