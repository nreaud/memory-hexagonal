<script setup lang="ts">

import {watchEffect, ref, watch} from 'vue';
import { useTimer } from 'vue-timer-hook';
import { getAllCombinaisons, electObjectiveNumber, initRawLeafs, initLeafsRelations, getDifferentsObjectivesNumbers, Leaf, buildGrid} from './utils';

let time;
let timer; 
const MINUTES_MANCHE = 0.03;
const ROUNDS = 10;
let numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8];
const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S'];
const leafs = new Array(letters.length);
let allCombinaisons: Leaf[][] = [];
let availablesCombinaisons: Leaf[][] = [];
const RENDER_SLEEP = 1500;
let waitForNextClick = false;

let colors = [
  {'color': 'red', 'text-color': 'black'},
  {'color': 'blue', 'text-color': 'white'},
  {'color': 'yellow', 'text-color': 'black'},
  {'color': 'green', 'text-color': 'black'},
  {'color': 'orange', 'text-color': 'black'},
  {'color': 'purple', 'text-color': 'black'},
  {'color': 'pink', 'text-color': 'black'},
]

const hideRef = ref(false);
const launchedRef = ref(false);
const doneRef = ref(false);
const valuesRef = ref(numbers.map((number)=> number+''));
const roundCountRef = ref(1);
const objectiveNumberRef = ref(-1);
let playersRef = ref(['a', 'b', 'c']);
const activePlayerRef = ref("");
const playersPointsRef = ref([]);
const guessTrioRef = ref([]);
const guessIndexesRef = ref([]); // for dynamic class
const wrongCombinaisonRef = ref(false);
const validCombinaisonRef = ref(false);


const launchRound = () => {
  //TODO vérifer que les noms des joueurs sont différents
  // initier les points à 0 pour chaque joueur
  playersPointsRef.value = new Array(playersRef.value.length);
  for(let i = 0; i<playersPointsRef.value.length; i++){
    playersPointsRef.value[i] = 0;
  }
  time = new Date();
  time.setSeconds(time.getSeconds() + MINUTES_MANCHE*60);
  launchedRef.value = true;
  timer.restart(time.getTime(), true);
  numbers = buildGrid(numbers.length);
  let differentObjectivesNumbers = getDifferentsObjectivesNumbers(allCombinaisons, leafs, numbers);
  objectiveNumberRef.value = electObjectiveNumber(differentObjectivesNumbers);
  let availablesCombinaisonsOpt = differentObjectivesNumbers.get(objectiveNumberRef.value);
  if(!availablesCombinaisonsOpt){ // case undefined
    throw "impossible";
  }else{
    availablesCombinaisons = availablesCombinaisonsOpt;
  }
}

const isValidTrio = (trio: Leaf[]): boolean => {
  let indexCombinaison = availablesCombinaisons.indexOf(trio);
  let res = false;
  if(indexCombinaison !== -1){
    res = true;
    availablesCombinaisons.splice(indexCombinaison, 1); //Supprime l'élément à la position
  }
  return res;
}

const activePlayer = (player) => {
  console.log("Active player:"+player);
  activePlayerRef.value=player;
}

const testCombinaison = async (combinaison: Leaf[]) => {
  console.log("Combinaison testée: "+combinaison);
  if(isValidTrio(combinaison)){
      const indexPlayer = playersRef.value.indexOf(activePlayer);
      playersPointsRef.value[indexPlayer]++;
      validCombinaisonRef.value = true;
      waitForNextClick=true;
  }else{
      wrongCombinaisonRef.value = true;
      waitForNextClick = true;
  }
}

const clickOnHexagon = async (indexHexagon) => {
  //1er clique, 2nd et dernier: testCombinaison()
  if(!waitForNextClick){
    const newLeaf = leafs[indexHexagon];
    if(guessTrioRef.value.length > 0){
      if(guessTrioRef.value.includes(newLeaf)){
        wrongCombinaisonRef.value = true;
      }else{
        const last:Leaf = guessTrioRef.value[guessTrioRef.value.length-1];
        if(!last.neighbors.includes(newLeaf)){
          wrongCombinaisonRef.value = true;
        }
      }
    }
    guessTrioRef.value.push(newLeaf);
    guessIndexesRef.value.push(indexHexagon);
    if(guessTrioRef.value.length>3){
      wrongCombinaisonRef.value = true;
    }
    if(wrongCombinaisonRef.value){
      waitForNextClick = true;
    }else{
      if(guessTrioRef.length === 3){
        testCombinaison(guessTrioRef.value);
      }
    }
  }
}

