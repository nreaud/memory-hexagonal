import { initRawLeafs, initLeafsRelations, Leaf, getAllCombinaisons, buildGrid, getDifferentsObjectivesNumbers, electObjectiveNumber } from '../utils';

const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S'];
let leafs = new Array(19);
initRawLeafs(leafs, letters);
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
    it("Aucune combinaison ne doit être une permutation d'une autre", () => {
        expect(allCombinaisons.filter((combinaison) => {
            return allCombinaisons.some((combinaison2) => {
                return ( // combinaison != combinaison2
                    combinaison[0] != combinaison2[0] ||
                    combinaison[1] != combinaison2[1] ||
                    combinaison[2] != combinaison2[2]
                ) && //Permutation
                combinaison2.includes(combinaison[0]) && 
                combinaison2.includes(combinaison[1]) && 
                combinaison2.includes(combinaison[2]);
            })
        }).length).toEqual(0);
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
    it('Pour chaque valeur clef, la somme de chaque combinaison est égale à la valeur de la clef', () => {
        expect(objectivesNumbers.entries().toArray()
            .map((item) => {
                // item[0] == key, item[1] == combinaisons
                // On transforme les combinaisons pour ne garder que celles dont la somme de chaque combinaison est différente de la valeur de la clef
                const wrongCombinaisons = item[1].filter((combinaison: Leaf[]) =>
                    {
                        return combinaison.map((leaf) => {
                            const index = leafs.indexOf(leaf);
                            return numbers[index];
                        }).reduce((acc: number, value: number)=> acc+value, 0) != item[0]
                    }
                );
                return {'key': item[0], wrongCombinaisons }
            }).filter((item) => item.wrongCombinaisons.length > 0).length)
            .toEqual(0);
    })
    it('Chaque clef est différente', () => {
        expect(objectivesNumbers.keys().reduce((acc, value) => {
            if (!acc.includes(value)) {
                acc.push(value);
            }
            return acc;
        }, []).length).toEqual(objectivesNumbers.keys().toArray().length);
    })
});

describe('Test electObjectiveNumber', () => {
    const numbers = buildGrid(19);
    const allCombinaisons = getAllCombinaisons(leafs);
    const objectivesNumbers = getDifferentsObjectivesNumbers(allCombinaisons, leafs, numbers);
    const objectiveNumber = electObjectiveNumber(objectivesNumbers);
    it('Valeur entre 0 et 27', () => { // Max de la somme de 3 chiffres
        expect(objectiveNumber >= 0 && objectiveNumber <= 27, "Objective Number: "+objectiveNumber).toEqual(true);
    })
    it('La valeur fait partie de objectivesNumbers', () => {
        expect(objectivesNumbers.keys().filter(key => key === objectiveNumber).toArray().length).toEqual(1);
    })
});

