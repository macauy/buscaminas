import { Buscaminas } from "./Buscaminas.js";

export class VistaBuscaminas {
  constructor(filas, columnas, minas, tamanio) {
    this.filas = filas;
    this.columnas = columnas;
    this.tamanio = tamanio;
    this.gameOver = false;
    this.juego = new Buscaminas(filas, columnas, minas, {
      onMostrar: (fila, columna, numero) => this.mostrarCelda(fila, columna, numero),
      onMarcar: (fila, columna, estado) => this.marcarCelda(fila, columna, estado),
      onBomba: (fila, columna) => this.mostrarBomba(fila, columna),
      onGameOver: (fila, columna) => this.onGameOver(fila, columna),
      onVictoria: (fila, columna) => this.onVictoria(fila, columna),
      onTimer: (tiempo) => this.onTimer(tiempo),
      onMinas: (minas) => this.actualizarMinas(minas),
    });
    this.tablero = document.getElementById("tablero");
    this.init();
  }

  init() {
    this.gameOver = false;
    this.crearTablero();
    this.agregarEventos();
    this.resetUI();
  }

  crearTablero() {
    this.tablero.innerHTML = "";
    this.tablero.classList = "tablero";
    this.tablero.classList.add(`tablero-${this.tamanio}`);

    for (let i = 0; i < this.juego.filas; i++) {
      for (let j = 0; j < this.juego.columnas; j++) {
        const celdaEl = document.createElement("div");
        celdaEl.classList.add("celda");
        celdaEl.setAttribute("id", `f${i}_c${j}`);
        celdaEl.dataset.fila = i;
        celdaEl.dataset.columna = j;
        this.tablero.appendChild(celdaEl);
      }
    }
  }

  agregarEventos() {
    // Clicks
    this.tablero.addEventListener("click", (e) => {
      if (this.gameOver) return;
      const celda = e.target.closest(".celda");
      if (!celda) return;
      this.juego.descubrir({ currentTarget: celda });
    });

    this.tablero.addEventListener("contextmenu", (e) => {
      if (this.gameOver) return;
      const celda = e.target.closest(".celda");
      if (!celda) return;
      this.juego.marcar({ currentTarget: celda, preventDefault: () => e.preventDefault() });
    });

    // Reset button
    const resetButton = document.getElementById("reset");
    resetButton.textContent = "🙂";
    document.getElementById("reset").addEventListener("click", () => this.reset());
  }

  resetUI() {
    // Minas y timer
    document.getElementById("tiempo").innerText = "000";
    document.getElementById("minas").innerText = String(this.juego.minas).padStart(3, "0");
    // Mensaje oculto
    const mensajeEl = document.getElementById("mensaje");
    if (!mensajeEl.classList.contains("hidden")) mensajeEl.classList.add("hidden");
  }

  actualizarMinas(minasPendientes) {
    minasPendientes >= 0
      ? (document.getElementById("minas").innerText = String(minasPendientes).padStart(3, "0"))
      : (document.getElementById("minas").innerText = String(minasPendientes));
  }

  marcarCelda(fila, columna, estado) {
    const celda = document.getElementById(`f${fila}_c${columna}`);
    celda.classList.remove("bandera", "pregunta");
    if (estado === "bandera") celda.classList.add("bandera");
    if (estado === "pregunta") celda.classList.add("pregunta");
  }

  mostrarCelda(fila, columna, numero) {
    const celdaEl = document.getElementById(`f${fila}_c${columna}`);
    celdaEl.classList.remove("pregunta", "bandera");
    celdaEl.classList.add("descubierta");
    celdaEl.textContent = numero > 0 ? numero : "";
    celdaEl.dataset.num = numero;
  }

  mostrarBomba(fila, columna) {
    const celda = document.getElementById(`f${fila}_c${columna}`);
    celda.classList.remove("pregunta", "bandera");
    celda.classList.add("bomba");
  }

  onTimer(tiempo) {
    document.getElementById("tiempo").innerText = String(tiempo).padStart(3, "0");
  }

  onVictoria() {
    const resetButton = document.getElementById("reset");
    resetButton.textContent = "😎";
    const mensajeEl = document.getElementById("mensaje");
    mensajeEl.classList.remove("hidden");
    this.gameOver = true;
  }

  onGameOver(fila, columna) {
    const bomba = document.getElementById(`f${fila}_c${columna}`);
    bomba.classList.add("bomba-descubierta");
    const resetButton = document.getElementById("reset");
    resetButton.textContent = "😵";
    this.gameOver = true;
  }

  // Boton de reset
  reset() {
    this.juego.reset();
    this.init();
  }

  // Nuevo tamaño de juego
  destruir() {
    this.juego.limpiar();
    this.juego = null;
    this.gameOver = false;

    const nuevoTablero = this.tablero.cloneNode(false);
    this.tablero.replaceWith(nuevoTablero);
    this.tablero = nuevoTablero;

    const resetButton = document.getElementById("reset");
    resetButton.replaceWith(resetButton.cloneNode(true));
  }
}
