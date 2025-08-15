export class Buscaminas {
  constructor(filas, columnas, minas, callbacks = {}) {
    this.filas = filas;
    this.columnas = columnas;
    this.minas = minas;
    this.tablero = [];
    this.tiempo = 0;
    this.timer = null;
    this.timerIniciado = false;
    this.minasMarcadas = 0;
    this.celdasDescubiertas = 0;
    this.celdasSinMina = this.filas * this.columnas - this.minas;

    this.onMarcar = callbacks.onMarcar || (() => {});
    this.onMostrar = callbacks.onMostrar || (() => {});
    this.onBomba = callbacks.onBomba || (() => {});
    this.onGameOver = callbacks.onGameOver || (() => {});
    this.onVictoria = callbacks.onVictoria || (() => {});
    this.onTimer = callbacks.onTimer || (() => {});
    this.onMinas = callbacks.onMinas || (() => {});

    this.init();
  }

  init() {
    this.inicializarTablero();
    this.colocarMinas();
    this.calcularMinasAlrededor();
  }

  inicializarTablero() {
    this.tablero = Array.from({ length: this.filas }, () =>
      Array.from({ length: this.columnas }, () => ({
        minasAlrededor: 0,
        tieneMina: false,
        descubierta: false,
        marcadoBandera: false,
        marcadoPregunta: false,
      }))
    );
  }

  iniciarTimer() {
    clearInterval(this.timer);
    this.tiempo = 0;
    this.timer = setInterval(() => {
      this.tiempo++;
      this.onTimer(this.tiempo);
    }, 1000);
  }

  colocarMinas() {
    let minasColocadas = 0;
    while (minasColocadas < this.minas) {
      let fila = Math.floor(Math.random() * this.filas);
      let columna = Math.floor(Math.random() * this.columnas);
      if (!this.tablero[fila][columna].tieneMina && !(fila == 0 && columna == 0)) {
        this.tablero[fila][columna].tieneMina = true;
        minasColocadas++;
      }
    }
  }

  calcularMinasAlrededor() {
    let contador = 0;
    const direcciones = [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, -1],
      [0, 1],
      [1, -1],
      [1, 0],
      [1, 1],
    ];

    for (let i = 0; i < this.filas; i++) {
      for (let j = 0; j < this.columnas; j++) {
        if (!this.tablero[i][j].tieneMina) {
          contador = 0;
          for (let [dx, dy] of direcciones) {
            const fila = i + dx;
            const columna = j + dy;
            if (fila >= 0 && fila < this.filas && columna >= 0 && columna < this.columnas && this.tablero[fila][columna].tieneMina) {
              contador++;
            }
          }
          this.tablero[i][j].minasAlrededor = contador;
        }
      }
    }
  }

  descubrir(e) {
    let casilla = e.currentTarget;
    let fila = parseInt(casilla.dataset.fila);
    let columna = parseInt(casilla.dataset.columna);

    if (!this.timerIniciado) {
      // Iniciar Timer
      this.iniciarTimer();
      this.timerIniciado = true;

      // Si tiene mina, la reubico para no perder en el 1er intento
      const celda = this.tablero[fila][columna];
      if (celda.tieneMina) {
        this.reubicarMina(fila, columna);
      }
    }

    const celda = this.tablero[fila][columna];
    if (!celda.descubierta) {
      if (celda.tieneMina) {
        this.gameOver(fila, columna);
      } else if (celda.minasAlrededor == 0) {
        this.descubrirRecursivo(fila, columna);
      } else {
        celda.descubierta = true;
        this.celdasDescubiertas++;
        this.onMostrar(fila, columna, celda.minasAlrededor);
      }
      this.checkVictoria();
    }
  }

  descubrirRecursivo(fila, columna) {
    const celda = this.tablero[fila][columna];
    if (celda.descubierta || celda.tieneMina) {
      return;
    }
    // Descubrir celda actual
    celda.descubierta = true;
    this.celdasDescubiertas++;
    // this.mostrarCelda(fila, columna, celda.minasAlrededor);
    this.onMostrar(fila, columna, celda.minasAlrededor);

    // Si es número, salir
    if (celda.minasAlrededor > 0) return;

    // Recorro alrededor
    const direcciones = [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, -1],
      [0, 1],
      [1, -1],
      [1, 0],
      [1, 1],
    ];
    for (let [dx, dy] of direcciones) {
      const i = fila + dx;
      const j = columna + dy;
      if (i >= 0 && i < this.filas && j >= 0 && j < this.columnas) this.descubrirRecursivo(i, j);
    }
  }

  reubicarMina(fila, columna) {
    let minaReubicada = false;
    let intentos = 0;
    while (!minaReubicada && intentos < 100) {
      let nuevaFila = Math.floor(Math.random() * this.filas);
      let nuevaColumna = Math.floor(Math.random() * this.columnas);
      if (!this.tablero[nuevaFila][nuevaColumna].tieneMina && !(nuevaFila == fila && nuevaColumna == columna)) {
        this.tablero[nuevaFila][nuevaColumna].tieneMina = true;
        minaReubicada = true;
      }
      intentos++;
    }
    // Recalcular las minas alrededor de las celdas luego de reubicar la mina
    if (minaReubicada) {
      this.tablero[fila][columna].tieneMina = false;
      this.calcularMinasAlrededor();
    }
  }

  marcar(e) {
    e.preventDefault();

    let casilla = e.currentTarget;
    let fila = parseInt(casilla.dataset.fila);
    let columna = parseInt(casilla.dataset.columna);

    const celda = this.tablero[fila][columna];

    if (!celda.descubierta) {
      if (celda.marcadoBandera) {
        celda.marcadoBandera = false;
        celda.marcadoPregunta = true;
        this.minasMarcadas--;
        this.marcarCelda(fila, columna, "pregunta");
      } else if (celda.marcadoPregunta) {
        celda.marcadoPregunta = false;
        this.limpiarCelda(fila, columna, "");
      } else {
        celda.marcadoBandera = true;
        this.minasMarcadas++;
        this.marcarCelda(fila, columna, "bandera");
      }
    }
  }

  marcarCelda(fila, columna, tipo) {
    const minasPendientes = this.minas - this.minasMarcadas;
    this.onMarcar(fila, columna, tipo);
    this.onMinas(minasPendientes);
  }

  limpiarCelda(fila, columna) {
    this.onMarcar(fila, columna, "");
  }

  checkVictoria() {
    if (this.celdasDescubiertas == this.celdasSinMina) {
      clearInterval(this.timer);
      this.onVictoria();
    }
  }

  gameOver(fila, columna) {
    clearInterval(this.timer);
    this.mostrarMinas(true);
    this.onGameOver(fila, columna);
  }

  mostrarMinas() {
    for (let i = 0; i < this.filas; i++) {
      for (let j = 0; j < this.columnas; j++) {
        if (this.tablero[i][j].tieneMina) this.onBomba(i, j);
      }
    }
  }

  reset() {
    this.limpiar();
    this.init();
  }

  limpiar() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this.tiempo = 0;
    this.timerIniciado = false;
    this.minasMarcadas = 0;
    this.celdasDescubiertas = 0;
    this.tablero = [];
    this.onTimer(0);
    this.onMinas();
  }
}
