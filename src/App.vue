<script setup lang="ts">

import {watchEffect, ref, watch} from 'vue';
import { useTimer } from 'vue-timer-hook';
import { getAllCombinaisons, electObjectiveNumber, initRawLeafs, initLeafsRelations, getDifferentsObjectivesNumbers, Leaf, buildGrid} from './utils';

let time;
let timer; 
const MINUTES_MANCHE = 0.03;
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
let playersRef = ref([undefined, undefined, undefined]);
const indexActivePlayerRef = ref(-1);
const playersPointsRef = ref([]);
const guessTrioRef = ref([]);
const guessIndexesRef = ref([]); // for dynamic class
const wrongCombinaisonRef = ref(false);
const validCombinaisonRef = ref(false);
const roundDoneRef = ref(false);
const roundsRef = ref(10);


const launchRound = (init=false) => {
  let emptyName:boolean = playersRef.value.filter(playerName => !playerName).length > 0;
  let uniqueNames: string[] = playersRef.value.reduce((uniqueNamesAcc, newName) => {
    if(!uniqueNamesAcc.includes(newName)){
      uniqueNamesAcc.push(newName);
    }
    return uniqueNamesAcc;
  }, []);
  if(!emptyName && uniqueNames.length === playersRef.value.length && playersRef.value.length > 0){
    if(init){
      // initier les points à 0 pour chaque joueur
      playersPointsRef.value = new Array(playersRef.value.length);
      for(let i = 0; i<playersPointsRef.value.length; i++){
        playersPointsRef.value[i] = 0;
      }
    }
    time = new Date();
    time.setSeconds(time.getSeconds() + MINUTES_MANCHE*60);
    launchedRef.value = true;
    timer.restart(time.getTime(), true);

    numbers = buildGrid(numbers.length);
    let differentObjectivesNumbers = getDifferentsObjectivesNumbers(allCombinaisons, leafs, numbers);
    objectiveNumberRef.value = electObjectiveNumber(differentObjectivesNumbers);
    let availablesCombinaisonsOpt = differentObjectivesNumbers.get(objectiveNumberRef.value);

    roundDoneRef.value = false;
    if(!init){
      roundCountRef.value++;
    }

    if(!availablesCombinaisonsOpt){ // case undefined
      throw "impossible";
    }else{
      availablesCombinaisons = availablesCombinaisonsOpt;
    }
  }
}

const isValidTrio = (trio: Leaf[]): boolean => {
  let indexCombinaison = availablesCombinaisons.findIndex((combinaison) => {
    let identical = true;
    for(let i=0; i<combinaison.length; i++){
      if(combinaison[i] != trio[i]){
        identical = false;
        break;
      }
    }
    return identical;
  });
  let res = false;
  if(indexCombinaison !== -1){
    res = true;
    availablesCombinaisons.splice(indexCombinaison, 1); //Supprime l'élément à la position
  }
  return res;
}

const activatePlayer = (index) => {
  console.log("Active player:"+index);
  indexActivePlayerRef.value=index;
}

const testCombinaison = async (combinaison: Leaf[]) => {
  console.log("Combinaison testée: "+combinaison);
  if(isValidTrio(combinaison)){
      playersPointsRef.value[indexActivePlayerRef.value]++;
      validCombinaisonRef.value = true;
  }else{
      wrongCombinaisonRef.value = true;
  }
  waitForNextClick=true;
}

const clickOnHexagon = async (indexHexagon) => {
  //1er clique, 2nd et dernier: testCombinaison()
  if(indexActivePlayerRef.value != -1 && !waitForNextClick){
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
      if(guessTrioRef.value.length === 3){
        testCombinaison(guessTrioRef._rawValue); // otherwise pass a Proxy
      }
    }
  }
}

