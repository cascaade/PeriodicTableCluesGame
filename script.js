import { compareEnums, ENUM, elements } from './exports.js';

const inputBox = document.getElementById("input");
const enterButton = document.getElementById("input-confirm-button");
const outputMessage = document.getElementById("output-message");
const hintsList = document.getElementById('hints-list');
const hintsCount = document.getElementById('hints-count');
const periodicTable = document.getElementById("table");

let queries = []; // list of hints; all "queries" are TRUE about the hidden element.
let game = elements.map(e => ({ ...e, eliminated: false }));
let randomElement = game[Math.floor(Math.random() * game.length)];

// display elements on table
game.map(element => {
    const containerCell = document.createElement("div");
    const topBar = document.createElement("div");

    let row = element.period;
    let col = element.groupNum;

    if (element.group) {
        if (compareEnums(element.group, ENUM.Group.Lanthanoids)) {
            row += 2;
            col = element.atomicNumber - 54; // starts 57
        }
    
        if (compareEnums(element.group, ENUM.Group.Actinoids)) {
            row += 2;
            col = element.atomicNumber - 86; // starts 89
        }
    }

    containerCell.classList.add("element");
    containerCell.classList.add(element.series.class);
    containerCell.classList.add(element.roomTempState.class);
    element.group && containerCell.classList.add(element.group.class);
    containerCell.style.gridRow = row;
    containerCell.style.gridColumn = col;

    element.families.forEach(f => containerCell.classList.add(f.class));

    topBar.classList.add("element-topbar");

    const atomicNumberDisplay = document.createElement("span");
    atomicNumberDisplay.classList.add("element-atomic-number");
    atomicNumberDisplay.innerText = element.atomicNumber;
    topBar.append(atomicNumberDisplay);
    
    const symbolDisplay = document.createElement("span");
    symbolDisplay.classList.add("element-symbol");
    symbolDisplay.innerText = element.symbol;
    containerCell.append(symbolDisplay);

    const nameDisplay = document.createElement("span");
    nameDisplay.classList.add("element-name");
    nameDisplay.innerText = element.name;
    containerCell.append(nameDisplay);

    const atomicMassDisplay = document.createElement("span");
    atomicMassDisplay.classList.add("element-atomic-mass");
    atomicMassDisplay.innerText = element.atomicMass;
    containerCell.append(atomicMassDisplay);

    containerCell.prepend(topBar);
    periodicTable.append(containerCell);

    element.cell = containerCell;
});

function updateEliminations() {
    game.map(e => {
        e.eliminated = false; // not necessary, but makes sure an element isn't falsely eliminated randomly
        queries.map(query => {
            let { property, reference } = query;
            let value = e[property.key];

            console.log(query);
            
            
            if (!query.selector.test(value, reference)) {
                e.eliminated = true;
            }
        });
    });
}

function updateBoard() {
    game.map(e => {
        e.cell.classList.toggle("eliminated", e.eliminated);
    });
}

