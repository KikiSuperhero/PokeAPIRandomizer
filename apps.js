const randomizer = document.querySelector("#randomizer");
const images = document.querySelectorAll(".sprite");
const slots = document.querySelectorAll(".pokemon");
const checkbox = document.querySelector("#checkbox");
const genSelector = document.querySelector("#genSelector");
//const movesets = document.querySelectorAll("UL")
const legends = [
  144, 145, 146, 150, 151, 243, 244, 245, 249, 250, 377, 378, 379, 380, 381,
  382, 383, 384, 480, 481, 482, 483, 484, 485, 486, 487, 488, 638, 639, 640,
  641, 642, 643, 644, 645, 646, 716, 717, 718, 772, 773, 785, 786, 787, 788,
  789, 790, 791, 792, 800, 888, 889, 890, 891, 892, 894, 895, 896, 896, 897,
  898,
];
let pokedexLimit = 30; // should be 897 by default
let invalidNumbers = [];

const capitalize = (string) => {
  return string[0].toUpperCase() + string.slice(1);
};

function updatePokedexLimit() {
  switch (genSelector.value) {
    case "gen1":
      pokedexLimit = 150;
      break;
    case "gen2":
      pokedexLimit = 250;
      break;
    case "gen3":
      pokedexLimit = 385;
      break;
    case "gen4":
      pokedexLimit = 492;
      break;
    case "gen5":
      pokedexLimit = 648;
      break;
    case "gen6":
      pokedexLimit = 720;
      break;
    case "gen7":
      pokedexLimit = 808;
      break;
    case "gen8":
      pokedexLimit = 897;
      break;
  }
}

const getRandomNumber = (limit) => {
  const output = Math.round(Math.random() * limit) + 1;
  //console.log(output)
  return output;
};

const makeRandomMoves = (slot, source) => {
  let moves = ["None"];
  for (let i = 0; i < source.data.moves.length; i++) {
    moves.push(source.data.moves[i].move.name);
  }
  //console.log(moves)
  let numberOfMoves = moves.length - 2;
  let exceptions = [];
  if (moves.length > 4) {
    for (let entry of slot.querySelectorAll("LI")) {
      moveIndex = getRandomNumber(numberOfMoves);
      while (exceptions.includes(moveIndex)) {
        moveIndex = getRandomNumber(numberOfMoves);
      }
      exceptions.push(moveIndex);
      entry.innerText = capitalize(moves[moveIndex]);
      //console.log(exceptions)
    }
  } else {
    for (let i = 0; i < 4; i++) {
      if (moves[i + 1]) {
        slot.querySelectorAll("LI")[i].innerText = capitalize(moves[i + 1]);
      } else {
        slot.querySelectorAll("LI")[i].innerText = "None";
      }
    }
  }
};

//let arr = [{move: {name: "a"}}, {move: {name: "b"}} ,{move: {name: "c"}}]

const makePokemon = async (slot, number) => {
  const image = slot.querySelector("IMG");
  const name = slot.querySelector("H3");
  try {
    let source = await axios.get(`https://pokeapi.co/api/v2/pokemon/${number}`);
    image.src = source.data.sprites.front_default;
    name.innerText = capitalize(source.data.forms[0].name);
    makeRandomMoves(slot, source);
  } catch (e) {
    console.log("Error: Could not receive data");
  }
};

const getEvolutionChain = async (number) => {
  try {
    let pokemonSpecies = await axios.get(
      `https://pokeapi.co/api/v2/pokemon-species/${number}`
    );
    let evolutionURL = await axios.get(
      pokemonSpecies.data["evolution_chain"].url
    );
    let evolutionChain = evolutionURL.data.id;
    //console.log(evolutionChain);
    return evolutionChain;
  } catch (e) {
    console.log("Error! Could not account for evolution: ", e);
    return 0;
  }
};

const makeRandomTeam = async (exceptions) => {
  let invalidNumbers = [...exceptions];
  let evolutions = [];
  for (slot of slots) {
    let pokedexNumber = getRandomNumber(pokedexLimit);
    let evolutionChain = await getEvolutionChain(pokedexNumber);
    //console.log("evoChain: ", typeof evolutionChain, evolutionChain);
    while (
      invalidNumbers.includes(pokedexNumber) ||
      evolutions.includes(evolutionChain)
    ) {
      pokedexNumber = getRandomNumber(pokedexLimit);
      evolutionChain = await getEvolutionChain(pokedexNumber);
    }
    invalidNumbers.push(pokedexNumber);
    evolutions.push(evolutionChain);
    //console.log("evos: ", evolutions);
    makePokemon(slot, pokedexNumber);
  }
};

randomizer.addEventListener("click", () => {
  if (checkbox.checked) {
    makeRandomTeam(legends);
  } else {
    makeRandomTeam([]);
  }
});

genSelector.addEventListener("click", () => {
  updatePokedexLimit();
  //console.log(pokedexLimit)
});
