import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

//IMPORTANDO O BOOTSTRAP

import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap/dist/js/bootstrap.bundle.min.js"

//IMPORTANTO A FONTE
import "@fontsource/poppins/latin-400.css"
import "@fontsource/poppins/latin-500.css"
import "@fontsource/poppins/latin-600.css"
import "@fontsource/poppins/latin-700.css"

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App /> 
    {/* ESSE APP É O COMPONENTE RENDENIZADO, ENTÃO SE DUPLICAR O ITEM CONTIFO NO APP.TSX IRÁ DUPLICAR */}
  </StrictMode>,
)
