const deck = [];
let pullIndex = 0;
let pulledDeck = [];
let theme = "dark";
const order = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const playingField = document.getElementById("playing_field");
const pullingDeck = document.getElementById("deck");
const puller = document.getElementById("puller");

function Start() {
    document.getElementById("start").style.display = "none"; 
    document.getElementById("game").style.display = "block"; 
    pullingDeck.innerHTML = `<img src="${theme}/BACK.png">`; 
    Fill(); 
    Spread(); 

    ["P", "C", "D", "H"].forEach(suit => {
        const pile = document.getElementById(`${suit}-A-slot`); 
        if (!pile) return console.error(`Foundation for ${suit} not found.`); 
        pile.addEventListener("dragover", e => e.preventDefault());
        pile.addEventListener("drop", function(e) {
            handleFoundationDrop(e, this);
        }); 
    }); 
}

function handleFoundationDrop(e, target) {
    e.preventDefault();
    try {
        const {cardId, sourceId} = JSON.parse(e.dataTransfer.getData('text/plain'));
        const card = document.getElementById(cardId);
        if (!card) return;

        const suit = card.id.split("-")[1];
        if (target.id.startsWith(`${suit}-A-slot`)) {
            card.parentNode.removeChild(card);
            target.innerHTML = "";
            target.appendChild(card);

            if (sourceId) {
                const sourceElement = document.getElementById(sourceId);
                if (sourceElement) {
                    if (sourceElement.classList.contains('table-column')) {
                        const lastLi = sourceElement.querySelector('li:last-child');
                        if (lastLi) {
                            const lastCard = lastLi.querySelector('img');
                            if (lastCard?.classList.contains('facedown')) {
                                turnUp(lastCard, true);
                            }
                        }
                    }
                    else if (sourceElement === puller) {
                        pulledDeck = pulledDeck.filter(c => c.id !== cardId);
                        updatePuller();
                    }
                }
            }
        }
    } catch (err) {
        console.error("Drop error", err);
    }
}

function Try(item) {
    const card = item.querySelector("img");
    if (!card || card.classList.contains("facedown")) return;

    const [value, suit, color] = card.id.split("-");
    const li = card.parentElement;
    const sourceColumn = li.parentElement;

    const targetFoundation = document.getElementById(`${suit}-A-slot`);
    if (targetFoundation && sourceColumn !== puller) {
        const lastCard = targetFoundation.querySelector("img:last-child");
        if ((!lastCard && value === "A") || (lastCard && order.indexOf(value) === order.indexOf(lastCard.id.split("-")[0]) + 1)) {
            moveToFoundation(card, targetFoundation);
            return;
        }
    }

    let moved = false;
    playingField.querySelectorAll("ul.table-column").forEach(targetColumn => {
        if (moved || targetColumn === sourceColumn) return;

        const lastLi = targetColumn.querySelector("li:last-child");
        if (!lastLi) return;
        
        const lastCard = lastLi.querySelector("img");
        if (lastCard && !lastCard.classList.contains("facedown") && 
            OppositeColor(color, lastCard.id.split("-")[2]) && 
            Smaller(value, lastCard.id.split("-")[0])) {
            
            const allCards = Array.from(sourceColumn.children);
            const clickedIndex = allCards.indexOf(li);
            const cardsToMove = allCards.slice(clickedIndex);

            cardsToMove.forEach(cardLi => {
                targetColumn.appendChild(cardLi);
            });

            if (sourceColumn === puller) {
                pulledDeck = pulledDeck.filter(c => c !== card);
                updatePuller();
            } 
            else if (sourceColumn.classList.contains("table-column")) {
                const newLastLi = sourceColumn.querySelector("li:last-child");
                if (newLastLi) Reveal(newLastLi.querySelector("img"));
            }
            
            moved = true;
        }
    });
}

function Pull() {
    if (deck.length === 0) {
        if (pulledDeck.length > 0) {
            deck.push(...pulledDeck);
            pulledDeck = [];
            updatePuller();
            pullingDeck.innerHTML = deck.length > 0 ? `<img src="${theme}/BACK.png">` : `<img src="${theme}/arrow.png">`;
        } else {
            pullingDeck.innerHTML = "";
        }
        return;
    }
    const card = deck.shift(); 
    pulledDeck.push(card); 
    Reveal(card); 
    updatePuller(); 
    pullingDeck.innerHTML = deck.length > 0 ? `<img src="${theme}/BACK.png">` : "";
}

