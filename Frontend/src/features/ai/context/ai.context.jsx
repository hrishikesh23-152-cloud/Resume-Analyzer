import { useState } from "react";
import { AiContext } from "./ai.context.value.js";

export const AiProvider = ({ children }) => {
    const [loading, setLoading] = useState(false)
    const [generating, setGenerating] = useState(false)
    const [report, setReport] = useState(null)
    const [reports, setReports] = useState([])
    const [usage, setUsage] = useState(null)

    return (
        <AiContext.Provider value={{
            loading, setLoading, generating, setGenerating,
            report, setReport, reports, setReports, usage, setUsage
        }}>
            {children}
        </AiContext.Provider>
    )
}