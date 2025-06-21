<script setup lang="ts">

import {watchEffect, ref} from 'vue';
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
const guessTrioRef = ref("");
const player1Ref = ref("player1");
const player2Ref = ref("player2");
const player1Points = ref(0);
const player2Points = ref(0);
const testingPlayerRef = ref("");
const roundCountRef = ref(1);
const objectiveNumberRef = ref(-1);
let playersRef = ref([]);


const launchRound = () => {
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

const submit = (event) => {
  if(event){
      event.preventDefault()
  }
  console.log("Combinaison testée: "+guessTrioRef.value);
  if(testTrio(guessTrioRef.value)){
      if(testingPlayerRef.value === player1Ref.value){
        player1Points.value++;
      }else{
        player2Points.value++;
      }
      if(availablesCombinaisons.length === 0){
        roundCountRef.value++;
        if(roundCountRef.value <= ROUNDS){
          launchRound();
        }
      }
  }else{
      console.log("Combinaison incorrect");
  }
  testingPlayerRef.value = "";
  guessTrioRef.value="";
}

const testTrio = (trio): boolean => {
  let indexCombinaison = availablesCombinaisons.indexOf(trio);
  let res = false;
  if(indexCombinaison !== -1){
    res = true;
    availablesCombinaisons.splice(indexCombinaison, 1); //Supprime l'élément à la position
  }
  return res;
}

timer = useTimer(time, false);
watchEffect(async () => {
  if(timer.isExpired.value) {
    hideRef.value = true;
    valuesRef.value = letters;
    console.warn('IsExpired')
  }
});
initRawLeafs(leafs);
initLeafsRelations(leafs);
allCombinaisons = getAllCombinaisons(leafs);

</script>

<template>
  <div class="background">
    <div v-if="!launchedRef">
        <h2>Veuillez sélectionner le nombre de joueurs</h2>
        <form @submit.prevent="launchRound()">
            <input v-for="(player,i) in playersRef" v-model="playersRef[i]" type="text">
        </form>
    </div>
    <div v-if="launchedRef && !doneRef">
      <div>
          <span>{{timer.minutes}} : </span><span>{{timer.seconds}}</span>
      </div>
      <button v-for="(player,i) in playersRef">{{playersRef[i]}}</button>
      <v-container align-center justify-center row fill-height>
        <v-row class="three-hex-row-top">
          <div class="spaceHexagon">
            <div class="drawHexagonPlain" :class="{hexagonWhite: !hideRef, hexagonBlack: hideRef}"></div>
            <strong class="text" :class="{'text-white': hideRef, 'text-black': !hideRef}">{{valuesRef[0]}}</strong>
            <div class="drawHexagonBorder" :class="{hexagonBorderWhite: hideRef, hexagonBorderBlack: !hideRef}"></div>
          </div>
          <div class="spaceHexagon">
            <div class="drawHexagonPlain" :class="{hexagonWhite: !hideRef, hexagonBlack: hideRef}"></div>
            <strong class="text" :class="{'text-white': hideRef, 'text-black': !hideRef}">{{valuesRef[1]}}</strong>
            <div class="drawHexagonBorder" :class="{hexagonBorderWhite: hideRef, hexagonBorderBlack: !hideRef}"></div>
          </div>
          <div class="spaceHexagon">
            <div class="drawHexagonPlain" :class="{hexagonWhite: !hideRef, hexagonBlack: hideRef}"></div>
            <strong class="text" :class="{'text-white': hideRef, 'text-black': !hideRef}">{{valuesRef[2]}}</strong>
            <div class="drawHexagonBorder" :class="{hexagonBorderWhite: hideRef, hexagonBorderBlack: !hideRef}"></div>
          </div>
        </v-row>
        <v-row class="four-hex-row-top">
          <div class="spaceHexagon">
            <div class="drawHexagonPlain" :class="{hexagonWhite: !hideRef, hexagonBlack: hideRef}"></div>
            <strong class="text" :class="{'text-white': hideRef, 'text-black': !hideRef}">{{valuesRef[3]}}</strong>
            <div class="drawHexagonBorder" :class="{hexagonBorderWhite: hideRef, hexagonBorderBlack: !hideRef}"></div>
          </div>
          <div class="spaceHexagon">
            <div class="drawHexagonPlain" :class="{hexagonWhite: !hideRef, hexagonBlack: hideRef}"></div>
            <strong class="text" :class="{'text-white': hideRef, 'text-black': !hideRef}">{{valuesRef[4]}}</strong>
            <div class="drawHexagonBorder" :class="{hexagonBorderWhite: hideRef, hexagonBorderBlack: !hideRef}"></div>
          </div>
          <div class="spaceHexagon">
            <div class="drawHexagonPlain" :class="{hexagonWhite: !hideRef, hexagonBlack: hideRef}"></div>
            <strong class="text" :class="{'text-white': hideRef, 'text-black': !hideRef}">{{valuesRef[5]}}</strong>
            <div class="drawHexagonBorder" :class="{hexagonBorderWhite: hideRef, hexagonBorderBlack: !hideRef}"></div>
          </div>
          <div class="spaceHexagon">
            <div class="drawHexagonPlain" :class="{hexagonWhite: !hideRef, hexagonBlack: hideRef}"></div>
            <strong class="text" :class="{'text-white': hideRef, 'text-black': !hideRef}">{{valuesRef[6]}}</strong>
            <div class="drawHexagonBorder" :class="{hexagonBorderWhite: hideRef, hexagonBorderBlack: !hideRef}"></div>
          </div>
        </v-row>
        <v-row class="five-hex-row">
          <div class="spaceHexagon">
            <div class="drawHexagonPlain" :class="{hexagonWhite: !hideRef, hexagonBlack: hideRef}"></div>
            <strong class="text" :class="{'text-white': hideRef, 'text-black': !hideRef}">{{valuesRef[7]}}</strong>
            <div class="drawHexagonBorder" :class="{hexagonBorderWhite: hideRef, hexagonBorderBlack: !hideRef}"></div>
          </div>
          <div class="spaceHexagon">
            <div class="drawHexagonPlain" :class="{hexagonWhite: !hideRef, hexagonBlack: hideRef}"></div>
            <strong class="text" :class="{'text-white': hideRef, 'text-black': !hideRef}">{{valuesRef[8]}}</strong>
            <div class="drawHexagonBorder" :class="{hexagonBorderWhite: hideRef, hexagonBorderBlack: !hideRef}"></div>
          </div>
          <div class="spaceHexagon">
            <div class="drawHexagonPlain" :class="{hexagonWhite: !hideRef, hexagonBlack: hideRef}"></div>
            <strong class="text" :class="{'text-white': hideRef, 'text-black': !hideRef}">{{valuesRef[9]}}</strong>
            <div class="drawHexagonBorder" :class="{hexagonBorderWhite: hideRef, hexagonBorderBlack: !hideRef}"></div>
          </div>
          <div class="spaceHexagon">
            <div class="drawHexagonPlain" :class="{hexagonWhite: !hideRef, hexagonBlack: hideRef}"></div>
            <strong class="text" :class="{'text-white': hideRef, 'text-black': !hideRef}">{{valuesRef[10]}}</strong>
            <div class="drawHexagonBorder" :class="{hexagonBorderWhite: hideRef, hexagonBorderBlack: !hideRef}"></div>
          </div>
          <div class="spaceHexagon">
            <div class="drawHexagonPlain" :class="{hexagonWhite: !hideRef, hexagonBlack: hideRef}"></div>
            <strong class="text" :class="{'text-white': hideRef, 'text-black': !hideRef}">{{valuesRef[11]}}</strong>
            <div class="drawHexagonBorder" :class="{hexagonBorderWhite: hideRef, hexagonBorderBlack: !hideRef}"></div>
          </div>
        </v-row>
        <v-row class="four-hex-row-bottom">
          <div class="spaceHexagon">
            <div class="drawHexagonPlain" :class="{hexagonWhite: !hideRef, hexagonBlack: hideRef}"></div>
            <strong class="text" :class="{'text-white': hideRef, 'text-black': !hideRef}">{{valuesRef[12]}}</strong>
            <div class="drawHexagonBorder" :class="{hexagonBorderWhite: hideRef, hexagonBorderBlack: !hideRef}"></div>
          </div>
          <div class="spaceHexagon">
            <div class="drawHexagonPlain" :class="{hexagonWhite: !hideRef, hexagonBlack: hideRef}"></div>
            <strong class="text" :class="{'text-white': hideRef, 'text-black': !hideRef}">{{valuesRef[13]}}</strong>
            <div class="drawHexagonBorder" :class="{hexagonBorderWhite: hideRef, hexagonBorderBlack: !hideRef}"></div>
          </div>
          <div class="spaceHexagon">
            <div class="drawHexagonPlain" :class="{hexagonWhite: !hideRef, hexagonBlack: hideRef}"></div>
            <strong class="text" :class="{'text-white': hideRef, 'text-black': !hideRef}">{{valuesRef[14]}}</strong>
            <div class="drawHexagonBorder" :class="{hexagonBorderWhite: hideRef, hexagonBorderBlack: !hideRef}"></div>
          </div>
          <div class="spaceHexagon">
            <div class="drawHexagonPlain" :class="{hexagonWhite: !hideRef, hexagonBlack: hideRef}"></div>
            <strong class="text" :class="{'text-white': hideRef, 'text-black': !hideRef}">{{valuesRef[15]}}</strong>
            <div class="drawHexagonBorder" :class="{hexagonBorderWhite: hideRef, hexagonBorderBlack: !hideRef}"></div>
          </div>
        </v-row>
        <v-row class="three-hex-row-bottom">
          <div class="spaceHexagon">
            <div class="drawHexagonPlain" :class="{hexagonWhite: !hideRef, hexagonBlack: hideRef}"></div>
            <strong class="text" :class="{'text-white': hideRef, 'text-black': !hideRef}">{{valuesRef[16]}}</strong>
            <div class="drawHexagonBorder" :class="{hexagonBorderWhite: hideRef, hexagonBorderBlack: !hideRef}"></div>
          </div>
          <div class="spaceHexagon">
            <div class="drawHexagonPlain" :class="{hexagonWhite: !hideRef, hexagonBlack: hideRef}"></div>
            <strong class="text" :class="{'text-white': hideRef, 'text-black': !hideRef}">{{valuesRef[17]}}</strong>
            <div class="drawHexagonBorder" :class="{hexagonBorderWhite: hideRef, hexagonBorderBlack: !hideRef}"></div>
          </div>  
          <div class="spaceHexagon">
            <div class="drawHexagonPlain" :class="{hexagonWhite: !hideRef, hexagonBlack: hideRef}"></div>
            <strong class="text" :class="{'text-white': hideRef, 'text-black': !hideRef}">{{valuesRef[18]}}</strong>
            <div class="drawHexagonBorder" :class="{hexagonBorderWhite: hideRef, hexagonBorderBlack: !hideRef}"></div> 
          </div>
        </v-row>
      </v-container>
      <form @submit.prevent="handleSubmit">
          <input v-model="guessTrioRef" @keyup.enter="submit($event)" class="mot-trouve"/>
      </form>
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
.text-white{
  color: black;
}

</style>
