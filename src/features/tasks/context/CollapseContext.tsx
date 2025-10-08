import { createContext, ReactNode, useContext, useMemo, useState } from "react";

type CollapseContextType = {
    isExpanded: boolean;
    toggleAll: () => void;
    setExpanded: (value: boolean) => void;
};

const CollapseContext = createContext<CollapseContextType | undefined>(undefined);

type CollapseProviderProps = {
    children: ReactNode;
};

export function CollapseProvider({ children }: CollapseProviderProps){
    const [isExpanded, setExpanded] = useState(false);

    const toggleAll = () => {
        setExpanded(prev => !prev);
    };

    const value = useMemo(
        () => ({isExpanded, toggleAll, setExpanded}), [isExpanded]
    );

    return (
        <CollapseContext.Provider value={value}>
            {children}
        </CollapseContext.Provider>
    );
}

export function useCollapse(){
    const ctx = useContext(CollapseContext);
    if(!ctx) {
        throw new Error("useCollapse must be used within a CollapseProvider");
    }
    return ctx;
}