//TODO dynamic class with function to not have severals at the same time
//TODO why sometimes 4 clickables?

watch(wrongCombinaisonRef, async(newValue, oldValue) => {
  if(newValue === true){
    await new Promise((r) => setTimeout(r, RENDER_SLEEP));
    wrongCombinaisonRef.value = false;
    guessTrioRef.value=[];
    guessIndexesRef.value=[];
    waitForNextClick = false;
  }
})

watch(validCombinaisonRef, async(newValue, oldValue) => {
  if(newValue === true){
    await new Promise((r) => setTimeout(r, RENDER_SLEEP));
    validCombinaisonRef.value = false;
    guessTrioRef.value=[];
    guessIndexesRef.value=[];
    waitForNextClick = false;
    if(availablesCombinaisons.length === 0){ // mis à jour par isValidTrio()
      roundCountRef.value++;
      if(roundCountRef.value <= ROUNDS){
        launchRound();
      }
    }
  }
})

timer = useTimer(time, false);
watchEffect(async () => {
  if(timer.isExpired.value) {
    hideRef.value = true;
    valuesRef.value = letters;
    console.warn('IsExpired')
  }
});
initRawLeafs(leafs, letters);
initLeafsRelations(leafs);
allCombinaisons = getAllCombinaisons(leafs);

</script>

