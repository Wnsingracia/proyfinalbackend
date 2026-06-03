import React, { useState, useEffect } from 'react';
import api from '../../api/api';// Tu instancia centralizada de Axios

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
        // Si el class-validator devuelve un array de mensajes o un string directo
        const mensajeError = Array.isArray(err.response.data.message)
          ? err.response.data.message[0]
          : err.response.data.message;
        
        setError(mensajeError || 'Credenciales incorrectas');
      } else {
        setError('No hay conexión con el servidor backend');
      }
      
      // Refrescamos campos críticos por seguridad
      generarCaptcha();
      setCaptchaInput('');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-md p-6 bg-[#0f0e15] rounded-2xl border border-slate-800/80 shadow-xl">
      <h2 className="text-2xl font-bold text-white text-center mb-6">Iniciar Sesión</h2>
      
      {error && (
        <div className="p-3 mb-4 text-sm text-red-400 bg-red-950/30 border border-red-900/50 rounded-xl">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Input Email */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Correo Electrónico</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-xl bg-[#161520] border border-slate-800 text-white text-sm focus:outline-none focus:border-[#c2185b]"
            placeholder="ejemplo@ryztor.com"
            required
          />
        </div>

        {/* Input Password */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-xl bg-[#161520] border border-slate-800 text-white text-sm focus:outline-none focus:border-[#c2185b]"
            placeholder="••••••••"
            required
          />
        </div>

        {/* Bloque CAPTCHA Visual */}
        <div className="p-3 rounded-xl bg-[#161520] border border-slate-800 flex items-center justify-between">
          <span className="text-lg font-mono font-bold tracking-widest text-[#c2185b] select-none line-through decoration-slate-600">
            {captchaText}
          </span>
          <button
            type="button"
            onClick={generarCaptcha}
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            Refrescar
          </button>
        </div>

        {/* Input CAPTCHA */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Código de Seguridad</label>
          <input
            type="text"
            value={captchaInput}
            onChange={(e) => setCaptchaInput(e.target.value)}
            className="w-full p-3 rounded-xl bg-[#161520] border border-slate-800 text-white text-sm font-mono uppercase tracking-wider focus:outline-none focus:border-[#c2185b]"
            placeholder="Introduce el código"
            required
          />
        </div>

        {/* Botón de Envío */}
        <button
          type="submit"
          disabled={cargando}
          className="w-full p-3 mt-2 rounded-xl bg-[#c2185b] text-white font-bold text-sm hover:bg-[#a0134c] transition-colors disabled:opacity-50"
        >
          {cargando ? 'Validando...' : 'Ingresar al Sistema'}
        </button>
      </form>
    </div>
  );
};