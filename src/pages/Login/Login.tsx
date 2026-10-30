
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, type FormEvent } from "react";
import logoEvent from "../../assets/Camada_2-2.svg";
import "./Login.css";
import { useAuth } from "../../context/auth";
import { Botao } from "../../components/botao/Botao";
import Campo from "../../components/campo/Campo";

function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, autenticado } = useAuth();

    const [email, setEmail] = useState("juliana@gmail.com");
    const [senha, setSenha] = useState("juliana1234");
    const [erro, setErro] = useState("");
    const [enviando, setEnviando] = useState(false);

    useEffect(() => {
        if (autenticado) {
            navigate("/home", { replace: true });
        }
    }, [autenticado, navigate]);

    async function entrar(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setErro("");
        setEnviando(true);

        try {
            await login({
                email: email.trim(),
                senha
            });

            const state = location.state as { from?: string } | null;

            navigate(state?.from || "/home", { replace: true });
        } catch {
            setErro("Não foi possível entrar. Verifique seu email e sua senha.");
        } finally {
            setEnviando(false);
        }
    }

    return (
        <main>
            <img src={logoEvent} alt="EventPlus logo" />

            <form
                className="login-form"
                onSubmit={entrar}
                noValidate
            >
                <div>
                    <label htmlFor="login-email">Email</label>

                    <Campo
                        id="login-email"
                        name="email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="Digite seu email"
                        autoComplete="email"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="login-senha">Senha</label>

                    <Campo
                        id="login-senha"
                        name="senha"
                        type="password"
                        value={senha}
                        onChange={(event) => setSenha(event.target.value)}
                        placeholder="Digite sua senha"
                        autoComplete="current-password"
                        minLength={8}
                        required
                    />
                </div>

                {erro && (
                    <p className="login-erro" role="alert">
                        {erro}
                    </p>
                )}

                <Botao
                    texto={enviando ? "Entrando..." : "Entrar"}
                    type="submit"
                    disabled={enviando}
                />
            </form>
        </main>
    );
}

export default Login;