<template>
  <div class="background">
    <div v-if="!launchedRef">
        <h2>Veuillez sélectionner le nombre de joueurs</h2>
        <form @submit.prevent="launchRound()">
            <input type="number" v-model="playersRef.length">
            <input v-for="(player,i) in playersRef" v-model="playersRef[i]" type="text">
            <input type="submit" value="Prêt">
        </form>
    </div>
    <div v-if="launchedRef && !doneRef">
      <div>
          <span>{{timer.minutes}} : </span><span>{{timer.seconds}}</span>
      </div>
      <button v-for="player in playersRef" @click="activePlayer(player)">{{player}}</button>
      <div v-for="playerPoint in playersPointsRef">{{playerPoint}}</div>
      <v-container align-center justify-center row fill-height>
        <v-row class="three-hex-row-top">
          <div class="spaceHexagon" @click="clickOnHexagon(0)">
            <div class="drawHexagonPlain" :class="{hexagonWhite: !hideRef, hexagonBlack: hideRef}"></div>
            <strong class="text" :class="{'text-white': hideRef, 
            'text-black': !hideRef, 'text-red': wrongCombinaisonRef && guessIndexesRef.includes(0), 
            'text-green': validCombinaisonRef  && guessIndexesRef.includes(0), 
            'text-blue': guessIndexesRef.includes(0)}">{{valuesRef[0]}}</strong>
            <div class="drawHexagonBorder" :class="{hexagonBorderWhite: hideRef, hexagonBorderBlack: !hideRef}"></div>
          </div>
          <div class="spaceHexagon" @click="clickOnHexagon(1)">
            <div class="drawHexagonPlain" :class="{hexagonWhite: !hideRef, hexagonBlack: hideRef}"></div>
            <strong class="text" :class="{'text-white': hideRef, 
            'text-black': !hideRef, 'text-red': wrongCombinaisonRef && guessIndexesRef.includes(1), 
            'text-green': validCombinaisonRef  && guessIndexesRef.includes(1), 
            'text-blue': guessIndexesRef.includes(1)}">{{valuesRef[1]}}</strong>
            <div class="drawHexagonBorder" :class="{hexagonBorderWhite: hideRef, hexagonBorderBlack: !hideRef}"></div>
          </div>
          <div class="spaceHexagon" @click="clickOnHexagon(2)">
            <div class="drawHexagonPlain" :class="{hexagonWhite: !hideRef, hexagonBlack: hideRef}"></div>
            <strong class="text" :class="{'text-white': hideRef, 
            'text-black': !hideRef, 'text-red': wrongCombinaisonRef && guessIndexesRef.includes(2), 
            'text-green': validCombinaisonRef  && guessIndexesRef.includes(2), 
            'text-blue': guessIndexesRef.includes(2)}">{{valuesRef[2]}}</strong>
            <div class="drawHexagonBorder" :class="{hexagonBorderWhite: hideRef, hexagonBorderBlack: !hideRef}"></div>
          </div>
        </v-row>
        <v-row class="four-hex-row-top">
          <div class="spaceHexagon" @click="clickOnHexagon(3)">
            <div class="drawHexagonPlain" :class="{hexagonWhite: !hideRef, hexagonBlack: hideRef}"></div>
            <strong class="text" :class="{'text-white': hideRef, 
            'text-black': !hideRef, 'text-red': wrongCombinaisonRef && guessIndexesRef.includes(3), 
            'text-green': validCombinaisonRef  && guessIndexesRef.includes(3), 
            'text-blue': guessIndexesRef.includes(3)}">{{valuesRef[3]}}</strong>
            <div class="drawHexagonBorder" :class="{hexagonBorderWhite: hideRef, hexagonBorderBlack: !hideRef}"></div>
          </div>
          <div class="spaceHexagon" @click="clickOnHexagon(4)">
            <div class="drawHexagonPlain" :class="{hexagonWhite: !hideRef, hexagonBlack: hideRef}"></div>
            <strong class="text" :class="{'text-white': hideRef, 
            'text-black': !hideRef, 'text-red': wrongCombinaisonRef && guessIndexesRef.includes(4), 
            'text-green': validCombinaisonRef  && guessIndexesRef.includes(4), 
            'text-blue': guessIndexesRef.includes(4)}">{{valuesRef[4]}}</strong>
            <div class="drawHexagonBorder" :class="{hexagonBorderWhite: hideRef, hexagonBorderBlack: !hideRef}"></div>
          </div>
          <div class="spaceHexagon" @click="clickOnHexagon(5)">
            <div class="drawHexagonPlain" :class="{hexagonWhite: !hideRef, hexagonBlack: hideRef}"></div>
            <strong class="text" :class="{'text-white': hideRef, 
            'text-black': !hideRef, 'text-red': wrongCombinaisonRef && guessIndexesRef.includes(5), 
            'text-green': validCombinaisonRef  && guessIndexesRef.includes(5), 
            'text-blue': guessIndexesRef.includes(5)}">{{valuesRef[5]}}</strong>
            <div class="drawHexagonBorder" :class="{hexagonBorderWhite: hideRef, hexagonBorderBlack: !hideRef}"></div>
          </div>
          <div class="spaceHexagon" @click="clickOnHexagon(6)">
            <div class="drawHexagonPlain" :class="{hexagonWhite: !hideRef, hexagonBlack: hideRef}"></div>
            <strong class="text" :class="{'text-white': hideRef, 
            'text-black': !hideRef, 'text-red': wrongCombinaisonRef && guessIndexesRef.includes(6), 
            'text-green': validCombinaisonRef  && guessIndexesRef.includes(6), 
            'text-blue': guessIndexesRef.includes(6)}">{{valuesRef[6]}}</strong>
            <div class="drawHexagonBorder" :class="{hexagonBorderWhite: hideRef, hexagonBorderBlack: !hideRef}"></div>
          </div>
        </v-row>
        <v-row class="five-hex-row">
          <div class="spaceHexagon" @click="clickOnHexagon(7)">
            <div class="drawHexagonPlain" :class="{hexagonWhite: !hideRef, hexagonBlack: hideRef}"></div>
            <strong class="text" :class="{'text-white': hideRef, 
            'text-black': !hideRef, 'text-red': wrongCombinaisonRef && guessIndexesRef.includes(7), 
            'text-green': validCombinaisonRef  && guessIndexesRef.includes(7), 
            'text-blue': guessIndexesRef.includes(7)}">{{valuesRef[7]}}</strong>
            <div class="drawHexagonBorder" :class="{hexagonBorderWhite: hideRef, hexagonBorderBlack: !hideRef}"></div>
          </div>
          <div class="spaceHexagon" @click="clickOnHexagon(8)">
            <div class="drawHexagonPlain" :class="{hexagonWhite: !hideRef, hexagonBlack: hideRef}"></div>
            <strong class="text" :class="{'text-white': hideRef, 
            'text-black': !hideRef, 'text-red': wrongCombinaisonRef && guessIndexesRef.includes(8), 
            'text-green': validCombinaisonRef  && guessIndexesRef.includes(8), 
            'text-blue': guessIndexesRef.includes(8)}">{{valuesRef[8]}}</strong>
            <div class="drawHexagonBorder" :class="{hexagonBorderWhite: hideRef, hexagonBorderBlack: !hideRef}"></div>
          </div>
          <div class="spaceHexagon" @click="clickOnHexagon(9)">
            <div class="drawHexagonPlain" :class="{hexagonWhite: !hideRef, hexagonBlack: hideRef}"></div>
            <strong class="text" :class="{'text-white': hideRef, 
            'text-black': !hideRef, 'text-red': wrongCombinaisonRef && guessIndexesRef.includes(9), 
            'text-green': validCombinaisonRef  && guessIndexesRef.includes(9), 
            'text-blue': guessIndexesRef.includes(9)}">{{valuesRef[9]}}</strong>
            <div class="drawHexagonBorder" :class="{hexagonBorderWhite: hideRef, hexagonBorderBlack: !hideRef}"></div>
          </div>
          <div class="spaceHexagon" @click="clickOnHexagon(10)">
            <div class="drawHexagonPlain" :class="{hexagonWhite: !hideRef, hexagonBlack: hideRef}"></div>
            <strong class="text" :class="{'text-white': hideRef, 
            'text-black': !hideRef, 'text-red': wrongCombinaisonRef && guessIndexesRef.includes(10), 
            'text-green': validCombinaisonRef  && guessIndexesRef.includes(10), 
            'text-blue': guessIndexesRef.includes(10)}">{{valuesRef[10]}}</strong>
            <div class="drawHexagonBorder" :class="{hexagonBorderWhite: hideRef, hexagonBorderBlack: !hideRef}"></div>
          </div>
          <div class="spaceHexagon" @click="clickOnHexagon(11)">
            <div class="drawHexagonPlain" :class="{hexagonWhite: !hideRef, hexagonBlack: hideRef}"></div>
            <strong class="text" :class="{'text-white': hideRef, 
            'text-black': !hideRef, 'text-red': wrongCombinaisonRef && guessIndexesRef.includes(11), 
            'text-green': validCombinaisonRef  && guessIndexesRef.includes(11), 
            'text-blue': guessIndexesRef.includes(11)}">{{valuesRef[11]}}</strong>
            <div class="drawHexagonBorder" :class="{hexagonBorderWhite: hideRef, hexagonBorderBlack: !hideRef}"></div>
          </div>
        </v-row>
        <v-row class="four-hex-row-bottom">
          <div class="spaceHexagon" @click="clickOnHexagon(12)">
            <div class="drawHexagonPlain" :class="{hexagonWhite: !hideRef, hexagonBlack: hideRef}"></div>
            <strong class="text" :class="{'text-white': hideRef, 
            'text-black': !hideRef, 'text-red': wrongCombinaisonRef && guessIndexesRef.includes(12), 
            'text-green': validCombinaisonRef  && guessIndexesRef.includes(12), 
            'text-blue': guessIndexesRef.includes(12)}">{{valuesRef[12]}}</strong>
            <div class="drawHexagonBorder" :class="{hexagonBorderWhite: hideRef, hexagonBorderBlack: !hideRef}"></div>
          </div>
          <div class="spaceHexagon" @click="clickOnHexagon(13)">
            <div class="drawHexagonPlain" :class="{hexagonWhite: !hideRef, hexagonBlack: hideRef}"></div>
            <strong class="text" :class="{'text-white': hideRef, 
            'text-black': !hideRef, 'text-red': wrongCombinaisonRef && guessIndexesRef.includes(13), 
            'text-green': validCombinaisonRef  && guessIndexesRef.includes(13), 
            'text-blue': guessIndexesRef.includes(13)}">{{valuesRef[13]}}</strong>
            <div class="drawHexagonBorder" :class="{hexagonBorderWhite: hideRef, hexagonBorderBlack: !hideRef}"></div>
          </div>
          <div class="spaceHexagon" @click="clickOnHexagon(14)">
            <div class="drawHexagonPlain" :class="{hexagonWhite: !hideRef, hexagonBlack: hideRef}"></div>
            <strong class="text" :class="{'text-white': hideRef, 
            'text-black': !hideRef, 'text-red': wrongCombinaisonRef && guessIndexesRef.includes(14), 
            'text-green': validCombinaisonRef  && guessIndexesRef.includes(14), 
            'text-blue': guessIndexesRef.includes(14)}">{{valuesRef[14]}}</strong>
            <div class="drawHexagonBorder" :class="{hexagonBorderWhite: hideRef, hexagonBorderBlack: !hideRef}"></div>
          </div>
          <div class="spaceHexagon" @click="clickOnHexagon(15)">
            <div class="drawHexagonPlain" :class="{hexagonWhite: !hideRef, hexagonBlack: hideRef}"></div>
            <strong class="text" :class="{'text-white': hideRef, 
            'text-black': !hideRef, 'text-red': wrongCombinaisonRef && guessIndexesRef.includes(15), 
            'text-green': validCombinaisonRef  && guessIndexesRef.includes(15), 
            'text-blue': guessIndexesRef.includes(15)}">{{valuesRef[15]}}</strong>
            <div class="drawHexagonBorder" :class="{hexagonBorderWhite: hideRef, hexagonBorderBlack: !hideRef}"></div>
          </div>
        </v-row>
        <v-row class="three-hex-row-bottom">
          <div class="spaceHexagon" @click="clickOnHexagon(16)">
            <div class="drawHexagonPlain" :class="{hexagonWhite: !hideRef, hexagonBlack: hideRef}"></div>
            <strong class="text" :class="{'text-white': hideRef, 
            'text-black': !hideRef, 'text-red': wrongCombinaisonRef && guessIndexesRef.includes(16), 
            'text-green': validCombinaisonRef  && guessIndexesRef.includes(16), 
            'text-blue': guessIndexesRef.includes(16)}">{{valuesRef[16]}}</strong>
            <div class="drawHexagonBorder" :class="{hexagonBorderWhite: hideRef, hexagonBorderBlack: !hideRef}"></div>
          </div>
          <div class="spaceHexagon" @click="clickOnHexagon(17)">
            <div class="drawHexagonPlain" :class="{hexagonWhite: !hideRef, hexagonBlack: hideRef}"></div>
            <strong class="text" :class="{'text-white': hideRef, 
            'text-black': !hideRef, 'text-red': wrongCombinaisonRef && guessIndexesRef.includes(17), 
            'text-green': validCombinaisonRef  && guessIndexesRef.includes(17), 
            'text-blue': guessIndexesRef.includes(17)}">{{valuesRef[17]}}</strong>
            <div class="drawHexagonBorder" :class="{hexagonBorderWhite: hideRef, hexagonBorderBlack: !hideRef}"></div>
          </div>  
          <div class="spaceHexagon" @click="clickOnHexagon(18)">
            <div class="drawHexagonPlain" :class="{hexagonWhite: !hideRef, hexagonBlack: hideRef}"></div>
            <strong class="text" :class="{'text-white': hideRef, 
            'text-black': !hideRef, 'text-red': wrongCombinaisonRef && guessIndexesRef.includes(18), 
            'text-green': validCombinaisonRef  && guessIndexesRef.includes(18), 
            'text-blue': guessIndexesRef.includes(18)}">{{valuesRef[18]}}</strong>
            <div class="drawHexagonBorder" :class="{hexagonBorderWhite: hideRef, hexagonBorderBlack: !hideRef}"></div> 
          </div>
        </v-row>
      </v-container>
    </div>
  </div>
