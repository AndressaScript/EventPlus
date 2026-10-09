
import "./CardEvento.css";
import { Link } from "react-router-dom";
import { useState } from "react";
import imagemPadrao from "../../assets/banner-3.png";

interface CardEventoProps {
    id: string;
    imagem?: string | null;
    categoria?: string;
    titulo: string;
    descricao: string;
}

function CardEvento({
    id,
    imagem,
    categoria,
    titulo,
    descricao
}: CardEventoProps) {
    const [imagemAtual, setImagemAtual] = useState(imagem || imagemPadrao);

    return (
        <article className="home-evento-card">
            <img
                src={imagemAtual}
                alt={`Imagem do evento ${titulo}`}
                onError={() => setImagemAtual(imagemPadrao)}
            />

            <span>{categoria || "Evento"}</span>

            <div className="home-evento-card-info">
                <h3>{titulo}</h3>
                <p>{descricao}</p>
                <Link to={`/eventos/${id}`}>Ver evento</Link>
            </div>
        </article>
    );
}

export default CardEvento;
