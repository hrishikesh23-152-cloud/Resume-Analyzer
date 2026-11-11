import "../style/ai-usage.scss";

const formatUsage = (value) => value === null || value === undefined
    ? "—"
    : new Intl.NumberFormat().format(value);

const AIUsageSummary = ({ usage }) => {
    if (!usage) return null;

    const tokensUsed = usage.tokensUsedWindow ?? usage.tokensUsed;
    const requestCount = usage.requestsLimit === null
        ? formatUsage(usage.requestsUsed)
        : `${formatUsage(usage.requestsUsed)} / ${formatUsage(usage.requestsLimit)}`;

    return (
        <div className="ai-usage-summary" aria-label="AI token and request usage" aria-live="polite">
            <div className="ai-usage-summary__metric">
                <span>Tokens used</span>
                <strong>{formatUsage(tokensUsed)}</strong>
                <small>Last request: {formatUsage(usage.tokensUsed)}</small>
            </div>
            <div className="ai-usage-summary__metric">
                <span>Requests</span>
                <strong>{requestCount}</strong>
                <small>{formatUsage(usage.requestsRemaining)} remaining</small>
            </div>
        </div>
    );
};

export default AIUsageSummary;