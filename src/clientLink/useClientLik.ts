import { useEffect } from "react";

export const isClientView = () : boolean =>{
    return window.location.pathname.startsWith("/v/");
};

export const extractClientSlug = (): string =>{
    const match = window.location.pathname.match(/^\/v\/(.+)$/);
    return match ? match[1] : "";
};

export const useClientView = (
    setSiteParam: (param: string) => void,
    setViewMode: (mode: "admin" | "presentation" | "draft") => void,
    setIsConfigMode: (isConfig: boolean) => void
) => {
    useEffect(()=>{
        const slug = extractClientSlug();

        if(slug){
            console.log('Modalità cliente attiva: ${slug}');

            setSiteParam(slug);
            setViewMode("draft");
            setIsConfigMode(false);
            sessionStorage.removeItem("admin_authenticated");
        }
    }, [setSiteParam, setIsConfigMode, setViewMode]);
}

