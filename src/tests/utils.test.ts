import { initRawLeafs, initLeafsRelations, Leaf, getAllCombinaisons, buildGrid, getDifferentsObjectivesNumbers, electObjectiveNumber } from '../utils';

let leafs = new Array(19);
initRawLeafs(leafs);
initLeafsRelations(leafs);

describe('Test initRawLeafs + initLeafsRelations', () => {
    it("Si une feuille référence un voisin, la réciproque est vraie", () => {
        for(const leaf of leafs){
            for(const neighbor of leaf.neighbors){
                expect(neighbor.neighbors.includes(leaf),
                     'leaf ' + leafs.indexOf(leaf) + ' neighbor ' + leafs.indexOf(neighbor))
                .toEqual(true);
            }
        }
    })
    it("Les feuilles ne référence pas 2 fois la même branche", () => {
        for(const leaf of leafs){
            const singletons = leaf.neighbors.reduce((acc: Leaf[], value: Leaf)=> {
                if(!acc.includes(value)){
                    acc.push(value);
                }
                return acc;
            }, []);
            expect(singletons.length).toEqual(leaf.neighbors.length);
        }
    })
});

describe('Test de getAllCombinaisons', () => {
    const allCombinaisons = getAllCombinaisons(leafs);
    it('Doit avoir pour chaque somme(chaque branche somme(voisin * (voisinsDuVoisins-1)) combinaisons', () => {
        let expectedCount = 0;
        for(const leaf of leafs){
            for(const neighbor of leaf.neighbors){
                expectedCount += neighbor.neighbors.length -1;
            }
        }
        expect(allCombinaisons.length, 'Somme attendue: '+expectedCount).toEqual(expectedCount);
    })
    it('Aucune combinaison ne doit avoir deux fous la même feuille', () => {
        allCombinaisons.forEach((combinaison) => {
            const singletons = combinaison.reduce((acc: Leaf[], value: Leaf)=> {
                if(!acc.includes(value)){
                    acc.push(value);
                }
                return acc;
            }, []);
            expect(singletons.length).toEqual(combinaison.length);
        })
    })
    it('Toutes les combinaisons sont de taille 3', () => {
        let allCombinaisons = getAllCombinaisons(leafs);
        allCombinaisons.forEach((combinaison) => {
            expect(combinaison.length).toEqual(3);
        })
    })
})

describe('Test buildGrid', () => {
    const numbers = buildGrid(19);
    it('Tous les nombres sont compris entre 0 et 9', () => {
        expect(numbers.filter((n) => n<0 || n> 9)).toEqual([]);
    })
    it('Bonne taille', () => {
        expect(numbers.length).toEqual(19);
    })
});

describe('Test getDifferentsObjectivesNumbers', () => {
    const numbers = buildGrid(19);
    const allCombinaisons = getAllCombinaisons(leafs);
    const objectivesNumbers = getDifferentsObjectivesNumbers(allCombinaisons, leafs, numbers);
    it('Valeurs entre 0 et 27', () => { //Somme max de 3 nombres entre 0 et 9
        expect(objectivesNumbers.keys().filter((number: number) => number <0 || number >27).toArray().length).toEqual(0);
    })
    it('Liste non vide de résultat', () => {
        expect(objectivesNumbers.keys().toArray().length > 0 ).toEqual(true);
    })
    it('Chaque clef a au moins une combinaison', () => {
        expect(objectivesNumbers.values().filter((combinaisons:Leaf[][]) => combinaisons.length === 0).toArray().length).toEqual(0);
    })
    it('Chaque combinaison a une longueur de 3', () => {
        expect(objectivesNumbers.values().toArray().flat().filter((combinaison: Leaf[]) => combinaison.length != 3).length).toEqual(0);
    })
    it('Chaque combinaison fait partie de la liste des combinaisons possible', () => {
        expect(objectivesNumbers.values().toArray().flat().filter((combinaison: Leaf[]) => !allCombinaisons.includes(combinaison)).length).toEqual(0);
    })
    it('Pour chaque valeur clef la somme de chaque combinaison est égale à la valeur de la clef', () => {
        expect(objectivesNumbers.entries().toArray()
            .map((key: number, combinaisons: Leaf[][]) =>{ 
                // On transforme les combinaisons pour ne garder que celles dont la somme de chaque combinaison est différente de la valeur de la clef
                //FIXME pq combinaisons.filter is not a function???
                return {key, 'wrongCombinaisons' : combinaisons.filter((combinaison: Leaf[]) => 
                    combinaison.map((leaf) => {
                        const index = leafs.indexOf(leaf);
                        return numbers[index];
                    }).reduce((acc: number, value: number)=> acc+value, 0) != key
                )}
            })
            .filter((key: number, wrongCombinaison: Leaf[][]) => wrongCombinaison.length > 0).length)
        .toEqual(0);
    })
});

describe('Test electObjectiveNumber', () => {
    const numbers = buildGrid(19);
    it('')
});

