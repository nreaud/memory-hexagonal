export class Leaf {
  neighbors: Leaf[];
}

export const getAllCombinaisons = (leafs: Leaf[]): Leaf[][] => {
  let combinaisons: Leaf[][] = [];
  for(let leaf of leafs){
    for(let neighbor1 of leaf.neighbors){
      for(let neighbor2 of neighbor1.neighbors){
        let currentCombinaisons: Leaf[] = [leaf, neighbor1]; // By nature diffents leafs
        if(!currentCombinaisons.includes(neighbor2)){ // In cas of going backward
          currentCombinaisons.push(neighbor2);
          combinaisons.push(currentCombinaisons);
        }
      }
    }
  }
  return combinaisons;
}

export const electObjectiveNumber = (diffentObjectiveNumbers: Map<number, Leaf[][]>): number => {
  let indexObjectiveNumber = Math.floor(Math.random()*(diffentObjectiveNumbers.size+1));
  return diffentObjectiveNumbers.keys().toArray()[indexObjectiveNumber];

}

export const initRawLeafs = (leafs: Leaf[]) => {
  for(let i = 0; i<leafs.length; i++){
    leafs[i] = new Leaf();
  }
}

export const initLeafsRelations = (leafs: Leaf[]) => {
  //First line
  leafs[0].neighbors = new Array(leafs[1], leafs[3], leafs[4]);
  leafs[1].neighbors = new Array(leafs[0], leafs[2], leafs[4], leafs[5]);
  leafs[2].neighbors = new Array(leafs[1], leafs[5], leafs[6]);
  //Second line
  leafs[3].neighbors = new Array(leafs[0], leafs[4], leafs[7], leafs[8]);
  leafs[4].neighbors = new Array(leafs[0], leafs[1], leafs[3], leafs[5], leafs[8], leafs[9]);
  leafs[5].neighbors = new Array(leafs[1], leafs[2], leafs[4], leafs[6], leafs[9], leafs[10]);
  leafs[6].neighbors = new Array(leafs[2], leafs[5], leafs[10], leafs[11]);
  //Third line
  leafs[7].neighbors = new Array(leafs[3], leafs[8], leafs[12]);
  leafs[8].neighbors = new Array(leafs[3], leafs[4], leafs[7], leafs[9], leafs[12], leafs[13]);
  leafs[9].neighbors = new Array(leafs[4], leafs[5], leafs[8], leafs[10], leafs[13], leafs[14]);
  leafs[10].neighbors = new Array(leafs[5], leafs[6], leafs[9], leafs[11], leafs[14], leafs[15]);
  leafs[11].neighbors = new Array(leafs[6], leafs[10], leafs[15]);
  //Fourth line
  leafs[12].neighbors = new Array(leafs[7], leafs[8], leafs[13], leafs[16]);
  leafs[13].neighbors = new Array(leafs[8], leafs[9], leafs[12], leafs[14], leafs[16], leafs[17]);
  leafs[14].neighbors = new Array(leafs[9], leafs[10], leafs[13], leafs[15], leafs[17], leafs[18]);
  leafs[15].neighbors = new Array(leafs[10], leafs[11], leafs[14], leafs[18]);
  //Fifth line
  leafs[16].neighbors = new Array(leafs[12], leafs[13], leafs[17]);
  leafs[17].neighbors = new Array(leafs[13], leafs[14], leafs[16], leafs[18]);
  leafs[18].neighbors = new Array(leafs[14], leafs[15], leafs[17]);
}

export const getDifferentsObjectivesNumbers = (combinaisons:Leaf[][], leafs: Leaf[], numbers: number[]): Map<number, Leaf[][]> => {
  let objectivesNumbers:Map<number, Leaf[][]> = new Map();
  for(const combinaison of combinaisons){
    let newNumber = combinaison.map((leaf: Leaf) => leafs.indexOf(leaf))
      .map((leafIndex) => numbers[leafIndex])
      .reduce((acc, value) => acc + value, 0);
    if(objectivesNumbers.has(newNumber)){
      const numberCombinaisons: Leaf[][]|undefined = objectivesNumbers.get(newNumber);
      if(!numberCombinaisons){
        objectivesNumbers.set(newNumber, [combinaison]);
      }else{
        numberCombinaisons.push(combinaison); // should not happen cause we checked if has key before (but here to please ts)
      }
    }else{
      objectivesNumbers.set(newNumber, [combinaison]);
    }
  }
  return objectivesNumbers;
}

export const buildGrid = (length: number) => {
  let res = [];
  for(let i=0; i<length; i++){
    res[i] = Math.floor(Math.random()*10); // entre 0 et 9
  }
  return res;
}