function moveToFoundation(card, target) {
    const sourceElement = card.closest('.table-column, #puller');
    
    card.parentNode.removeChild(card);
    target.innerHTML = "";
    target.appendChild(card);

    if (sourceElement) {
        if (sourceElement.classList.contains('table-column')) {
            const lastLi = sourceElement.querySelector('li:last-child');
            if (lastLi) {
                const lastCard = lastLi.querySelector('img:first-child');
                if (lastCard?.classList.contains('facedown')) {
                    turnUp(lastCard, true);
                }
            }
        }
        else if (sourceElement === puller) {
            pulledDeck = pulledDeck.filter(c => c !== card);
            updatePuller();
        }
    }
}

function OppositeColor(compared, referance) {
    return (compared === "red" && referance === "black") || (compared === "black" && referance === "red");
}

function TryFoundation(card, suit, target) {
    if (!card || !target || card.id.split("-")[1] !== suit || !target.id.startsWith(suit + "-A-slot")) return false;
    const value = card.id.split("-")[0];
    const pile = target.querySelectorAll("img");
    const lastCard = pile.length > 0 ? pile[pile.length - 1] : null;

    if ((!lastCard && value === "A") || (lastCard && order.indexOf(value) === order.indexOf(lastCard.id.split("-")[0]) + 1)) {
        moveToFoundation(card, target);
        return true;
    }
    return false;
}

function updatePuller() {
    puller.innerHTML = "";
    if (pulledDeck.length > 0) {
        const card = pulledDeck[pulledDeck.length - 1];
        
        if (document.querySelector(`.foundation img[id="${card.id}"]`)) {
            pulledDeck.pop();
            return updatePuller();
        }
        
        const li = document.createElement("li");
        li.appendChild(card);
        
        li.addEventListener("click", () => Try(li));
        li.addEventListener("dblclick", () => {
            if (!card.classList.contains("facedown")) {
                const [, suit] = card.id.split("-");
                const target = document.getElementById(`${suit}-A-slot`);
                if (target) {
                    TryFoundation(card, suit, target);
                }
            }
        });
        
        puller.appendChild(li);
    }
}

function Smaller(compared, referance) {
    if (order.indexOf(compared) === 0) {
        return false
    }
    return order.indexOf(compared) + 1 === order.indexOf(referance);
}

function Spread() {
    playingField.innerHTML = "";
    for (let i = 0; i < 7; i++) {
        const ul = document.createElement("ul");
        ul.className = "table-column";
        ul.id = `table-col-${i}`;
        for (let j = 0; j <= i; j++) {
            if (deck.length === 0) { console.error("Not enough cards."); break; }
            const li = document.createElement("li");
            const card = deck.shift();
            li.appendChild(card);
            ul.appendChild(li);
            li.addEventListener("click", function(){ Try(li); });
            li.addEventListener("dblclick", function() {
                if (!card.classList.contains("facedown")) {
                    const [, suit] = card.id.split("-");
                    const target = document.getElementById(`${suit}-A-slot`);
                    if (target) {
                        TryFoundation(card, suit, target);
                    }
                }
            });
            Reveal(card, j === i);
        }
        ul.addEventListener("dragover", function(e){ e.preventDefault(); });
        ul.addEventListener("drop", function(e) {
            e.preventDefault();
            this.classList.remove("valid-drop-target");
            try {
                const {cardId, sourceId} = JSON.parse(e.dataTransfer.getData('text/plain'));
                const firstCard = document.getElementById(cardId);
                if (!firstCard) return;

                const [val, , color] = firstCard.id.split("-");
                const sourceElement = document.getElementById(sourceId);
                const lastLi = this.querySelector("li:last-child");
                
                if (!lastLi || (lastLi.querySelector("img") && !lastLi.querySelector("img").classList.contains("facedown"))) {
                    const lastCard = lastLi ? lastLi.querySelector("img") : null;
                    
                    if ((!lastCard && val === "K") || 
                        (lastCard && OppositeColor(color, lastCard.id.split("-")[2]) && 
                         Smaller(val, lastCard.id.split("-")[0]))) {
                        
                        const draggedLi = firstCard.closest('li');
                        if (draggedLi) this.appendChild(draggedLi);

                        if (sourceElement === puller) {
                            pulledDeck = pulledDeck.filter(c => c.id !== cardId);
                            updatePuller();
                        } else if (sourceElement?.classList.contains("table-column")) {
                            const newLastLi = sourceElement.querySelector("li:last-child");
                            if (newLastLi) Reveal(newLastLi.querySelector("img"));
                        }
                        
                        checkWin();
                    }
                }
            } catch (err) { console.error("Drop error", err); }
        });
        playingField.appendChild(ul);
    }
}