</template>

<style scoped>

.v-row{
  margin-top: 0px !important;
}

.background{
  width: 1920px;
  height: 1080px;
}

.three-hex-row-top{
  padding-left: 130px;
  position: relative;
  top: 52px
}

.three-hex-row-bottom{
  padding-left: 130px;
  position: relative;
  bottom: 52px
}


.four-hex-row-top{
  padding-left: 66px;
  position: relative;
  top: 26px
}


.four-hex-row-bottom{
  padding-left: 66px;
  position: relative;
  bottom: 26px
}

.spaceHexagon {
  height: 150px; /* adjust to control the size  */
}

.drawHexagonBorder {
  height: 100%;
  --b: 3px; /* adjust to control the border  */
  aspect-ratio: cos(30deg);
  clip-path: 
    polygon(50% 0,-50% 50%,50% 100%,150% 50%,50% 0,
    50% var(--b),
    calc(100% - var(--b)*sin(60deg)) calc(25% + var(--b)*cos(60deg)),
    calc(100% - var(--b)*sin(60deg)) calc(75% - var(--b)*cos(60deg)),
    50% calc(100% - var(--b)),
    calc(var(--b)*sin(60deg)) calc(75% - var(--b)*cos(60deg)),
    calc(var(--b)*sin(60deg)) calc(25% + var(--b)*cos(60deg)),
    50% var(--b));
  position: relative;
  top: -222px;
}

.hexagonBorderWhite{
  background: white;
}

.hexagonBorderBlack{
  background: black;
}

.drawHexagonPlain{
  height: 100%; /* adjust to control the size  */
  aspect-ratio: cos(30deg);
  clip-path: polygon(-50% 50%,50% 100%,150% 50%,50% 0);
}

.hexagonWhite{
  background: white;
}

.hexagonBlack{
  background: black;
}

.text{
  position: relative;
  top: -110px;
  z-index: 1;
  font-size: xxx-large;
}

.text-white{
  color: white;
}
.text-black{
  color: black;
}
.text-blue{
  color: blue;
}
.text-green{
  color: green;
}
.text-red{
  color: red;
}

</style>
