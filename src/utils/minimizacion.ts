import { SlowBuffer } from "buffer";
import { Automata } from "../types/automata";
import { Nodo } from "../types/automata";

export function minimizarAFD(afd: Automata): Automata {
  let nodos = obtenerNodos(afd);
  let alfabeto = Array.from(afd.alfabeto);
  let subGrupos = obtenerSubgrupos(afd);
  console.log("Subgrupos",subGrupos);
  let cambios = true;
  while (cambios) {
    cambios = false;
    for (let i = 0; i < subGrupos.length; i++) {
      let subGrupo = Array.from(subGrupos[i]);
      for (let caracter of alfabeto) {
        let primerSubGrupo = getSubGrupo(
          subGrupos,
          subGrupo[0].adyacentes[caracter]?.[0]
        );
        for (let nodo of subGrupo) {
          if (
            primerSubGrupo !==
            getSubGrupo(subGrupos, nodo.adyacentes[caracter]?.[0])
          ) {
            cambios = true;
            let conjunto1 = new Set<Nodo>();
            let conjunto2 = new Set<Nodo>();
            for (let elem of subGrupo) {
              if (
                getSubGrupo(subGrupos, elem.adyacentes[caracter]?.[0]) ===
                primerSubGrupo
              ) {
                conjunto1.add(elem);
              } else {
                conjunto2.add(elem);
              }
            }
            subGrupos[i] = conjunto1;
            subGrupos.push(conjunto2);
            break;
          }
        }
      }
    }
  }
  //Marca iniciales y finales
  let nuevosNodos: Nodo[] = [];
  let inicio: Nodo = new Nodo("X");
  for (let subGrupo of subGrupos) {
    let nodo = new Nodo(String(nuevosNodos.length), false);
    if (subGrupo.has(afd.inicio)) {
      inicio = nodo;
    }
    for (let estado of Array.from(subGrupo)) {
      if (estado.esAceptacion){
          nodo.setAceptacion(true,estado.clase)
      }
    }
    nuevosNodos.push(nodo);
  }
  //Crea el MinAFD y carga las aristas
  let minAFD = new Automata(inicio);
  minAFD.alfabeto = afd.alfabeto;
  for (let i = 0; i < nuevosNodos.length; i++) {
    let subGrupo = Array.from(subGrupos[i]);
    let nodo = nuevosNodos[i];
    alfabeto.forEach((caracter) => {
      let index = getSubGrupoIndex(
        subGrupos,
        subGrupo[0].adyacentes[caracter]?.[0]
      );
      if(index !== -1)
        nodo.agregarArista(nuevosNodos[index], caracter);
    });
  }
  console.log(minAFD);
  return minAFD;
}
function getSubGrupoIndex(subGrupos: Set<Nodo>[], nodo: Nodo) {
  if (nodo === undefined) {
  } else {
    for (let i = 0; i < subGrupos.length; i++) {
      if (subGrupos[i].has(nodo)) {
        return i;
      }
    }
  }
  return -1;
}
function getSubGrupo(subGrupos: Set<Nodo>[], nodo: Nodo) {
  if (nodo === undefined) {
  } else {
    for (let subGrupo of subGrupos) {
      if (subGrupo.has(nodo)) {
        return subGrupo;
      }
    }
  }
  return undefined;
}
function obtenerSubgrupos(afd: Automata): Set<Nodo>[]{
    let nodos = Array.from(obtenerNodos(afd));
    let subGrupos : Set<Nodo>[] = [];
    let noFinales: Set<Nodo> = new Set<Nodo> ()
    for(let nodo of nodos){
        if(!nodo.esAceptacion){
            noFinales.add(nodo);
        }
    }
    if (noFinales.size > 0) {
        subGrupos.push(noFinales);
    }
    for(let nodo of nodos){
        if(nodo.esAceptacion){
            let agregado = false;
            for(let subGrupo of subGrupos){
                let conjuntoLista = Array.from(subGrupo);
                
                if(conjuntoLista[0].esAceptacion && conjuntoLista[0].clase === nodo.clase){
                    agregado = true
                    subGrupo.add(nodo);
                }
            }
            if(!agregado){
                let nuevoSubGrupo = new Set<Nodo>()
                nuevoSubGrupo.add(nodo)
                subGrupos.push(nuevoSubGrupo)
            }
        }
    }
    return subGrupos;
}
function obtenerNodos(afd: Automata): Set<Nodo> {
  const visitados: Set<Nodo> = new Set<Nodo>();
  const queue = [afd.inicio];
  const alfabeto = afd.alfabeto;
  while (queue.length) {
    const nodo = queue.pop();
    if (nodo && !visitados.has(nodo)) {
      visitados.add(nodo);
      alfabeto.forEach((caracter) => {
        let adyacentes = nodo.adyacentes[caracter] || [];
        for (let elem of adyacentes) {
          queue.push(elem);
        }
      });
    }
  }
  return visitados;
}
