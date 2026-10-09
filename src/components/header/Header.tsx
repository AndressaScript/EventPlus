import "./Header.css"
import logoEvent from '../../assets/Camada_2-2.svg'
import { Link, NavLink } from "react-router-dom"


function Header() {
    return (
        <header className="header">
            <div className="header-conteudo">
                <Link to="/home">
                    <img src={logoEvent} alt="Logo Event+" />
                </Link>
                <nav>
                    <NavLink to="/home">Home</NavLink>
                    <NavLink to="/eventos">Eventos</NavLink>
                    <NavLink to="/usuarios">Usuarios</NavLink>
                    <Link to="/home#contato">Contatos</Link>
                </nav>
                <Link to="/login">Entrar</Link>
            </div>
        </header>
    )
}

export default Header;