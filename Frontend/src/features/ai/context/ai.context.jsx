import { createContext,useState } from "react";


export const AiContext = createContext()

export const AiProvider = ({ children }) => {
    const [loading, setLoading] = useState(false)
    const [report, setReport] = useState(null)
    const [reports, setReports] = useState([])

    return (
        <AiContext.Provider value={{ loading, setLoading, report, setReport, reports, setReports }}>
            {children}
        </AiContext.Provider>
    )
}