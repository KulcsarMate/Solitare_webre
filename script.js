const deck = []
const theme = "dark"
const playing_field = document.getElementById("playing_field")

function Start(){
    const start_screen = document.getElementById("start")
    const game_screen = document.getElementById("game")
    start_screen.style.display = "none"
    game_screen.style.display = "block"
    Shuffle()
    Spread()
}

function Spread(){
    for (let index = 0; index < 6; index++) {
        const ul = document.createElement("ul")
        for (let i = 0; i < index+1; i++) {
            let li =document.createElement("li")
            li.innerText = deck[i] 
        }
    }
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
        for (let i = 0; i < 13; i++) {
            if (index = 0) {
                act[i] = document.createElement("img").setAttribute("id", `${i}-C-black`)
            }
            else if (index = 1) {
                act[i] = document.createElement("img").setAttribute("id", `${i}-D-red`)
            }
            else if (index = 2) {
                act[i] = document.createElement("img").setAttribute("id", `${i}-S-black`)
            }
            else{
                act[i] = document.createElement("img").setAttribute("id", `${i}-H-red`)
            }
            act[i].setAttribute("src", `BACK.png`)
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