function updateHints() {
    hintsList.innerHTML = "";

    // remove dupes
    queries = [...new Set(queries)]; // TODO: FIX

    queries.map(query => {
        let text = "";
        
        // format hint string based on property type
        if (query.property.type == "string") {
            if (compareEnums(query.selector, ENUM.QuerySelector.Equals)) {
                text = `The element's ${query.property.name} is ${query.reference}`;
            } else if (compareEnums(query.selector, ENUM.QuerySelector.DoesNotEqual)) {
                text = `The element's ${query.property.name} is not ${query.reference}`;
            }
        } else if (compareEnums(query.property, ENUM.Property.Series)) {
            if (compareEnums(query.selector, ENUM.QuerySelector.Equals)) {
                text = "The element is " + query.reference.singular;
            } else if (compareEnums(query.selector, ENUM.QuerySelector.DoesNotEqual)) {
                text = "The element is not " + query.reference.singular;
            }
        } else if (query.property.type == "number") {
            if (compareEnums(query.selector, ENUM.QuerySelector.GreaterThan)) {
                text = `The element's ${query.property.name} is greater than ${query.reference}`;
            } else if (compareEnums(query.selector, ENUM.QuerySelector.NotGreaterThan)) {
                text = `The element's ${query.property.name} is not greater than ${query.reference}`;
            } else if (compareEnums(query.selector, ENUM.QuerySelector.LessThan)) {
                text = `The element's ${query.property.name} is less than ${query.reference}`;
            } else if (compareEnums(query.selector, ENUM.QuerySelector.NotLessThan)) {
                text = `The element's ${query.property.name} is not less than ${query.reference}`;
            }
        } else if (compareEnums(query.property, ENUM.Property.Block)) {
            if (compareEnums(query.selector, ENUM.QuerySelector.Equals)) {
                text = `The element is in the ${query.reference.name}`;
            } else if (compareEnums(query.selector, ENUM.QuerySelector.DoesNotEqual)) {
                text = `The element not in the ${query.reference.name}`;
            }
        } else if (compareEnums(query.property, ENUM.Property.Families)) {
            if (compareEnums(query.selector, ENUM.QuerySelector.Includes)) {
                text = `The element ${query.reference.posDesc}`;
            } else if (compareEnums(query.selector, ENUM.QuerySelector.Excludes)) {
                text = `The element ${query.reference.negDesc}`;
            }
        } else if (compareEnums(query.property, ENUM.Property.RoomTempState)) {
            if (compareEnums(query.selector, ENUM.QuerySelector.Equals)) {
                text = `The element is ${query.reference.singular} at room temperature`;
            } else if (compareEnums(query.selector, ENUM.QuerySelector.DoesNotEqual)) {
                text = `The element is not ${query.reference.singular} at room temperature`;
            }
        } else if (compareEnums(query.property, ENUM.Property.Group)) {
            if (compareEnums(query.selector, ENUM.QuerySelector.Equals)) {
                text = "The element is " + query.reference.singular;
            } else if (compareEnums(query.selector, ENUM.QuerySelector.DoesNotEqual)) {
                text = "The element is not " + query.reference.singular;
            }
        } else if (compareEnums(query.property, ENUM.Property.Metal)) {
            if (compareEnums(query.selector, ENUM.QuerySelector.Equals)) {
                text = `The element is ${query.reference.singular}`;
            } else if (compareEnums(query.selector, ENUM.QuerySelector.DoesNotEqual)) {
                text = `The element is not ${query.reference.singular}`;
            }
        }

        // create list element
        const li = document.createElement("li");
        li.innerText = text + ".";
        hintsList.appendChild(li);
    });
    hintsCount.innerText = queries.length;
}

