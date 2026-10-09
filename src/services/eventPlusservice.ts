import { axiosInstance } from "./api"
import type {Evento} from "../types/api"

export const eventoService ={
    async listar(){
        const { data } = await axiosInstance.get<Evento[]>("Evento")
        return data;
    },

    async listarProximos(){
        const { data } = await axiosInstance.get<Evento[]>("Eventos/proximos");
        return data;
    },

    async buscar(id: string){
        const { data } = await axiosInstance.get<Evento>(`Evento/${id}`);
        return data;
    }
}