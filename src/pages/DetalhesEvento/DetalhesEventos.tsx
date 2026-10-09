import {Link, useParams} from "react-router-dom"
import "./DetalhesEventos.css"
import Header from "../../components/header/Header"
import Footer from "../../components/footer/Footer"

function DetalhesEventos(){
    const {id = ""} = useParams();
    
    return(
        <>
        <Header/>
        <main>
            <Link to="/eventos">Voltar aos eventos</Link>
            <h1>Detalhes do evento</h1>
            <p>ID recebido: {id}</p>
        </main>
        <Footer/>
        </>
    )
}

export default DetalhesEventos