let elementMatchTerms = elements.map(e => e.name).sort((a, b) => b.length - a.length); // element names in order from greatest to least
let symbolMatchTerms = elements.map(e => e.symbol).sort((a, b) => b.length - a.length); // element symbols in order from greatest to least
let propertyMatchTerms = [ // create a list of a bunch of keywords
    ...Object.values(ENUM.Family).map((family, i) => family.aliases.map((alias, j) => ({
        property: ENUM.Property.Families,
        reference: ENUM.Family[Object.keys(ENUM.Family)[i]],
        selector: ENUM.QuerySelector.Includes,
        precedence: alias.length * 100 + j,
        alias
    }))).flat(2),
    ...Object.values(ENUM.Block).map((item, i) => item.aliases.map((alias, j) => ({
        property: ENUM.Property.Block,
        reference: ENUM.Block[Object.keys(ENUM.Block)[i]],
        selector: ENUM.QuerySelector.Equals,
        precedence: alias.length * 100 + j,
        alias
    }))).flat(2),
    ...Object.values(ENUM.State).map((item, i) => item.aliases.map((alias, j) => ({
        property: ENUM.Property.RoomTempState,
        reference: ENUM.State[Object.keys(ENUM.State)[i]],
        selector: ENUM.QuerySelector.Equals,
        precedence: alias.length * 100 + j,
        alias
    }))).flat(2),
    ...Object.values(ENUM.Series).map((item, i) => item.aliases.map((alias, j) => ({
        property: ENUM.Property.Series,
        reference: ENUM.Series[Object.keys(ENUM.Series)[i]],
        selector: ENUM.QuerySelector.Equals,
        precedence: alias.length * 100 + j,
        alias
    }))).flat(2),
    ...Object.values(ENUM.Metal).map((item, i) => item.aliases.map((alias, j) => ({
        property: ENUM.Property.Metal,
        reference: ENUM.Metal[Object.keys(ENUM.Metal)[i]],
        selector: ENUM.QuerySelector.Equals,
        precedence: alias.length * 100 + j,
        alias
    }))).flat(2),
    ...Object.values(ENUM.Group).map((item, i) => item.aliases.map((alias, j) => ({
        property: ENUM.Property.Group,
        reference: ENUM.Group[Object.keys(ENUM.Group)[i]],
        selector: ENUM.QuerySelector.Equals,
        precedence: alias.length * 100 + j,
        alias
    }))).flat(2),
] // could be simplified and symbols & name can also be added here
propertyMatchTerms.sort((a, b) => b.precedence - a.precedence) // from greatest to least

function parseInput(input) {
    let query;

    // parse properties
    for (let term of propertyMatchTerms) {
        let { property, reference, selector, alias } = term

        if (input.toLowerCase().match(alias.toLowerCase())) {
            query = {
                property, reference
            }
            
            if (selector.test(randomElement[property.key], reference)) {
                query.selector = selector;
            } else {
                query.selector = selector.antiSelector;
            }

            return queries.push(query); 
        }
    }

    // parse element names
    for (let term of elementMatchTerms) {
        if (input.toLowerCase().match(term.toLowerCase())) {
            query = {
                property: ENUM.Property.Name,
                reference: term
            }

            if (randomElement.name.toLowerCase() === term.toLowerCase()) {
                query.selector = ENUM.QuerySelector.Equals;
            } else {
                query.selector = ENUM.QuerySelector.DoesNotEqual;
            }

            return queries.push(query);
        }
    }

    // parse element symbols
    for (let term of symbolMatchTerms) {
        // not putting symbols lowercase to distinguish

        let split = input.split(" ");

        for (let word of split) {
            if (word === term) {
                query = {
                    property: ENUM.Property.Symbol,
                    reference: term
                }
    
                if (randomElement.symbol === term) {
                    query.selector = ENUM.QuerySelector.Equals;
                } else {
                    query.selector = ENUM.QuerySelector.DoesNotEqual;
                }
    
                return queries.push(query);
            }
        }
    }

    return null;
}

let invalidCount = 0;

function handleInput(input) {
    let won = false;

    if (parseInput(input) == null) {
        outputMessage.innerText = `Invalid${(invalidCount > 0) ? ` (${invalidCount})` : ""}.`
        invalidCount++;
    } else {
        outputMessage.innerText = "";
        invalidCount = 0;

        let latestQuery = queries[queries.length - 1]
        let latestQueryProp = latestQuery.property

        if ((latestQueryProp == ENUM.Property.Name || latestQueryProp == ENUM.Property.Symbol) && latestQuery.selector == ENUM.QuerySelector.Equals) {
            outputMessage.innerText = "";
        }
    };

    updateEliminations();
    updateBoard();
    updateHints();
}

// handle query inputs
inputBox.addEventListener("keypress", (e) => {
    if (e.key == "Enter") {
        handleInput(inputBox.value);
        inputBox.value = "";
    }
});

enterButton.addEventListener("click", (e) => {
    handleInput(inputBox.value);
    inputBox.value = "";
});