const getDynamicTextClass = (indexHexagon) => {
  let res = 'text-black';
  if(guessIndexesRef.value.includes(indexHexagon)){
    if(wrongCombinaisonRef.value == true){
      res = 'text-red';
    }else if(validCombinaisonRef.value == true){
      res = 'text-green';
    }else{
      res = 'text-blue';
    }
  }else{
    if(hideRef.value == true){
      res = 'text-white';
    }
  }
  return res;
}

watch(wrongCombinaisonRef, async(newValue, oldValue) => {
  if(newValue === true){
    await new Promise((r) => setTimeout(r, RENDER_SLEEP));
    wrongCombinaisonRef.value = false;
    guessTrioRef.value=[];
    guessIndexesRef.value=[];
    indexActivePlayerRef.value=-1;
    waitForNextClick = false;
  }
})

watch(validCombinaisonRef, async(newValue, oldValue) => {
  if(newValue === true){
    await new Promise((r) => setTimeout(r, RENDER_SLEEP));
    validCombinaisonRef.value = false;
    guessTrioRef.value=[];
    guessIndexesRef.value=[];
    indexActivePlayerRef.value=-1;
    waitForNextClick = false;
    if(availablesCombinaisons.length === 0){ // mis à jour par isValidTrio()
      roundDoneRef.value = true;
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
        <form @submit.prevent="launchRound(true)">
            <input type="number" v-model="playersRef.length">
            <input type="number" v-model="roundsRef">
            <div>
              <input v-for="(player,i) in playersRef" v-model="playersRef[i]"
              type="text" placeholder="Veuillez rentrer un nom">
            </div>
            <input type="submit" value="Prêt">
        </form>
    </div>
    <div v-if="launchedRef && !doneRef">
      <h2>
        Manche {{roundCountRef}}
      </h2>
      <h2>
          <span>{{timer.minutes}} : </span><span>{{timer.seconds}}</span>
      </h2>
      <div style="overflow-x:auto;">
        <table>
          <thead>
            <tr>
              <th v-for="(player, i) in playersRef">
                <button @click="activatePlayer(i)">{{player}}</button>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td v-for="playerPoint in playersPointsRef">
                <span>{{playerPoint}}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <button v-if="roundDoneRef == true && roundCountRef < roundsRef">Nouvelle manche</button>
      <v-container align-center justify-center row fill-height>
        <v-row class="three-hex-row-top">
          <div class="spaceHexagon" @click="clickOnHexagon(0)">
            <div class="drawHexagonPlain" :class="{hexagonWhite: !hideRef, hexagonBlack: hideRef}"></div>
            <strong class="text" :class="getDynamicTextClass(0)">{{valuesRef[0]}}</strong>
            <div class="drawHexagonBorder" :class="{hexagonBorderWhite: hideRef, hexagonBorderBlack: !hideRef}"></div>
          </div>
          <div class="spaceHexagon" @click="clickOnHexagon(1)">
            <div class="drawHexagonPlain" :class="{hexagonWhite: !hideRef, hexagonBlack: hideRef}"></div>
            <strong class="text" :class="getDynamicTextClass(1)">{{valuesRef[1]}}</strong>
            <div class="drawHexagonBorder" :class="{hexagonBorderWhite: hideRef, hexagonBorderBlack: !hideRef}"></div>
          </div>
          <div class="spaceHexagon" @click="clickOnHexagon(2)">
            <div class="drawHexagonPlain" :class="{hexagonWhite: !hideRef, hexagonBlack: hideRef}"></div>
            <strong class="text" :class="getDynamicTextClass(2)">{{valuesRef[2]}}</strong>
            <div class="drawHexagonBorder" :class="{hexagonBorderWhite: hideRef, hexagonBorderBlack: !hideRef}"></div>
          </div>
        </v-row>
        <v-row class="four-hex-row-top">
          <div class="spaceHexagon" @click="clickOnHexagon(3)">
            <div class="drawHexagonPlain" :class="{hexagonWhite: !hideRef, hexagonBlack: hideRef}"></div>
            <strong class="text" :class="getDynamicTextClass(3)">{{valuesRef[3]}}</strong>
            <div class="drawHexagonBorder" :class="{hexagonBorderWhite: hideRef, hexagonBorderBlack: !hideRef}"></div>
          </div>
          <div class="spaceHexagon" @click="clickOnHexagon(4)">
            <div class="drawHexagonPlain" :class="{hexagonWhite: !hideRef, hexagonBlack: hideRef}"></div>
            <strong class="text" :class="getDynamicTextClass(4)">{{valuesRef[4]}}</strong>
            <div class="drawHexagonBorder" :class="{hexagonBorderWhite: hideRef, hexagonBorderBlack: !hideRef}"></div>
          </div>
          <div class="spaceHexagon" @click="clickOnHexagon(5)">
            <div class="drawHexagonPlain" :class="{hexagonWhite: !hideRef, hexagonBlack: hideRef}"></div>
            <strong class="text" :class="getDynamicTextClass(5)">{{valuesRef[5]}}</strong>
            <div class="drawHexagonBorder" :class="{hexagonBorderWhite: hideRef, hexagonBorderBlack: !hideRef}"></div>
          </div>
          <div class="spaceHexagon" @click="clickOnHexagon(6)">
            <div class="drawHexagonPlain" :class="{hexagonWhite: !hideRef, hexagonBlack: hideRef}"></div>
            <strong class="text" :class="getDynamicTextClass(6)">{{valuesRef[6]}}</strong>
            <div class="drawHexagonBorder" :class="{hexagonBorderWhite: hideRef, hexagonBorderBlack: !hideRef}"></div>
          </div>
        </v-row>
        <v-row class="five-hex-row">
          <div class="spaceHexagon" @click="clickOnHexagon(7)">
            <div class="drawHexagonPlain" :class="{hexagonWhite: !hideRef, hexagonBlack: hideRef}"></div>
            <strong class="text" :class="getDynamicTextClass(7)">{{valuesRef[7]}}</strong>
            <div class="drawHexagonBorder" :class="{hexagonBorderWhite: hideRef, hexagonBorderBlack: !hideRef}"></div>
          </div>
          <div class="spaceHexagon" @click="clickOnHexagon(8)">
            <div class="drawHexagonPlain" :class="{hexagonWhite: !hideRef, hexagonBlack: hideRef}"></div>
            <strong class="text" :class="getDynamicTextClass(8)">{{valuesRef[8]}}</strong>
            <div class="drawHexagonBorder" :class="{hexagonBorderWhite: hideRef, hexagonBorderBlack: !hideRef}"></div>
          </div>
          <div class="spaceHexagon" @click="clickOnHexagon(9)">
            <div class="drawHexagonPlain" :class="{hexagonWhite: !hideRef, hexagonBlack: hideRef}"></div>
            <strong class="text" :class="getDynamicTextClass(9)">{{valuesRef[9]}}</strong>
            <div class="drawHexagonBorder" :class="{hexagonBorderWhite: hideRef, hexagonBorderBlack: !hideRef}"></div>
          </div>
          <div class="spaceHexagon" @click="clickOnHexagon(10)">
            <div class="drawHexagonPlain" :class="{hexagonWhite: !hideRef, hexagonBlack: hideRef}"></div>
            <strong class="text" :class="getDynamicTextClass(10)">{{valuesRef[10]}}</strong>
            <div class="drawHexagonBorder" :class="{hexagonBorderWhite: hideRef, hexagonBorderBlack: !hideRef}"></div>
          </div>
          <div class="spaceHexagon" @click="clickOnHexagon(11)">
            <div class="drawHexagonPlain" :class="{hexagonWhite: !hideRef, hexagonBlack: hideRef}"></div>
            <strong class="text" :class="getDynamicTextClass(11)">{{valuesRef[11]}}</strong>
            <div class="drawHexagonBorder" :class="{hexagonBorderWhite: hideRef, hexagonBorderBlack: !hideRef}"></div>
          </div>
        </v-row>
        <v-row class="four-hex-row-bottom">
          <div class="spaceHexagon" @click="clickOnHexagon(12)">
            <div class="drawHexagonPlain" :class="{hexagonWhite: !hideRef, hexagonBlack: hideRef}"></div>
            <strong class="text" :class="getDynamicTextClass(12)">{{valuesRef[12]}}</strong>
            <div class="drawHexagonBorder" :class="{hexagonBorderWhite: hideRef, hexagonBorderBlack: !hideRef}"></div>
          </div>
          <div class="spaceHexagon" @click="clickOnHexagon(13)">
            <div class="drawHexagonPlain" :class="{hexagonWhite: !hideRef, hexagonBlack: hideRef}"></div>
            <strong class="text" :class="getDynamicTextClass(13)">{{valuesRef[13]}}</strong>
            <div class="drawHexagonBorder" :class="{hexagonBorderWhite: hideRef, hexagonBorderBlack: !hideRef}"></div>
          </div>
          <div class="spaceHexagon" @click="clickOnHexagon(14)">
            <div class="drawHexagonPlain" :class="{hexagonWhite: !hideRef, hexagonBlack: hideRef}"></div>
            <strong class="text" :class="getDynamicTextClass(14)">{{valuesRef[14]}}</strong>
            <div class="drawHexagonBorder" :class="{hexagonBorderWhite: hideRef, hexagonBorderBlack: !hideRef}"></div>
          </div>
          <div class="spaceHexagon" @click="clickOnHexagon(15)">
            <div class="drawHexagonPlain" :class="{hexagonWhite: !hideRef, hexagonBlack: hideRef}"></div>
            <strong class="text" :class="getDynamicTextClass(15)">{{valuesRef[15]}}</strong>
            <div class="drawHexagonBorder" :class="{hexagonBorderWhite: hideRef, hexagonBorderBlack: !hideRef}"></div>
          </div>
        </v-row>
        <v-row class="three-hex-row-bottom">
          <div class="spaceHexagon" @click="clickOnHexagon(16)">
            <div class="drawHexagonPlain" :class="{hexagonWhite: !hideRef, hexagonBlack: hideRef}"></div>
            <strong class="text" :class="getDynamicTextClass(16)">{{valuesRef[16]}}</strong>
            <div class="drawHexagonBorder" :class="{hexagonBorderWhite: hideRef, hexagonBorderBlack: !hideRef}"></div>
          </div>
          <div class="spaceHexagon" @click="clickOnHexagon(17)">
            <div class="drawHexagonPlain" :class="{hexagonWhite: !hideRef, hexagonBlack: hideRef}"></div>
            <strong class="text" :class="getDynamicTextClass(17)">{{valuesRef[17]}}</strong>
            <div class="drawHexagonBorder" :class="{hexagonBorderWhite: hideRef, hexagonBorderBlack: !hideRef}"></div>
          </div>  
          <div class="spaceHexagon" @click="clickOnHexagon(18)">
            <div class="drawHexagonPlain" :class="{hexagonWhite: !hideRef, hexagonBlack: hideRef}"></div>
            <strong class="text" :class="getDynamicTextClass(18)">{{valuesRef[18]}}</strong>
            <div class="drawHexagonBorder" :class="{hexagonBorderWhite: hideRef, hexagonBorderBlack: !hideRef}"></div> 
          </div>
        </v-row>
      </v-container>
    </div>
  </div>
</template>

<style scoped>

input[type=text], input[type=number]  {
  border: 1px solid #333;
  margin: 1em;
  display: block;
  margin-left: auto;
  margin-right: auto;
}

table{
  margin-left: auto;
  margin-right: auto;
  font-size: x-large;
}

h2{
  font-size: xx-large;
}

button {
  font-size: x-large;
}

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
