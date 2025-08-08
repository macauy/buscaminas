class Buscaminas {
  constructor(filas, columnas, minas) {
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
    this.handleClick = this.handleClick.bind(this);
    this.handleContextMenu = this.handleContextMenu.bind(this);
    this.iniciar();
  }

  iniciar() {
    this.inicializarTablero();
    this.colocarMinas();
    this.calcularMinasAlrededor();
    this.crearTableroDOM();
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
    this.tiempo = 0;
    this.timer = setInterval(() => {
      this.tiempo++;
      document.getElementById("tiempo").innerText = String(this.tiempo).padStart(3, "0");
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
        // let celda = document.getElementById(`f${fila}_c${columna}`);
        // celda.classList.add("mina");
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
    // iniciar Timer
    if (!this.timerIniciado) {
      this.iniciarTimer();
      this.timerIniciado = true;
    }

    let casilla = e.currentTarget;
    let fila = parseInt(casilla.dataset.fila);
    let columna = parseInt(casilla.dataset.columna);
    const celda = this.tablero[fila][columna];
    if (!celda.descubierta) {
      if (celda.tieneMina) {
        this.gameOver(fila, columna);
      } else if (celda.minasAlrededor == 0) this.descubrirRecursivo(fila, columna);
      else {
        celda.descubierta = true;
        this.celdasDescubiertas++;
        this.mostrarCelda(fila, columna, celda.minasAlrededor);
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
    this.mostrarCelda(fila, columna, celda.minasAlrededor);

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

  marcar(e) {
    e.preventDefault();

    let casilla = e.currentTarget;
    let fila = casilla.dataset.fila;
    let columna = casilla.dataset.columna;

    const celda = this.tablero[fila][columna];

    if (!celda.descubierta) {
      if (celda.marcadoBandera) {
        celda.marcadoBandera = false;
        celda.marcadoPregunta = true;
        this.minasMarcadas--;
        this.marcarCeldaPregunta(fila, columna);
      } else if (celda.marcadoPregunta) {
        celda.marcadoPregunta = false;
        this.limpiarCelda(fila, columna);
      } else {
        celda.marcadoBandera = true;
        this.minasMarcadas++;
        this.marcarCeldaBandera(fila, columna);
      }
    }
  }

  checkVictoria() {
    if (this.celdasDescubiertas == this.celdasSinMina) {
      clearInterval(this.timer);
      const resetButton = document.getElementById("reset");
      resetButton.textContent = "😎";
      this.bloquearTablero(false);
      const mensajeEl = document.getElementById("mensaje");
      mensajeEl.classList.remove("hidden");
    }
  }

  gameOver(fila, columna) {
    clearInterval(this.timer);
    const bomba = document.getElementById(`f${fila}_c${columna}`);
    bomba.classList.add("bomba-descubierta");
    const resetButton = document.getElementById("reset");
    resetButton.textContent = "😵";
    this.bloquearTablero(true);
  }

  bloquearTablero(gameOver) {
    for (let i = 0; i < this.filas; i++) {
      for (let j = 0; j < this.columnas; j++) {
        if (gameOver && this.tablero[i][j].tieneMina) this.mostrarBomba(i, j);
        const celda = document.getElementById(`f${i}_c${j}`);
        celda.removeEventListener("click", this.handleClick);
        celda.removeEventListener("contextmenu", this.handleContextMenu);
      }
    }
  }

  // DOM

  handleClick(e) {
    this.descubrir(e);
  }

  handleContextMenu(e) {
    e.preventDefault();
    this.marcar(e);
  }

  crearTableroDOM() {
    const tableroEl = document.getElementById("tablero");
    for (let i = 0; i < this.filas; i++) {
      for (let j = 0; j < this.columnas; j++) {
        const celdaEl = document.createElement("div");
        celdaEl.classList.add("celda");
        celdaEl.setAttribute("id", `f${i}_c${j}`);
        celdaEl.dataset.fila = i;
        celdaEl.dataset.columna = j;
        celdaEl.addEventListener("click", this.handleClick);
        celdaEl.addEventListener("contextmenu", this.handleContextMenu);
        tableroEl.appendChild(celdaEl);
      }
    }
    // Reset button
    const resetButton = document.getElementById("reset");
    resetButton.textContent = "🙂";
    document.getElementById("reset").addEventListener("click", () => this.reset());

    // Minas y tiempo
    document.getElementById("tiempo").innerText = "000";
    document.getElementById("minas").innerText = String(this.minas).padStart(3, "0");
  }

  reset() {
    clearInterval(this.timer);
    const tableroEl = document.getElementById("tablero");
    tableroEl.innerHTML = "";

    const mensajeEl = document.getElementById("mensaje");
    if (!mensajeEl.classList.contains("hidden")) mensajeEl.classList.add("hidden");

    this.tiempo = 0;
    this.timerIniciado = false;
    this.minasMarcadas = 0;
    this.celdasDescubiertas = 0;
    this.tablero = [];

    const nuevoJuego = new Buscaminas(this.filas, this.columnas, this.minas);
  }

  marcarCeldaBandera(fila, columna) {
    const celda = document.getElementById(`f${fila}_c${columna}`);
    celda.classList.add("bandera");
    const minasPendientes = this.minas - this.minasMarcadas;
    minasPendientes >= 0
      ? (document.getElementById("minas").innerText = String(minasPendientes).padStart(3, "0"))
      : (document.getElementById("minas").innerText = String(minasPendientes));
  }

  marcarCeldaPregunta(fila, columna) {
    const celda = document.getElementById(`f${fila}_c${columna}`);
    celda.classList.remove("bandera");
    celda.classList.add("pregunta");

    const minasPendientes = this.minas - this.minasMarcadas;
    minasPendientes >= 0
      ? (document.getElementById("minas").innerText = String(minasPendientes).padStart(3, "0"))
      : (document.getElementById("minas").innerText = String(minasPendientes));
  }
  limpiarCelda(fila, columna) {
    const celda = document.getElementById(`f${fila}_c${columna}`);
    celda.classList.remove("pregunta", "bandera");
  }
  mostrarBomba(fila, columna) {
    const celda = document.getElementById(`f${fila}_c${columna}`);
    celda.classList.remove("pregunta", "bandera");
    celda.classList.add("bomba");
  }

  mostrarCelda(fila, columna, numero) {
    const celdaEl = document.getElementById(`f${fila}_c${columna}`);
    celdaEl.innerText = numero > 0 ? numero : "";
    celdaEl.dataset.num = numero;
    celdaEl.classList.remove("pregunta", "bandera");
    celdaEl.classList.add("descubierta");
  }
}

// Inicio
const filas = 8;
const columnas = 8;
const minas = 10;
const buscaminas = new Buscaminas(filas, columnas, minas);