function Reveal(img, isFaceUp = true) {
    if (!img) return;
    turnUp(img, isFaceUp);
    if (!isFaceUp) {
        img.addEventListener("dragstart", function(e){ e.preventDefault(); });
        return;
    }
    
    img.addEventListener("dragstart", function(e) {
        const sourceElement = this.closest('.table-column, #puller');
        e.dataTransfer.setData('text/plain', JSON.stringify({
            cardId: this.id,
            sourceId: sourceElement?.id || null
        }));
        e.dataTransfer.effectAllowed = "move";

        const [topValue, , topColor] = this.id.split("-");
        document.querySelectorAll(".table-column, .foundation-slot").forEach(el => {
            if (el === sourceElement && !el.classList.contains("foundation-slot")) return;
            
            if (el.classList.contains("table-column")) {
                const lastLi = el.querySelector("li:last-child");
                const lastImg = lastLi ? lastLi.querySelector("img") : null;
                if ((!lastImg && topValue === "K") || 
                    (lastImg && !lastImg.classList.contains("facedown") && 
                     OppositeColor(topColor, lastImg.id.split("-")[2]) && 
                     Smaller(topValue, lastImg.id.split("-")[0]))) {
                    el.classList.add("valid-drop-target");
                }
            } else if (el.classList.contains("foundation-slot")) {
                const foundSuit = el.id.split("-")[0];
                const draggedSuit = this.id.split("-")[1];
                if (foundSuit === draggedSuit) {
                    const lastImg = el.querySelector("img:last-child");
                    if ((!lastImg && topValue === "A") || (lastImg && order.indexOf(topValue) === order.indexOf(lastImg.id.split("-")[0]) + 1)) {
                        el.classList.add("valid-drop-target");
                    }
                }
            }
        });
    });
    
    img.addEventListener("dragend", function(){
        document.querySelectorAll(".valid-drop-target").forEach(el => el.classList.remove("valid-drop-target"));
    });
}

function turnUp(card, isFaceUp = true) {
    if (!card || !card.id) return;
    const [value, suit] = card.id.split("-");
    card.setAttribute("src", isFaceUp ? `${theme}/${value}-${suit}.png` : `${theme}/BACK.png`);
    card.classList.toggle("facedown", !isFaceUp);
    card.setAttribute("draggable", isFaceUp);
    
    if (isFaceUp) {
        card.addEventListener("dragstart", function(e) {
            if (this.classList.contains("facedown")) {
                e.preventDefault();
                return;
            }
        });
    }
}

function Shuffle() {
    if (deck.length !== 52) {
        console.warn("Deck not full during shuffle, refilling + reshuffle.");
        Fill();
    }
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Random(0, i);
        const temp = deck[i];
        deck[i] = deck[j];
        deck[j] = temp;
    }
}

function Random(min, max) {
    return Math.floor((Math.random() * (max-min+1)+min));
}

function Fill() {
    deck.length = 0;
    pulledDeck.length = 0;
    updatePuller();

    const suits = [
        { code: "C", color: "black" },
        { code: "D", color: "red" },
        { code: "P", color: "black" },
        { code: "H", color: "red" }
    ].forEach(suit => {
        for (let i = 0; i < 13; i++) {
            const img = document.createElement("img");
            img.setAttribute("id", `${order[i]}-${suit.code}-${suit.color}`);
            img.setAttribute("draggable", true);
            deck.push(img);
        }
    });

    if (deck.length !== 52) {
        console.error("Deck is not properly filled:", deck.length, "cards found.");
    }

    Shuffle();
}

function changeTheme() {
    theme = theme === "dark" ? "light" : "dark";
    document.body.className = `theme-${theme}`;
    document.querySelectorAll("img").forEach(img => {
        if (img.classList.contains("facedown") || img.parentElement === pullingDeck) {
            img.setAttribute("src", `${theme}/BACK.png`);
        } else if (img.id) {
            const [val, suit] = img.id.split("-");
            img.setAttribute("src", `${theme}/${val}-${suit}.png`);
        }
    });
}

function checkWin() {
    if (document.querySelectorAll(".foundation-slot").length === 4 &&
        Array.from(document.querySelectorAll(".foundation-slot")).every(p => p.querySelectorAll("img").length === 13)) {
        setTimeout(() => alert("Congratulations, you won!"), 100);
        pullingDeck.onclick = null;
        playingField.querySelectorAll("ul.table-column li").forEach(li => li.onclick = li.ondblclick = null);
        document.querySelectorAll("img").forEach(img => img.draggable = false);
    }
}