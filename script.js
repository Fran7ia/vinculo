// Letra original, en orden. La persona controla el avance con el botón OK.
const letras = [
    "Si...",
    "Acaba el mundo hoy",
    "Si no sale el sol...",
    "No importaría pues...",
    "Tu rostro puedo ver",
    "Tu risa es curativa",
    "De mi alma medicina",
    "Me haces compañía...",
    "Por telepatía",
    "Si no estamos",
    "De frente",
    "Te veo de reojo",
    "En mi meeeeente..."
];

// Personaliza este mensaje.
const dedicatoria =
    "Y si pudiera elegir otra vez, te elegiría a ti. ♡";

const VOLUMEN_INICIAL = 0.8;

const audio = document.getElementById("musica");
const btnIniciar = document.getElementById("btn-iniciar");
const estado = document.getElementById("estado");
const ventana = document.getElementById("ventana");
const tituloVentana = document.getElementById("titulo-ventana");
const textoLetra = document.getElementById("texto-letra");
const btnOk = document.getElementById("btn-ok");
const btnReiniciar = document.getElementById("btn-reiniciar");
const btnCerrar = document.getElementById("btn-cerrar");

// Única fuente de verdad para la letra.
let currentLyricIndex = 0;
let experienciaActiva = false;
let dedicatoriaMostrada = false;
let iniciando = false;

function mostrarEstado(mensaje) {
    estado.textContent = mensaje;
    estado.classList.toggle("oculto", !mensaje);
}

function pintarLetra() {
    textoLetra.classList.remove("dedicatoria");
    textoLetra.textContent = letras[currentLyricIndex];
    btnOk.disabled = currentLyricIndex >= letras.length - 1;
}

// Avanza exactamente una línea por clic. No toca el audio ni el GIF.
function avanzarLetra() {
    if (!experienciaActiva || dedicatoriaMostrada) {
        return;
    }

    if (currentLyricIndex >= letras.length - 1) {
        return;
    }

    currentLyricIndex += 1;
    pintarLetra();
}

function restablecerInterfaz() {
    currentLyricIndex = 0;
    dedicatoriaMostrada = false;

    tituloVentana.textContent = "vinculo";
    btnOk.classList.remove("oculto");
    btnReiniciar.classList.add("oculto");
    pintarLetra();
}

function volverAlInicio(mensaje) {
    experienciaActiva = false;

    audio.pause();
    try {
        audio.currentTime = 0;
    } catch (e) {
        /* sin metadatos todavía: no hay nada que rebobinar */
    }

    ventana.classList.add("oculto");
    restablecerInterfaz();

    btnIniciar.classList.remove("oculto");
    btnIniciar.textContent = "Empezar a escuchar ♡";
    mostrarEstado(mensaje || "");
}

function mensajeDeError() {
    if (audio.error) {
        if (audio.error.code === audio.error.MEDIA_ERR_SRC_NOT_SUPPORTED) {
            return "No se encontró o no se pudo leer assets/audio/vinculo.mp3. " +
                   "Si abriste el archivo con doble clic, usa un servidor local.";
        }
        return "Hubo un problema al cargar la canción. Intenta de nuevo.";
    }
    return "";
}

async function iniciarExperiencia() {
    if (iniciando) {
        return;
    }
    iniciando = true;
    btnIniciar.disabled = true;
    mostrarEstado("");

    try {
        audio.pause();
        audio.muted = false;
        audio.volume = VOLUMEN_INICIAL;
        audio.currentTime = 0;

        restablecerInterfaz();

        await audio.play();

        // Solo se muestra la ventana cuando el audio realmente empezó.
        experienciaActiva = true;
        btnIniciar.classList.add("oculto");
        ventana.classList.remove("oculto");
    } catch (error) {
        console.error("No se pudo reproducir el audio:", error);

        let mensaje = mensajeDeError();

        if (!mensaje) {
            if (error && error.name === "NotAllowedError") {
                mensaje = "El navegador bloqueó el sonido. Toca el botón otra vez.";
            } else if (error && error.name === "NotSupportedError") {
                mensaje = "No se encontró o no se pudo leer la canción (assets/audio/vinculo.mp3).";
            } else {
                mensaje = "No se pudo reproducir la canción. Intenta de nuevo.";
            }
        }

        volverAlInicio(mensaje);
        btnIniciar.textContent = "Intentar de nuevo ♡";
    } finally {
        iniciando = false;
        btnIniciar.disabled = false;
    }
}

function mostrarDedicatoria() {
    if (dedicatoriaMostrada || !experienciaActiva) {
        return;
    }
    dedicatoriaMostrada = true;

    tituloVentana.textContent = "un_mensaje_para_ti.txt";
    textoLetra.textContent = dedicatoria;

    // Reinicia la animación de entrada suave.
    textoLetra.classList.remove("dedicatoria");
    void textoLetra.offsetWidth;
    textoLetra.classList.add("dedicatoria");

    btnOk.classList.add("oculto");
    btnReiniciar.classList.remove("oculto");
}

// Cada botón tiene un único controlador.
btnIniciar.addEventListener("click", iniciarExperiencia);
btnOk.addEventListener("click", avanzarLetra);
btnReiniciar.addEventListener("click", iniciarExperiencia);
btnCerrar.addEventListener("click", () => volverAlInicio(""));

audio.addEventListener("ended", mostrarDedicatoria);

audio.addEventListener("error", () => {
    console.error("Error de audio. Revisa assets/audio/vinculo.mp3", audio.error);

    if (experienciaActiva) {
        volverAlInicio(mensajeDeError() || "La canción dejó de funcionar.");
    }
});

pintarLetra();