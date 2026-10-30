import "./Eventos.css"
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import type { Evento } from "../../types/api";
import { useEffect, useState } from "react";
import { eventoService } from "../../services/eventPlusservice";
import CardEvento from "../../components/cardEvento/CardEvento";

function Eventos() {
    const [eventos, setEventos] = useState<Evento[]>([])

    useEffect(() => {
        async function carregar() {
            const dados = await eventoService.listar();
            setEventos(dados);
        }
        void carregar();
    }, []);


    return (
        <>
            <Header />
            <main>
                <div className="eventos-container">
                    <div className="eventos-titulo">
                        <h2>Catálogo de eventos</h2>
                        <hr />
                    </div>
                    <div className="eventos-grid">
                        {eventos.map((evento) => (
                            <CardEvento
                                key={evento.idEvento}
                                id={evento.idEvento}
                                titulo={evento.nome}
                                imagem={evento.imagemUrl ?? ""}
                                categoria={evento.idTipoEventoNavigation?.titulo ?? "Sem categoria"}
                                descricao={evento.descricao}
                            />
                        ))}
                    </div>
                </div>
            </main>
            <Footer />
        </>
    )
}

export default Eventos;
