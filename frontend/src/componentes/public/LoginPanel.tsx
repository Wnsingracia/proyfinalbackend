import React, { useState, useEffect } from 'react';
import api from '../../api/api'; // Tu instancia centralizada de Axios

interface LoginProps {
  alIngresar: (usuario: { id_usuario: number; nombre: string; rol: string }) => void;
}

export const LoginPanel: React.FC<LoginProps> = ({ alIngresar }) => {
  // Estados para el formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  
  // Estados para la lógica del CAPTCHA local/simulado
  const [captchaText, setCaptchaText] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  // Generador de CAPTCHA simple de texto para cumplir con el 'captchaToken'
  const generarCaptcha = () => {
    const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let resultado = '';
    for (let i = 0; i < 5; i++) {
      resultado += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    setCaptchaText(resultado);
  };

  useEffect(() => {
    generarCaptcha();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 1. Validación del CAPTCHA antes de desgastar la red
    if (captchaInput.toUpperCase() !== captchaText) {
      setError('El código CAPTCHA es incorrecto');
      generarCaptcha();
      setCaptchaInput('');
      return;
    }

    setCargando(true);

    try {
      // 2. Petición POST enviando los datos exactamente como los pide el LoginDto
      const respuesta = await api.post('/auth/login', {
        email,
        password,
        captchaToken: captchaInput // Mandamos el texto validado como token de sesión
      });

      // 3. Extraemos el usuario y el token JWT firmado por NestJS
      const { usuario, token } = respuesta.data;

      // 4. Guardamos el token en el localStorage para mantener la sesión activa
      localStorage.setItem('token_ryztor', token);
      localStorage.setItem('usuario_ryztor', JSON.stringify(usuario));

      // 5. Notificamos al componente padre (App.tsx) para dar paso a las pantallas móviles
      alIngresar(usuario);

    } catch (err: any) {
      // 6. Captura de errores devueltos por class-validator o NestJS
      if (err.response && err.response.data) {
        const mensajeError = Array.isArray(err.response.data.message)
          ? err.response.data.message[0]
          : err.response.data.message;
        
        setError(mensajeError || 'Credenciales incorrectas');
      } else {
        setError('No hay conexión con el servidor backend');
      }
      
      generarCaptcha();
      setCaptchaInput('');
    } finally {
      setCargando(false);
    }
  };

  return (
    /* 🛠️ CAMBIOS EXPLICADOS PARA MÓVILES RESPONSIVO:
      - 'w-[92%]' o 'w-full': Evita que en pantallas chicas choque contra los bordes físicos del celular.
      - 'sm:max-w-md': En computadoras de escritorio se frena elegantemente en el tamaño original (448px).
      - 'p-5 sm:p-7': Padding interno más compacto en celulares para aprovechar el espacio de pantalla.
    */
    <div className="w-[92%] sm:w-full sm:max-w-md p-5 sm:p-7 bg-[#0f0e15] rounded-3xl border border-slate-800/80 shadow-2xl animate-fadeIn mx-auto">
      <h2 className="text-xl sm:text-2xl font-black text-white text-center mb-6 tracking-wide">
        Iniciar Sesión
      </h2>
      
      {error && (
        <div className="p-3 mb-4 text-xs sm:text-sm text-red-400 bg-red-950/20 border border-red-900/40 rounded-xl animate-shake">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Input Email */}
        <div className="space-y-1">
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Correo Electrónico</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3.5 rounded-xl bg-[#161520] border border-slate-800 text-white text-sm focus:outline-none focus:border-[#c2185b] focus:bg-[#1c1a29] transition-all placeholder:text-slate-600"
            placeholder="ejemplo@ryztor.com"
            required
          />
        </div>

        {/* Input Password */}
        <div className="space-y-1">
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3.5 rounded-xl bg-[#161520] border border-slate-800 text-white text-sm focus:outline-none focus:border-[#c2185b] focus:bg-[#1c1a29] transition-all placeholder:text-slate-600"
            placeholder="••••••••"
            required
          />
        </div>

        {/* Bloque CAPTCHA Visual */}
        <div className="space-y-1">
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Verificación de Seguridad</label>
          <div className="p-3 rounded-xl bg-[#161520] border border-slate-800 flex items-center justify-between">
            <span className="text-xl font-mono font-black tracking-widest text-[#c2185b] select-none line-through decoration-slate-600/60">
              {captchaText}
            </span>
            <button
              type="button"
              onClick={generarCaptcha}
              className="text-[11px] font-bold bg-slate-800/50 px-2.5 py-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Refrescar
            </button>
          </div>
        </div>

        {/* Input CAPTCHA */}
        <div className="space-y-1">
          <input
            type="text"
            value={captchaInput}
            onChange={(e) => setCaptchaInput(e.target.value)}
            className="w-full p-3.5 rounded-xl bg-[#161520] border border-slate-800 text-white text-sm font-mono uppercase tracking-wider focus:outline-none focus:border-[#c2185b] focus:bg-[#1c1a29] transition-all placeholder:text-slate-600 text-center"
            placeholder="Introduce el código CAPTCHA"
            required
          />
        </div>

        {/* Botón de Envío */}
        <button
          type="submit"
          disabled={cargando}
          className="w-full p-3.5 mt-3 rounded-xl bg-[#c2185b] hover:bg-[#a0134c] text-white font-black text-xs sm:text-sm uppercase tracking-wider transition-colors shadow-lg shadow-[#c2185b]/10 disabled:opacity-50 select-none"
        >
          {cargando ? 'Validando Credenciales...' : 'Ingresar al Sistema'}
        </button>
      </form>
    </div>
  );
};