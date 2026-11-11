import { getAllInterviewReports, generateInterviewReport, getInterviewReportById } from "../services/ai.api"
import { useContext, useEffect, useEffectEvent } from "react"
import { useParams } from "react-router"
import {AiContext} from "../context/ai.context.value.js"

export const useAi = () => {

    const context = useContext(AiContext)
    const { interviewId } = useParams()

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const {
        loading, setLoading, generating, setGenerating, report, setReport,
        reports, setReports, usage, setUsage
    } = context

    const generateReport = async ({ jobDescription, selfDescription, resumeFile }) => {
        setGenerating(true)
        try {
            const response = await generateInterviewReport({ jobDescription, selfDescription, resumeFile })
            setReport(response.interviewReport)
            if (Object.values(response.aiUsage).some((value) => value !== null)) {
                setUsage(response.aiUsage)
            }
            return response.interviewReport
        } catch (error) {
            console.log(error)
            throw error
        } finally {
            setGenerating(false)
        }
    }

    const getReportById = async (interviewId) => {
        setLoading(true)
        let response = null
        try {
            response = await getInterviewReportById(interviewId)
            setReport(response.interviewReport)
            if (Object.values(response.aiUsage).some((value) => value !== null)) {
                setUsage(response.aiUsage)
            }
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
        return response?.interviewReport || null
    }

    const getReports = async () => {
        setLoading(true)
        let response = null
        try {
            response = await getAllInterviewReports()
            setReports(response.interviewReports)
            if (Object.values(response.aiUsage).some((value) => value !== null)) {
                setUsage(response.aiUsage)
            }
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }

        return response?.interviewReports || []
    }


    const loadReport = useEffectEvent((id) => getReportById(id))
    const loadReports = useEffectEvent(() => getReports())

    useEffect(() => {
        if (interviewId) {
            loadReport(interviewId)
        } else {
            loadReports()
        }
    }, [ interviewId ])

    return { loading, generating, report, reports, usage, generateReport, getReportById, getReports }

}
